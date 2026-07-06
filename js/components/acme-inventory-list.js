class AcmeInventoryList extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="card">
        <h3 class="card-title">Inventario completo</h3>
        <div class="search-bar">
          <input type="search" id="search-input" placeholder="Buscar por código, nombre o proveedor..." aria-label="Buscar productos">
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Proveedor</th>
                <th>Tipo</th>
                <th>Stock</th>
                <th>Fórmula</th>
              </tr>
            </thead>
            <tbody id="inventory-tbody"></tbody>
          </table>
        </div>
        <p id="result-count" class="empty-state" style="padding:0.5rem 0"></p>
      </section>
    `;

    this.querySelector('#search-input').addEventListener('input', () => this.renderTable());
    this.loadAndRender();
  }

  async loadAndRender() {
    this.allProducts = Object.values(await DataService.getProducts());
    this.renderTable();
  }

  renderTable() {
    const query = this.querySelector('#search-input').value.trim().toLowerCase();
    const filtered = this.allProducts.filter((p) => {
      if (!query) return true;
      return [p.codigo, p.nombre, p.proveedor, p.tipo]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });

    const tbody = this.querySelector('#inventory-tbody');

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No se encontraron productos</td></tr>`;
    } else {
      tbody.innerHTML = filtered
        .map((p) => {
          const tipoBadge =
            p.tipo === 'terminado'
              ? '<span class="badge badge-finished">Terminado</span>'
              : '<span class="badge badge-raw">Materia prima</span>';

          const formulaText =
            p.formula && p.formula.length
              ? p.formula
                  .map((f) => `${Helpers.escapeHtml(f.codigoMateriaPrima)} (${f.cantidad})`)
                  .join(', ')
              : '—';

          return `
          <tr>
            <td><strong>${Helpers.escapeHtml(p.codigo)}</strong></td>
            <td>${Helpers.escapeHtml(p.nombre)}</td>
            <td>${Helpers.escapeHtml(p.proveedor)}</td>
            <td>${tipoBadge}</td>
            <td><span class="stock-value">${Number(p.stock) || 0}</span></td>
            <td style="font-size:0.85rem;color:var(--color-text-muted)">${formulaText}</td>
          </tr>`;
        })
        .join('');
    }

    this.querySelector('#result-count').textContent =
      `${filtered.length} producto(s) mostrado(s)`;
  }
}

customElements.define('acme-inventory-list', AcmeInventoryList);

