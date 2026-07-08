class AcmeNavbar extends HTMLElement {
  connectedCallback() {
    const originalContent = this.innerHTML;
    const session = StorageService.getSession();
    const currentPage = this.getAttribute('active') || '';

    const links = [
      { href: 'dashboard.html', label: 'Inicio' },
      { href: 'usuarios.html', label: 'Usuarios' },
      { href: 'inventario.html', label: 'Inventario' },
      { href: 'inventarios.html', label: 'Lista inventario' },
      { href: 'produccion.html', label: 'Producción' }
    ];

    this.innerHTML = `
      <div class="top-nav">
        <div class="top-nav-left">
          <strong>${Helpers.escapeHtml(this.getAttribute('title') || 'ACME')}</strong>
        </div>

        <nav class="top-nav-links" aria-label="Navegación principal">
          ${links
            .map(
              (l) => `
                <a href="${l.href}" class="nav-link ${currentPage === l.href ? 'active' : ''}">${l.label}</a>
              `
            )
            .join('')}
        </nav>

        <div class="top-nav-right">
          <div class="user-meta">
            <span class="user-name">${Helpers.escapeHtml(session?.nombreCompleto || 'Usuario')}</span>
            ${session?.cargo ? `<span class="user-role">${Helpers.escapeHtml(session?.cargo)}</span>` : ''}
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="logout-btn">Cerrar sesión</button>
        </div>
      </div>

      <main class="page-content">
        ${originalContent}
      </main>
    `;

    this.querySelector('#logout-btn')?.addEventListener('click', () => Auth.logout());
  }
}

customElements.define('acme-navbar', AcmeNavbar);

