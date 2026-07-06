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

