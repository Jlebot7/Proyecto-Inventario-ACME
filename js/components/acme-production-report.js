class AcmeProductionReport extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.applyDateConstraints();
    this.querySelector('#report-form')?.addEventListener('submit', (e) => this.generarReporte(e));
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
      this.renderRows([]);
    });
  }

  getDateISO(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map((x) => Number(x));
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return dt.toISOString();
  }

  getTodayISODate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  applyDateConstraints() {
    const today = this.getTodayISODate();
    const inputInicio = this.querySelector('#fecha-inicio');
    const inputFin = this.querySelector('#fecha-fin');

    if (inputInicio) {
      inputInicio.max = today;
    }
    if (inputFin) {
      inputFin.max = today;
    }

    const validateAgainstToday = (input) => {
      if (!input?.value) return;
      if (input.value > today) input.value = today;
    };
    validateAgainstToday(inputInicio);
    validateAgainstToday(inputFin);

    const syncMinMaxBetweenInputs = () => {
      const inicioVal = inputInicio?.value;
      const finVal = inputFin?.value;

      if (inputFin) {
        inputFin.min = inicioVal || '';
      }

      if (inputInicio) {
        inputInicio.max = finVal || today;
      }
    };

    syncMinMaxBetweenInputs();

    inputInicio?.addEventListener('change', syncMinMaxBetweenInputs);
    inputInicio?.addEventListener('input', syncMinMaxBetweenInputs);
    inputFin?.addEventListener('change', syncMinMaxBetweenInputs);
    inputFin?.addEventListener('input', syncMinMaxBetweenInputs);
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

    const inputInicio = this.querySelector('#fecha-inicio');
    const inputFin = this.querySelector('#fecha-fin');
    const today = this.getTodayISODate();
    if (inputInicio?.value && inputInicio.value > today) inputInicio.value = today;
    if (inputFin?.value && inputFin.value > today) inputFin.value = today;

    const fechaInicio = inputInicio.value;
    const fechaFin = inputFin.value;

    if (fechaInicio > fechaFin) {
      Toast.error('La fecha inicio no puede ser más reciente que la fecha fin');
      return;
    }


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
          <td colspan="4" class="empty-state">Seleccione un rango y presione “Generar reporte”</td>
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
            <td>
              <strong>#${Helpers.escapeHtml(String(p.codigo))}</strong>
              <div class="subtle">${Helpers.escapeHtml((p.productos && p.productos[0] && p.productos[0].nombreProducto) ? p.productos[0].nombreProducto : '—')}</div>
            </td>
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

