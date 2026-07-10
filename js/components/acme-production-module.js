class AcmeProductionModule extends HTMLElement {
  constructor() {
    super();
    this.productionLines = [];
  }

  connectedCallback() {
    this.render();
    this.addProductionLine();
    this.loadHistory();
  }

  render() {
    this.innerHTML = `
      <div class="grid-2">
        <section class="card">
          <h3 class="card-title">Nuevo proceso productivo</h3>
          <form id="production-form">
            <div id="production-lines"></div>
            <button type="button" class="btn btn-secondary btn-sm" id="add-line">+ Agregar producto</button>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="run-production">Ejecutar producción</button>
            </div>
          </form>
        </section>

        <section class="card">
          <h3 class="card-title">Resumen del proceso</h3>
          <div id="production-summary">
            <p class="empty-state">El resumen aparecerá al completar un proceso productivo.</p>
          </div>
        </section>
      </div>

      <section class="card production-history">
        <h3 class="card-title">Historial de producción</h3>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Productos</th>
              </tr>
            </thead>
            <tbody id="history-tbody"></tbody>
          </table>
        </div>
      </section>
    `;

    this.querySelector('#add-line').addEventListener('click', () => this.addProductionLine());
    this.querySelector('#production-form').addEventListener('submit', (e) => this.handleSubmit(e));
  }

  addProductionLine() {
    const container = this.querySelector('#production-lines');
    const line = document.createElement('div');
    line.className = 'production-item';
    line.innerHTML = `
      <div class="form-row form-row-2">
        <div class="form-group">
          <label>Código producto terminado</label>
          <input type="text" class="line-code" placeholder="Ej: GAL001">
        </div>
        <div class="form-group">
          <label>Cantidad a fabricar</label>
          <input type="number" class="line-qty" min="1" step="1" value="1">
        </div>
      </div>
      <button type="button" class="btn btn-danger btn-sm remove-line">Quitar</button>
    `;

    line.querySelector('.remove-line').addEventListener('click', () => {
      line.remove();
      if (container.children.length === 0) this.addProductionLine();
    });

    container.appendChild(line);
  }

  getItemsFromForm() {
    const lines = this.querySelectorAll('#production-lines .production-item');
    const items = [];

    lines.forEach((line) => {
      const codigoProductoRaw = line.querySelector('.line-code').value;
      const cantidadRaw = line.querySelector('.line-qty').value;

      const codigoProducto = Helpers.assertNoEmpty(codigoProductoRaw, 'Código producto').toUpperCase();
      const cantidad = Helpers.normalizePositiveInt(cantidadRaw, `cantidad para ${codigoProducto}`);

      if (codigoProducto && cantidad > 0) {
        items.push({ codigoProducto, cantidad });
      }
    });

    return items;
  }

  showSummary(record, summary) {
    const container = this.querySelector('#production-summary');
    container.innerHTML = `
      <div class="alert alert-success">
        Proceso <strong>#${record.codigo}</strong> registrado · ${Helpers.formatDate(record.fecha)}
      </div>
      ${summary
        .map(
          (s) => `
        <div class="summary-block">
          <h4>${Helpers.escapeHtml(s.nombreProducto)} (${Helpers.escapeHtml(s.codigoProducto)})</h4>
          <p>Fabricado: <strong>${s.cantidadFabricada}</strong> unidad(es)</p>
          <p style="margin:0.5rem 0 0;font-size:0.85rem;color:var(--color-text-muted)">Materia prima utilizada:</p>
          <ul class="summary-ingredients">
            ${s.materiaPrimaUsada
              .map(
                (m) =>
                  `<li>${Helpers.escapeHtml(m.nombre)} (${Helpers.escapeHtml(m.codigo)}): ${m.cantidadUsada}</li>`
              )
              .join('')}
          </ul>
        </div>`
        )
        .join('')}
    `;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formEl = this.querySelector('#production-form');
    const submitBtn = this.querySelector('#run-production');
    const originalText = submitBtn?.textContent;

    const items = this.getItemsFromForm();
    const selectedDate = this.querySelector('#process-date').value;

    if (items.length === 0) {
      Toast.error('Agregue al menos un producto a fabricar');
      return;
    }

    if (items.some((i) => !Number.isInteger(i.cantidad) || i.cantidad <= 0)) {
      Toast.error('La producción requiere cantidades enteras positivas mayores a 0');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Ejecutando...';
    }

    try {
      const session = StorageService.getSession();

      const { record, summary } = await DataService.executeProduction(items, selectedDate, session?.identificacion);
      Toast.success(`Producción #${record.codigo} completada`);
      this.showSummary(record, summary);
      this.querySelector('#production-lines').innerHTML = '';
      this.addProductionLine();
      this.loadHistory();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
      formEl?.classList.remove('is-submitting');
    }
  }

  async loadHistory() {
    const productions = await DataService.getProductions();
    const entries = Object.values(productions).sort((a, b) => Number(b.codigo) - Number(a.codigo));

    const tbody = this.querySelector('#history-tbody');

    if (entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Sin procesos registrados</td></tr>`;
      return;
    }

    tbody.innerHTML = entries
      .map((p) => {
        const productosText = (p.productos || [])
          .map((pr) => `${pr.nombreProducto} (×${pr.cantidadFabricada})`)
          .join(', ');

        return `
        <tr>
          <td><strong>#${p.codigo}</strong></td>
          <td>${Helpers.formatDate(p.fecha)}</td>
          <td>${Helpers.escapeHtml(p.usuario || '—')}</td>
          <td>${Helpers.escapeHtml(productosText)}</td>
        </tr>`;
      })
      .join('');
  }
}

customElements.define('acme-production-module', AcmeProductionModule);

