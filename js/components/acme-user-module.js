class AcmeUserModule extends HTMLElement {
  constructor() {
    super();
    this.editingId = null;
  }

  connectedCallback() {
    this.render();
    this.loadUsers();
  }

  render() {
    this.innerHTML = `
      <div class="grid-2">
        <section class="card">
          <h3 class="card-title" id="form-title">Nuevo usuario</h3>
          <form id="user-form">
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
              <input type="password" id="password" placeholder="Mínimo 6 caracteres">
            </div>
            <div class="form-group" id="confirm-group">
              <label for="passwordConfirm">Confirmar contraseña</label>
              <input type="password" id="passwordConfirm">
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="save-btn">Guardar</button>
              <button type="button" class="btn btn-secondary" id="new-btn">Nuevo</button>
            </div>
          </form>
        </section>
        <section class="card">
          <h3 class="card-title">Usuarios registrados</h3>
          <ul class="user-list" id="user-list"></ul>
        </section>
      </div>
    `;

    this.querySelector('#user-form').addEventListener('submit', (e) => this.handleSubmit(e));
    this.querySelector('#new-btn').addEventListener('click', () => this.resetForm());
  }

  async loadUsers() {
    const users = await DataService.getUsers();
    const list = this.querySelector('#user-list');
    const entries = Object.values(users);

    if (entries.length === 0) {
      list.innerHTML = '<li class="empty-state">No hay usuarios registrados</li>';
      return;
    }

    list.innerHTML = entries
      .map(
        (u) => `
      <li class="list-item">
        <div class="list-item-info">
          <strong>${Helpers.escapeHtml(u.nombreCompleto)}</strong>
          <small>ID: ${Helpers.escapeHtml(u.identificacion)} · ${Helpers.escapeHtml(u.cargo)}</small>
        </div>
        <div class="list-item-actions">
          <button type="button" class="btn btn-secondary btn-sm btn-update" data-id="${Helpers.escapeHtml(u.identificacion)}">U</button>
          <button type="button" class="btn btn-danger btn-sm btn-delete" data-id="${Helpers.escapeHtml(u.identificacion)}">D</button>
        </div>
      </li>`
      )
      .join('');

    list.querySelectorAll('.btn-update').forEach((btn) => {
      btn.addEventListener('click', () => this.fillForm(btn.dataset.id, users));
    });

    list.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', () => this.deleteUser(btn.dataset.id));
    });
  }

  fillForm(id, users) {
    const user = users[id];
    if (!user) return;

    this.editingId = id;
    this.querySelector('#form-title').textContent = 'Actualizar usuario';
    this.querySelector('#identificacion').value = user.identificacion;
    this.querySelector('#identificacion').readOnly = true;
    this.querySelector('#nombreCompleto').value = user.nombreCompleto;
    this.querySelector('#cargo').value = user.cargo;
    this.querySelector('#password').value = '';
    this.querySelector('#passwordConfirm').value = '';
    this.querySelector('#save-btn').textContent = 'Guardar cambios';
  }

  resetForm() {
    this.editingId = null;
    this.querySelector('#form-title').textContent = 'Nuevo usuario';
    this.querySelector('#user-form').reset();
    this.querySelector('#identificacion').readOnly = false;
    this.querySelector('#save-btn').textContent = 'Guardar';
  }

  async handleSubmit(e) {
    e.preventDefault();

    const identificacion = this.querySelector('#identificacion').value.trim();
    const nombreCompleto = this.querySelector('#nombreCompleto').value.trim();
    const cargo = this.querySelector('#cargo').value.trim();
    const password = this.querySelector('#password').value;
    const passwordConfirm = this.querySelector('#passwordConfirm').value;

    const users = await DataService.getUsers();
    const isEdit = Boolean(this.editingId);

    if (!isEdit && users[identificacion]) {
      Toast.error('Ya existe un usuario con esa identificación');
      return;
    }

    if (password || !isEdit) {
      if (password !== passwordConfirm) {
        Toast.error('Las contraseñas no coinciden');
        return;
      }
      if (password.length < 6) {
        Toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    const userData = {
      identificacion,
      nombreCompleto,
      cargo,
      password: password || users[this.editingId]?.password
    };

    if (!userData.password) {
      Toast.error('Ingresar una contraseña');
      return;
    }

    await DataService.saveUser(identificacion, userData);
    Toast.success(isEdit ? 'Usuario actualizado' : 'Usuario creado');
    this.resetForm();
    this.loadUsers();
  }

  async deleteUser(id) {
    const session = StorageService.getSession();
    if (session?.identificacion === id) {
      Toast.error('No puede eliminar su propia sesion activa');
      return;
    }

    if (!confirm('¿Eliminar este usuario?')) return;

    await DataService.deleteUser(id);
    Toast.success('Usuario eliminado');
    if (this.editingId === id) this.resetForm();
    this.loadUsers();
  }
}

customElements.define('acme-user-module', AcmeUserModule);

