class AcmeInventoryModule extends HTMLElement {
  constructor() {
    super();
    this.editingCode = null;
    this.formulaItems = [];
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
    this.addFormulaRow();
  }

  render() {
    this.innerHTML = `
      <div class="grid-2">
        <section class="card">
          <h3 class="card-title" id="product-form-title">Crear producto</h3>
          <form id="product-form">
            <div class="form-row form-row-2">
              <div class="form-group">
                <label for="codigo">Código</label>
                <input type="text" id="codigo" required placeholder="Ej: MAN001">
              </div>
              <div class="form-group">
                <label for="tipo">Tipo</label>
                <select id="tipo" required>
                  <option value="materia_prima">Materia prima</option>
                  <option value="terminado">Producto terminado</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" required>
            </div>
            <div class="form-group">
              <label for="proveedor">Proveedor</label>
              <input type="text" id="proveedor" required>
            </div>
            <div class="formula-section" id="formula-section" hidden>
              <h4>Fórmula (materia prima por unidad)</h4>
              <div id="formula-rows"></div>
              <button type="button" class="btn btn-secondary btn-sm" id="add-formula-row">+ Ingrediente</button>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="product-save-btn">Guardar producto</button>
              <button type="button" class="btn btn-secondary" id="product-new-btn">Nuevo</button>
            </div>
          </form>
        </section>

        <section class="card">
          <h3 class="card-title">Ingresar al inventario</h3>
          <form id="stock-form">
            <div class="form-group">
              <label for="stock-codigo">Código del producto</label>
              <input type="text" id="stock-codigo" required placeholder="Código existente">
            </div>
            <div class="form-group">
              <label for="stock-cantidad">Cantidad a aumentar</label>
              <input type="number" id="stock-cantidad" min="1" step="any" required>
            </div>
            <button type="submit" class="btn btn-success">Incrementar stock</button>
          </form>
          <div class="alert alert-info" style="margin-top:1rem">
            Use el código del producto o materia prima para aumentar su saldo en inventario.
          </div>
        </section>
      </div>
    `;
  }

  setupEvents() {
    this.querySelector('#tipo').addEventListener('change', () => this.toggleFormula());
    this.querySelector('#add-formula-row').addEventListener('click', () => this.addFormulaRow());
    this.querySelector('#product-form').addEventListener('submit', (e) => this.handleProductSubmit(e));
    this.querySelector('#product-new-btn').addEventListener('click', () => this.resetProductForm());
    this.querySelector('#stock-form').addEventListener('submit', (e) => this.handleStockSubmit(e));
  }

  toggleFormula() {
    const isFinished = this.querySelector('#tipo').value === 'terminado';
    this.querySelector('#formula-section').hidden = !isFinished;
  }

  addFormulaRow(data = {}) {
    const container = this.querySelector('#formula-rows');
    const row = document.createElement('div');
    row.className = 'formula-row';
    row.innerHTML = `
      <div class="form-group" style="margin:0">
        <label>Código materia prima</label>
        <input type="text" class="formula-code" value="${Helpers.escapeHtml(data.codigoMateriaPrima || '')}" placeholder="MAN001">
      </div>
      <div class="form-group" style="margin:0">
        <label>Cantidad</label>
        <input type="number" class="formula-qty" min="0.01" step="any" value="${data.cantidad ?? ''}">
      </div>
      <button type="button" class="btn btn-danger btn-sm btn-icon remove-formula" title="Quitar">✕</button>
    `;
    row.querySelector('.remove-formula').addEventListener('click', () => {
      row.remove();
      if (container.children.length === 0) this.addFormulaRow();
    });
    container.appendChild(row);
  }

  getFormulaFromForm() {
    const rows = this.querySelectorAll('#formula-rows .formula-row');
    const formula = [];
    rows.forEach((row) => {
      const codigoMateriaPrima = row.querySelector('.formula-code').value.trim();
      const cantidad = Number(row.querySelector('.formula-qty').value);
      if (codigoMateriaPrima && cantidad > 0) {
        formula.push({ codigoMateriaPrima, cantidad });
      }
    });
    return formula;
  }

  async handleProductSubmit(e) {
    e.preventDefault();

    const codigo = this.querySelector('#codigo').value.trim().toUpperCase();
    const nombre = this.querySelector('#nombre').value.trim();
    const proveedor = this.querySelector('#proveedor').value.trim();
    const tipo = this.querySelector('#tipo').value;
    const formula = tipo === 'terminado' ? this.getFormulaFromForm() : [];

    if (tipo === 'terminado' && formula.length === 0) {
      Toast.error('Los productos terminados requieren al menos un ingrediente en la fórmula');
      return;
    }

    const products = await DataService.getProducts();
    if (!this.editingCode && products[codigo]) {
      Toast.error('Ya existe un producto con ese código');
      return;
    }

    await DataService.saveProduct(codigo, {
      codigo,
      nombre,
      proveedor,
      tipo,
      formula
    });

    Toast.success(this.editingCode ? 'Producto actualizado' : 'Producto creado');
    this.resetProductForm();
  }

  resetProductForm() {
    this.editingCode = null;
    this.querySelector('#product-form-title').textContent = 'Crear producto';
    this.querySelector('#product-form').reset();
    this.querySelector('#codigo').readOnly = false;
    this.querySelector('#formula-rows').innerHTML = '';
    this.addFormulaRow();
    this.toggleFormula();
  }

  async handleStockSubmit(e) {
    e.preventDefault();
    const codigo = this.querySelector('#stock-codigo').value.trim().toUpperCase();
    const cantidad = this.querySelector('#stock-cantidad').value;

    try {
      const product = await DataService.addStock(codigo, cantidad);
      Toast.success(`Stock de ${product.nombre}: ${product.stock} unidades`);
      this.querySelector('#stock-form').reset();
    } catch (err) {
      Toast.error(err.message);
    }
  }
}

customElements.define('acme-inventory-module', AcmeInventoryModule);
