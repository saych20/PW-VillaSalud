// roles.js - mapping de roles a permisos en el backend
module.exports = {
  admin: {
    nombre: 'Administrador',
    permisos: [
      'dashboard.view',
      'sistema.configurar',
      'notificaciones.ver','notificaciones.enviar',
      'chat.ver','chat.usar',
      'inventario.ver','inventario.editar','backup.ejecutar',
      'usuarios.crear','usuarios.editar','usuarios.eliminar','usuarios.ver',
      'roles.gestionar',
      'citas.crear','citas.editar','citas.eliminar','citas.ver',
      'pacientes.crear','pacientes.editar','pacientes.eliminar','pacientes.ver',
      'empresas.crear','empresas.editar','empresas.eliminar','empresas.ver',
      'medicos.crear','medicos.editar','medicos.eliminar','medicos.ver',
      'examenes.crear','examenes.editar','examenes.eliminar','examenes.ver',
      'reportes.ver','reportes.generar'
    ]
  },
  admisionista: {
    nombre: 'Admisionista',
    permisos: [
      'dashboard.view',
      'pacientes.crear','pacientes.editar','pacientes.ver',
      'empresas.crear','empresas.editar','empresas.ver',
      'medicos.ver',
      'examenes.crear','examenes.editar','examenes.ver',
      'reportes.ver'
    ]
  },
  medico: {
    nombre: 'Médico',
    permisos: [
      'dashboard.view',
      'pacientes.ver',
      'examenes.ver','examenes.completar',
      'resultados.ver','resultados.completar',
      'medicos.ver'
    ]
  },
  tecnico: {
    nombre: 'Técnico',
    permisos: [
      'dashboard.view',
      // Gestión permitida: crear y editar, pero no eliminar
      'pacientes.crear','pacientes.editar','pacientes.ver',
      'empresas.crear','empresas.editar','empresas.ver',
      'medicos.crear','medicos.editar','medicos.ver',
      'examenes.crear','examenes.editar','examenes.ver',
      'resultados.completar','resultados.ver'
    ]
  },
  empresa: {
    nombre: 'Empresa',
    permisos: [
      'dashboard.view',
      'examenes.programar','examenes.ver_propios',
      'resultados.ver_propios','reportes.ver_propios'
    ]
  }
};
