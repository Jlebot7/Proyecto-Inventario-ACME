class AcmeProductionReport extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.querySelector('#report-form')?.addEventListener('submit', (e) => this.generarReporte(e));
    this.loadHistory();
  }

  render() {
    this.innerHTML = `
      <section class="card">
        <h3 class="card-title">Reportes de producción</h3>

        <form id="report-form">
          <div class="form-row form-row-2">
            <div class="form-group">
              <label for="fecha-inicio">Fecha inicio</label>
              <input type="date" id="fecha-inicio" required>
            </div>
            <div class="form-group">
              <label for="fecha-fin">Fecha fin</label>
              <input type="date" id="fecha-fin" required>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="btn-generar">Generar reporte</button>
            <button type="button" class="btn btn-secondary" id="btn-limpiar">Limpiar</button>
          </div>
        </form>

        <div class="alert alert-info" style="margin-top:1rem">
          Los reportes muestran los procesos registrados entre el rango de fechas seleccionado.
        </div>

        <div class="production-history">
          <h3 class="card-title" style="margin-top:1.25rem">Historial</h3>
          <div class="table-wrap" style="margin-top: 0.75rem;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Productos</th>
                </tr>
              </thead>
              <tbody id="report-tbody"></tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    this.querySelector('#btn-limpiar')?.addEventListener('click', () => {
      this.querySelector('#report-form')?.reset();
      this.loadHistory();
    });
  }

  getDateISO(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map((x) => Number(x));
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return dt.toISOString();
  }

  isWithinRange(isoDate, fechaInicio, fechaFin) {
    if (!isoDate) return false;
    const t = new Date(isoDate).getTime();
    const a = this.getDateISO(fechaInicio);
    const b = this.getDateISO(fechaFin);
    if (!a || !b) return true;
    const start = new Date(a).getTime();
    const end = new Date(b).getTime();
    return t >= start && t <= end;
  }

  async generarReporte(e) {
    e.preventDefault();

    const fechaInicio = this.querySelector('#fecha-inicio').value;
    const fechaFin = this.querySelector('#fecha-fin').value;

    if (!fechaInicio || !fechaFin) {
      Toast.error('Seleccione un rango de fechas válido');
      return;
    }

    const productions = await DataService.getProductions();
    const arrayProducciones = Object.values(productions || {});

    const filtradas = arrayProducciones
      .filter((p) => this.isWithinRange(p.fecha, fechaInicio, fechaFin))
      .sort((a, b) => Number(b.codigo) - Number(a.codigo));

    this.renderRows(filtradas);

    if (filtradas.length === 0) {
      Toast.success('No hay procesos en ese rango');
    }
  }

  renderRows(entries) {
    const tbody = this.querySelector('#report-tbody');

    if (!entries || entries.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state">Sin procesos registrados</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = entries
      .map((p) => {
        const productosText = (p.productos || [])
          .map((pr) => `${pr.nombreProducto} (×${pr.cantidadFabricada})`)
          .join(', ');

        return `
          <tr>
            <td><strong>#${Helpers.escapeHtml(String(p.codigo))}</strong></td>
            <td>${Helpers.escapeHtml(p.fecha ? Helpers.formatDate(p.fecha) : '—')}</td>
            <td>${Helpers.escapeHtml(p.usuario || '—')}</td>
            <td>${Helpers.escapeHtml(productosText || '—')}</td>
          </tr>
        `;
      })
      .join('');
  }

  async loadHistory() {
    const productions = await DataService.getProductions();
    const entries = Object.values(productions || {}).sort((a, b) => Number(b.codigo) - Number(a.codigo));
    this.renderRows(entries);
  }
}

customElements.define('acme-production-report', AcmeProductionReport);

