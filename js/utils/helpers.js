const Toast = {
  container: null,

  ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
    return this.container;
  },

  show(message, type = 'success', duration = 3500) {
    const container = this.ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },

  success(message) {
    this.show(message, 'success');
  },

  error(message) {
    this.show(message, 'error');
  }
};

const Auth = {
  requireAuth(redirectTo = 'login.html') {
    const session = StorageService.getSession();
    if (!session) {
      window.location.href = redirectTo;
      return null;
    }
    return session;
  },

  logout() {
    StorageService.setSession(null);
    window.location.href = 'login.html';
  },

  redirectIfAuthenticated(target = 'dashboard.html') {
    if (StorageService.getSession()) {
      window.location.href = target;
    }
  }
};

const Helpers = {
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
  },

  assertNoEmpty(value, fieldName = 'campo') {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} no puede ser vacío.`);
    }
    const str = typeof value === 'string' ? value : String(value);
    if (str.trim().length === 0) {
      throw new Error(`${fieldName} no puede estar vacío.`);
    }
    return str;
  },

  normalizeNumericId(value, fieldName = 'ID') {
    const str = this.assertNoEmpty(value, fieldName);
    const digits = str.replace(/\D/g, '');

    if (!/^\d+$/.test(str)) {
      throw new Error(`${fieldName} debe ser numérico.`);
    }

    if (digits.length === 0 || digits.length > 15) {
      throw new Error(`${fieldName} debe tener máximo 15 dígitos.`);
    }
    return digits;
  },

  normalizeName(value, fieldName = 'nombre') {
    const raw = this.assertNoEmpty(value, fieldName);
    const trimmed = raw.trim();

    if (trimmed !== raw) {

      throw new Error(`${fieldName} no puede iniciar o terminar con espacios.`);
    }

    const normalizedSpaces = trimmed.replace(/\s+/g, ' ');

    if (normalizedSpaces !== trimmed) {
      throw new Error(`${fieldName} no puede contener espacios duplicados.`);
    }

    if (normalizedSpaces.startsWith(' ') || normalizedSpaces.endsWith(' ')) {

      throw new Error(`${fieldName} no puede iniciar o terminar con espacios.`);
    }

    const allowed = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ]+( [A-Za-zÀ-ÖØ-öø-ÿÑñ]+)*$/;

    if (!allowed.test(normalizedSpaces)) {
      throw new Error(`${fieldName} solo puede contener letras y espacios.`);
    }

    const lettersOnly = normalizedSpaces.replace(/\s/g, '');

    if (lettersOnly.length < 3) {
      throw new Error(`${fieldName} debe tener mínimo 3 letras.`);
    }

    return normalizedSpaces;
  },

  normalizePositiveInt(value, fieldName = 'cantidad') {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} no puede ser vacío.`);
    }

    // Acepta string/number
    if (typeof value === 'string') {
      const str = value.trim();
      if (str.length === 0) throw new Error(`${fieldName} no puede estar vacío.`);
      if (!/^\d+$/.test(str)) {
        throw new Error(`${fieldName} debe ser un entero positivo.`);
      }
      const num = Number(str);
      if (!Number.isSafeInteger(num) || num <= 0) {
        throw new Error(`${fieldName} debe ser un entero positivo mayor a 0.`);
      }
      return num;
    }

    const num = Number(value);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) {
      throw new Error(`${fieldName} debe ser un entero positivo mayor a 0.`);
    }
    return num;
  },

  formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }
};


const Theme = {
  init() {
    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) document.documentElement.classList.add('light-theme');
  },
  toggle() {
    document.documentElement.classList.toggle('light-theme');
    localStorage.setItem('theme', document.documentElement.classList.contains('light-theme') ? 'light' : 'dark');
  }
};
Theme.init();

