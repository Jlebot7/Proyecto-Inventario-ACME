class AcmeNavbar extends HTMLElement {
  connectedCallback() {
    const originalContent = this.innerHTML;
    const session = StorageService.getSession();
    const currentPage = this.getAttribute('active') || '';

    const links = [
      { href: 'dashboard.html', label: 'Inicio', icon: '🏠' },
      { href: 'usuarios.html', label: 'Usuarios', icon: '👥' },
      { href: 'inventario.html', label: 'Inventario', icon: '📦' },
      { href: 'inventarios.html', label: 'Lista inventario', icon: '📋' },
      { href: 'produccion.html', label: 'Producción', icon: '⚙️' }
    ];

    this.innerHTML = `
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <h1>ACME Macondo</h1>
          <span>Sistema de producción</span>
        </div>
        <nav class="sidebar-nav">
          ${links
            .map(
              (l) => `
            <a href="${l.href}" class="nav-link ${currentPage === l.href ? 'active' : ''}">
              <span>${l.icon}</span> ${l.label}
            </a>`
            )
            .join('')}
        </nav>
        <div class="sidebar-footer">
          <span class="user-name">${Helpers.escapeHtml(session?.nombreCompleto || 'Usuario')}</span>
          <span class="user-role">${Helpers.escapeHtml(session?.cargo || '')}</span>
          <button type="button" class="btn btn-secondary btn-sm" id="logout-btn" style="margin-top:0.75rem;width:100%">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div class="main-content">
        <header class="topbar" style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:1rem;">
            <button type="button" class="menu-toggle" id="menu-toggle" aria-label="Abrir menú">☰</button>
            <strong>${Helpers.escapeHtml(this.getAttribute('title') || 'ACME')}</strong>
          </div>
          <button type="button" class="btn btn-icon" id="theme-toggle" style="background: transparent; color: var(--color-text); font-size: 1.2rem; border: none; cursor: pointer;" title="Cambiar tema">🌗</button>
        </header>
        <main class="page-content">
          ${originalContent}
        </main>
      </div>
    `;

    this.querySelector('#logout-btn').addEventListener('click', () => Auth.logout());
    this.querySelector('#theme-toggle').addEventListener('click', () => Theme.toggle());

    const sidebar = this.querySelector('#sidebar');
    const overlay = this.querySelector('#sidebar-overlay');
    const toggle = this.querySelector('#menu-toggle');

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }
}

customElements.define('acme-navbar', AcmeNavbar);

