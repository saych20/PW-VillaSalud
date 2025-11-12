// auth-guard.js - utilidades para proteger vistas en frontend
(function(){
  // Redirige a login o a dashboard si el usuario no está autenticado o no tiene permisos
  function getUser(){
    try{ const u = localStorage.getItem('policlinico_user'); return u? JSON.parse(u): null;}catch(e){return null}
  }

  function getPerms(){
    try{
      const p = localStorage.getItem('policlinico_permisos');
      if (p) return JSON.parse(p);
      const user = getUser();
      return user?.permisos || [];
    }catch(e){return []}
  }

  function hasPermission(permission){
    if (!permission) return true;
    try{
      const perms = getPerms();
      if (!perms || perms.length === 0) return false;
      if (Array.isArray(permission)) {
        return permission.some(p => perms.includes(p));
      }
      return perms.includes(permission);
    }catch(e){ return false }
  }

  function requireAuth(redirectTo){
    const user = getUser();
    if (!user) {
      window.location.href = redirectTo || '/index.html';
      return false;
    }
    return true;
  }

  function requirePermission(permission, redirectTo){
    if (!requireAuth(redirectTo)) return false;
    if (!hasPermission(permission)) {
      // redirigir a dashboard segun rol
      const user = getUser();
      const rol = user?.rol;
      const dashboardMap = {
        'admin': 'dashboard-admin.html',
        'admisionista': 'dashboard-admisionista.html',
        'medico': 'dashboard-medico.html',
        'tecnico': 'dashboard-tecnico.html',
        'empresa': 'dashboard-empresa.html'
      };
      window.location.href = redirectTo || dashboardMap[rol] || '/index.html';
      return false;
    }
    return true;
  }

  // Inicializador para una página: pasa el permiso requerido (string o array)
  window.initGuardForPage = function(requiredPermission, options = {}){
    const redirect = options.redirect || null;
    // Si no autenticado -> redirect
    if (!requireAuth(redirect)) return;
    // Si no tiene permiso -> redirect
    if (!requirePermission(requiredPermission, redirect)) return;
    // else todo ok
    return true;
  };

  window.authHasPermission = hasPermission;
})();
