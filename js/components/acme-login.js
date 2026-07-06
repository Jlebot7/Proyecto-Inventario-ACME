class AcmeLogin extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="login-card">
        <div class="login-brand" style="position: relative;">
          <button type="button" class="btn btn-icon" id="theme-toggle" style="position: absolute; right: 0; top: 0; background: transparent; color: var(--color-text); font-size: 1.2rem; border: none; cursor: pointer;" title="Cambiar tema">🌗</button>
          <h1>ACME Macondo</h1>
          <p>Sistema de producción industrial</p>
        </div>
        <div id="login-alert"></div>
        <form id="login-form">
          <div class="form-group">
            <label for="identificacion">Número de identificación</label>
            <input type="text" id="identificacion" inputmode="numeric" placeholder="12345678" required>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="password-wrapper">
              <input type="password" id="password" placeholder="Contraseña" required>
              <span class="toggle-password" id="toggle-password" title="Mostrar/ocultar">👁️</span>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Ingresar</button>
        </form>
        <div class="login-footer">
          <p>¿No tiene cuenta? <a href="registro.html">Registrar usuario</a></p>
        </div>
      </div>
    `;

    const passwordInput = this.querySelector('#password');
    const toggleIcon = this.querySelector('#toggle-password');

    passwordInput.addEventListener('input', () => {
      toggleIcon.classList.toggle('visible', passwordInput.value.length > 0);
    });

    toggleIcon.addEventListener('click', () => {
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    });

    this.querySelector('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertEl = this.querySelector('#login-alert');
      alertEl.innerHTML = '';

      const identificacion = this.querySelector('#identificacion').value.trim();
      const password = this.querySelector('#password').value;

      try {
        await DataService.init();
        const session = await DataService.authenticate(identificacion, password);
        if (session) {
          Toast.success('Bienvenido, ' + session.nombreCompleto);
          window.location.href = 'dashboard.html';
        } else {
          alertEl.innerHTML = '<div class="alert alert-error">ID o contraseña incorrectos.</div>';
        }
      } catch (err) {
        alertEl.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(err.message)}</div>`;
      }
    });

    this.querySelector('#theme-toggle').addEventListener('click', () => Theme.toggle());
  }
}

customElements.define('acme-login', AcmeLogin);

