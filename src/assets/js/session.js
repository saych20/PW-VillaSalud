// session.js - maneja logout consistente en todas las vistas
(function(){
  window.logout = async function(){
    try{
      // Llamar al endpoint de logout si existe el cliente API
      if (window.api && typeof window.api.logout === 'function'){
        await window.api.logout();
      }
    }catch(err){
      console.error('Error en logout API:', err);
    }finally{
      // Limpieza de claves relacionadas con sesión
      try{ localStorage.removeItem('policlinico_user'); }catch(e){}
      try{ localStorage.removeItem('authToken'); }catch(e){}
  try{ localStorage.removeItem('policlinico_permisos'); }catch(e){}
  try{ localStorage.removeItem('policlinico_user'); }catch(e){}
      // Redirigir a pantalla de login
      window.location.href = '/index.html';
    }
  };

  // Atachar handler global para elementos con clase logout-btn
  document.addEventListener('click', function(e){
    if (e.target.classList && e.target.classList.contains('logout-btn')){
      e.preventDefault();
      window.logout();
    }
    // soportar clicks en contenedores dentro del enlace
    if (e.target.closest && e.target.closest('.logout-btn')){
      e.preventDefault();
      window.logout();
    }
  });
  // Helper para verificar permisos en UI (usa roles locales si existen)
  window.hasPermission = function(permission){
    try{
      const userRaw = localStorage.getItem('policlinico_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (!user) return false;
      const permsRaw = localStorage.getItem('policlinico_permisos');
      const perms = permsRaw ? JSON.parse(permsRaw) : user.permisos || [];
      if (!permission) return true;
      return perms.includes(permission);
    }catch(err){
      console.error('Error verificando permiso:', err);
      return false;
    }
  };
})();
