class AcmeUserRegister extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="login-card" style="max-width:480px">
        <div class="login-brand" style="position: relative;">
          <button type="button" class="btn btn-icon" id="theme-toggle" style="position: absolute; right: 0; top: 0; background: transparent; color: var(--color-text); font-size: 1.2rem; border: none; cursor: pointer;" title="Cambiar tema">🌗</button>
          <h1>Registro de usuario</h1>
          <p>Complete los datos para acceder al sistema</p>
        </div>
        <div id="register-alert"></div>
        <form id="register-form">
          <div class="form-group">
            <label for="identificacion">Número de identificación</label>
            <input type="text" id="identificacion" inputmode="numeric" required>
          </div>
          <div class="form-group">
            <label for="nombreCompleto">Nombre completo</label>
            <input type="text" id="nombreCompleto" required>
          </div>
          <div class="form-group">
            <label for="cargo">Cargo</label>
            <select id="cargo" required>
              <option value="" disabled selected>Seleccione un cargo...</option>
              <option value="Operador">Operador</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" required minlength="6">
          </div>
          <div class="form-group">
            <label for="passwordConfirm">Confirmar contraseña</label>
            <input type="password" id="passwordConfirm" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%">Registrar</button>
        </form>
        <div class="login-footer">
          <a href="login.html">← Volver al login</a>
        </div>
      </div>
    `;

    this.querySelector('#register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertEl = this.querySelector('#register-alert');
      alertEl.innerHTML = '';

      const identificacionRaw = this.querySelector('#identificacion').value;
      const nombreCompletoRaw = this.querySelector('#nombreCompleto').value;
      const cargoRaw = this.querySelector('#cargo').value;
      const passwordRaw = this.querySelector('#password').value;
      const passwordConfirmRaw = this.querySelector('#passwordConfirm').value;

      const identificacion = Helpers.normalizeNumericId(identificacionRaw, 'Identificación');
      const nombreCompleto = Helpers.normalizeName(nombreCompletoRaw, 'Nombre completo');
      const cargo = Helpers.assertNoEmpty(cargoRaw, 'Cargo');
      const password = Helpers.assertNoEmpty(passwordRaw, 'Contraseña');
      const passwordConfirm = Helpers.assertNoEmpty(passwordConfirmRaw, 'Confirmación de contraseña');

      if (password !== passwordConfirm) {
        alertEl.innerHTML = '<div class="alert alert-error">Las contraseñas no coinciden.</div>';
        return;
      }


      if (password.length < 6) {
        alertEl.innerHTML = '<div class="alert alert-error">La contraseña debe tener al menos 6 caracteres.</div>';
        return;
      }

      Helpers.assertNoEmpty(cargo, 'Cargo');





      try {
        await DataService.init();
        const users = await DataService.getUsers();
        if (users[identificacion]) {
          alertEl.innerHTML = '<div class="alert alert-error">Ya existe un usuario con esa identificación.</div>';
          return;
        }

        await DataService.saveUser(identificacion, {
          identificacion,
          nombreCompleto,
          cargo,
          password
        });


        alertEl.innerHTML = '<div class="alert alert-success">Usuario registrado. Redirigiendo al login...</div>';
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      } catch (err) {
        alertEl.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(err.message)}</div>`;
      }
    });

    this.querySelector('#theme-toggle').addEventListener('click', () => Theme.toggle());
  }
}

customElements.define('acme-user-register', AcmeUserRegister);

