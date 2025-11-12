// sidebar.js - genera el sidebar según el usuario y sus permisos
(function(){
  function getCurrentUser(){
    try{ const u = localStorage.getItem('policlinico_user'); return u? JSON.parse(u): null;}catch(e){return null}
  }

  // Menú unificado con soporte para submenús
  const modules = [
    { id: 'dashboard', label: 'Dashboard', href: 'dashboard-admin.html', perm: null },
    { id: 'configuracion', label: 'Configuración', href: 'configuracion.html', perm: 'sistema.configurar' },
    { id: 'notificaciones', label: 'Notificaciones', href: 'notificaciones.html', perm: 'notificaciones.ver' },
    { id: 'chat', label: 'Chat interno', href: 'chat.html', perm: 'chat.ver' },
    { id: 'inventario_backup', label: 'Inventario / Backup', perm: null, children: [
        { id: 'inventario', label: 'Inventario', href: 'inventario.html', perm: 'inventario.ver' },
        { id: 'backup', label: 'Backup', href: 'backup.html', perm: 'backup.ejecutar' }
      ]
    },
    { id: 'usuarios', label: 'Gestión de usuarios', href: 'usuarios.html', perm: 'usuarios.ver' },
    { id: 'roles', label: 'Roles y permisos', href: 'roles-permisos.html', perm: 'roles.gestionar' },
    { id: 'citas', label: 'Gestión de citas', href: 'citas.html', perm: 'citas.ver' },
    // Las cuatro entradas principales que deben mostrarse con ese nombre para todos
    { id: 'pacientes', label: 'Gestión de pacientes', href: 'pacientes.html', perm: 'pacientes.ver' },
    { id: 'empresas', label: 'Gestión de empresas', href: 'empresas.html', perm: 'empresas.ver' },
    { id: 'medicos', label: 'Gestión de médicos', href: 'trabajadores.html', perm: 'medicos.ver' },
    { id: 'examenes', label: 'Gestión de exámenes', href: 'examenes.html', perm: 'examenes.ver' },
    { id: 'logout', label: 'Cerrar sesión', href: '#', perm: null }
  ];

  function hasPerm(permission){
    // Si el módulo no requiere permiso explícito (null), se muestra
    if (!permission) return true;

    // 1) Si hay lista explícita de permisos en localStorage bajo policlinico_permisos
    try{
      const stored = localStorage.getItem('policlinico_permisos');
      if (stored) {
        const perms = JSON.parse(stored);
        if (Array.isArray(perms) && perms.includes(permission)) return true;
        // también puede venir como objeto por rol -> { rol: [...] }
        if (typeof perms === 'object' && perms !== null) {
          const u = getCurrentUser();
          const rolePerms = perms[u?.rol];
          if (Array.isArray(rolePerms) && rolePerms.includes(permission)) return true;
        }
      }
    }catch(e){/* ignore parse errors */}

    // 2) Si el objeto usuario tiene permisos embebidos
    const u = getCurrentUser();
    if (u && Array.isArray(u.permisos) && u.permisos.includes(permission)) return true;

    // 3) Fallback a DB local (window.db.hasPermission(userRole, permission))
    if (window.db && u && typeof window.db.hasPermission === 'function') {
      try{
        if (window.db.hasPermission(u.rol, permission)) return true;
      }catch(e){}
    }

    // 4) Admin siempre tiene acceso
    if (u && u.rol === 'admin') return true;

    return false;
  }

  function buildSidebar(){
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const user = getCurrentUser();
    const roleName = user?.rol || 'Invitado';
    const displayName = user?.nombre || user?.email || 'Usuario';

    const headerHtml = `
      <div class="sidebar-header">
        <h2><i class="fas fa-user-circle"></i> ${displayName}</h2>
        <p>${roleName.charAt(0).toUpperCase() + roleName.slice(1)}</p>
      </div>
    `;

    let navHtml = '<div class="sidebar-nav">';
    const alwaysVisibleIds = ['pacientes', 'empresas', 'medicos', 'examenes'];

    modules.forEach(mod => {
      const isLogout = mod.id === 'logout';

      // Dashboard siempre
      if (mod.id === 'dashboard') {
        navHtml += `<a href="${mod.href}" class="nav-item" data-module="${mod.id}"><i class="fas fa-angle-right"></i> ${mod.label}</a>`;
        return;
      }

      if (isLogout) {
        navHtml += `<a href="#" class="nav-item logout-btn"><i class="fas fa-sign-out-alt"></i> ${mod.label}</a>`;
        return;
      }

      // Si el módulo tiene submenú (children)
      if (Array.isArray(mod.children) && mod.children.length > 0) {
        // Verificar visibilidad de hijos
        const childHtmlParts = [];
        for (const child of mod.children) {
          const childVisible = hasPerm(child.perm);
          if (childVisible) {
            childHtmlParts.push(`<a href="${child.href}" class="nav-subitem" data-module="${child.id}"><i class="fas fa-angle-right"></i> ${child.label}</a>`);
          }
        }

        if (childHtmlParts.length > 0) {
          // Render parent with children
          navHtml += `<div class="nav-parent" data-module="${mod.id}"><div class="nav-item parent-label"><i class="fas fa-folder"></i> ${mod.label}</div><div class="nav-children">${childHtmlParts.join('')}</div></div>`;
        } else {
          // si no hay hijos visibles, no mostrar el parent
        }

        return;
      }

      // Si es una de las cuatro entradas principales, mostrar siempre
      if (alwaysVisibleIds.includes(mod.id)) {
        const visible = hasPerm(mod.perm);
        if (visible) {
          navHtml += `<a href="${mod.href}" class="nav-item" data-module="${mod.id}"><i class="fas fa-angle-right"></i> ${mod.label}</a>`;
        } else {
          navHtml += `<div class="nav-item disabled" data-module="${mod.id}" title="No tienes permisos para acceder a este módulo"><i class="fas fa-lock"></i> ${mod.label}</div>`;
        }
        return;
      }

      // Para módulos regulares: solo mostrar si tiene permiso
      if (hasPerm(mod.perm)) {
        navHtml += `<a href="${mod.href}" class="nav-item" data-module="${mod.id}"><i class="fas fa-angle-right"></i> ${mod.label}</a>`;
      }
    });

    navHtml += '</div>';

    sidebar.innerHTML = headerHtml + navHtml;

    // mark active item based on current path
    const path = window.location.pathname.split('/').pop();
    const links = sidebar.querySelectorAll('.sidebar-nav a.nav-item');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href === path) {
        a.classList.add('active');
      }
    });

    // Add title tooltip for disabled items
    const disabled = sidebar.querySelectorAll('.nav-item.disabled');
    disabled.forEach(d => {
      d.setAttribute('title', 'No tienes permiso para ver este módulo');
      d.style.opacity = '0.5';
      d.style.cursor = 'not-allowed';
      d.addEventListener('click', (e)=> e.preventDefault());
    });
  }

  // Build sidebar on DOM ready
  document.addEventListener('DOMContentLoaded', buildSidebar);
  // Also in case scripts load later
  setTimeout(buildSidebar, 300);
})();
