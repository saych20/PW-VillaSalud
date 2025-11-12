// Base de datos del Sistema Policlínico Villa Salud SRL
class Database {
    constructor() {
        this.init();
    }

    init() {
        // Inicializar datos por defecto si no existen
        if (!localStorage.getItem('policlinico_users')) {
            this.initDefaultUsers();
        }
        if (!localStorage.getItem('policlinico_pacientes')) {
            this.initDefaultPacientes();
        }
        if (!localStorage.getItem('policlinico_empresas')) {
            this.initDefaultEmpresas();
        }
        if (!localStorage.getItem('policlinico_examenes')) {
            this.initDefaultExamenes();
        }
        // Eliminado: módulo de citas
        if (!localStorage.getItem('policlinico_resultados')) {
            this.initDefaultResultados();
        }
        if (!localStorage.getItem('policlinico_roles_permisos')) {
            this.initDefaultRolesPermisos();
        }
        if (!localStorage.getItem('policlinico_tipos_examenes')) {
            this.initDefaultTiposExamenes();
        }
        if (!localStorage.getItem('policlinico_medicos')) {
            this.initDefaultMedicos();
        }
    }

    // Usuarios del sistema
    initDefaultUsers() {
        const users = [
            {
                id: 1,
                email: 'admin@policlinico.com',
                password: 'admin123',
                rol: 'admin',
                nombre: 'Administrador',
                apellidos: 'Sistema',
                activo: true,
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 2,
                email: 'admisionista@policlinico.com',
                password: 'admisionista123',
                rol: 'admisionista',
                nombre: 'María',
                apellidos: 'González',
                activo: true,
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 3,
                email: 'medico@policlinico.com',
                password: 'medico123',
                rol: 'medico',
                nombre: 'Dr. Carlos',
                apellidos: 'Rodríguez',
                especialidad: 'Medicina Ocupacional',
                activo: true,
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 4,
                email: 'tecnico@policlinico.com',
                password: 'tecnico123',
                rol: 'tecnico',
                nombre: 'Ana',
                apellidos: 'López',
                especialidad: null,
                activo: true,
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 5,
                email: 'empresa1@empresa.com',
                password: 'empresa123',
                rol: 'empresa',
                nombre: 'Empresa',
                apellidos: 'ABC S.A.C.',
                empresaId: 1,
                activo: true,
                fechaCreacion: new Date().toISOString()
            }
        ];
        localStorage.setItem('policlinico_users', JSON.stringify(users));
    }

    // Pacientes
    initDefaultPacientes() {
        const pacientes = [
            {
                id: 1,
                codigo: 'PAC001',
                nombres: 'Juan',
                apellidos: 'Pérez García',
                dni: '12345678',
                fechaNacimiento: '1985-05-15',
                telefono: '987654321',
                email: 'juan.perez@email.com',
                direccion: 'Av. Principal 123, Lima',
                empresaId: 1,
                activo: true,
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 2,
                codigo: 'PAC002',
                nombres: 'María',
                apellidos: 'López Silva',
                dni: '87654321',
                fechaNacimiento: '1990-08-22',
                telefono: '987123456',
                email: 'maria.lopez@email.com',
                direccion: 'Jr. Secundario 456, Lima',
                empresaId: 1,
                activo: true,
                fechaCreacion: new Date().toISOString()
            }
        ];
        localStorage.setItem('policlinico_pacientes', JSON.stringify(pacientes));
    }

    // Empresas
    initDefaultEmpresas() {
        const empresas = [
            {
                id: 1,
                razonSocial: 'Empresa ABC S.A.C.',
                ruc: '20123456789',
                direccion: 'Av. Industrial 123, Lima',
                telefono: '01-2345678',
                email: 'contacto@empresaabc.com',
                representanteLegal: 'Roberto Sánchez',
                activo: true,
                fechaCreacion: new Date().toISOString()
            },
            {
                id: 2,
                razonSocial: 'Industrias XYZ S.A.',
                ruc: '20987654321',
                direccion: 'Av. Comercial 789, Lima',
                telefono: '01-8765432',
                email: 'info@industriasxyz.com',
                representanteLegal: 'Carmen Vega',
                activo: true,
                fechaCreacion: new Date().toISOString()
            }
        ];
        localStorage.setItem('policlinico_empresas', JSON.stringify(empresas));
    }

    // Exámenes programados
    initDefaultExamenes() {
        const examenes = [
            {
                id: 1,
                codigo: 'EXA001',
                pacienteId: 1,
                empresaId: 1,
                categoriaExamen: 'EMO',
                tipoExamen: 'ingreso',
                examenesSeleccionados: ['camo','signosvitales','oftalmologia', 'audiometria', 'psicologia', 'ekg', 'espirometria'],
                fechaProgramada: '2024-12-20',
                horaProgramada: '09:00',
                estado: 'programado',
                observaciones: '',
                fechaCreacion: new Date().toISOString(),
                archivoCompleto: null,
                aptitud: null
            },
            {
                id: 2,
                codigo: 'EXA002',
                pacienteId: 2,
                empresaId: 1,
                categoriaExamen: 'EMO',
                tipoExamen: 'anual',
                examenesSeleccionados: ['oftalmologia', 'audiometria', 'psicologia'],
                fechaProgramada: '2024-12-21',
                horaProgramada: '10:30',
                estado: 'programado',
                observaciones: '',
                fechaCreacion: new Date().toISOString(),
                archivoCompleto: null,
                aptitud: null
            },
            {
                id: 3,
                codigo: 'EXA003',
                pacienteId: 1,
                empresaId: 1,
                categoriaExamen: 'especifico',
                tipoExamen: 'cardiologia',
                examenesSeleccionados: ['cardiologia'],
                fechaProgramada: '2024-12-22',
                horaProgramada: '11:00',
                estado: 'programado',
                observaciones: 'Examen específico de cardiología',
                fechaCreacion: new Date().toISOString(),
                archivoCompleto: null,
                aptitud: null
            }
        ];
        localStorage.setItem('policlinico_examenes', JSON.stringify(examenes));
    }

    // Resultados de exámenes
    initDefaultResultados() {
        const resultados = [
            {
                id: 1,
                examenId: 1,
                pacienteId: 1,
                tipoExamen: 'oftalmologia',
                resultado: '',
                archivo: '',
                completado: false,
                fechaCompletado: null,
                completadoPor: null,
                observaciones: '',
                fechaCreacion: new Date().toISOString(),
                datosEspecificos: {}
            },
            {
                id: 2,
                examenId: 1,
                pacienteId: 1,
                tipoExamen: 'audiometria',
                resultado: '',
                archivo: '',
                completado: false,
                fechaCompletado: null,
                completadoPor: null,
                observaciones: '',
                fechaCreacion: new Date().toISOString(),
                datosEspecificos: {}
            },
            {
                id: 3,
                examenId: 1,
                pacienteId: 1,
                tipoExamen: 'psicologia',
                resultado: '',
                archivo: '',
                completado: false,
                fechaCompletado: null,
                completadoPor: null,
                observaciones: '',
                fechaCreacion: new Date().toISOString(),
                datosEspecificos: {}
            },
            {
                id: 4,
                examenId: 1,
                pacienteId: 1,
                tipoExamen: 'ekg',
                resultado: '',
                archivo: '',
                completado: false,
                fechaCompletado: null,
                completadoPor: null,
                observaciones: '',
                fechaCreacion: new Date().toISOString(),
                datosEspecificos: {}
            },
            {
                id: 5,
                examenId: 1,
                pacienteId: 1,
                tipoExamen: 'espirometria',
                resultado: '',
                archivo: '',
                completado: false,
                fechaCompletado: null,
                completadoPor: null,
                observaciones: '',
                fechaCreacion: new Date().toISOString(),
                datosEspecificos: {}
            }
        ];
        localStorage.setItem('policlinico_resultados', JSON.stringify(resultados));
    }

    // Métodos CRUD genéricos
    getData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    setData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Métodos específicos para cada entidad
    // Usuarios
    getUsers() {
        return this.getData('policlinico_users');
    }

    getUserById(id) {
        const users = this.getUsers();
        return users.find(user => user.id === parseInt(id));
    }

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    }

    saveUser(user) {
        const users = this.getUsers();
        if (user.id) {
            const index = users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                users[index] = user;
            }
        } else {
            user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            users.push(user);
        }
        this.setData('policlinico_users', users);
        return user;
    }

    // Pacientes
    getPacientes() {
        return this.getData('policlinico_pacientes');
    }

    getPacienteById(id) {
        const pacientes = this.getPacientes();
        return pacientes.find(paciente => paciente.id === parseInt(id));
    }

    savePaciente(paciente) {
        const pacientes = this.getPacientes();
        if (paciente.id) {
            const index = pacientes.findIndex(p => p.id === paciente.id);
            if (index !== -1) {
                pacientes[index] = paciente;
            }
        } else {
            paciente.id = pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1;
            paciente.codigo = `PAC${String(paciente.id).padStart(3, '0')}`;
            pacientes.push(paciente);
        }
        this.setData('policlinico_pacientes', pacientes);
        return paciente;
    }

    deletePaciente(id) {
        const pacientes = this.getPacientes();
        const filtered = pacientes.filter(p => p.id !== parseInt(id));
        this.setData('policlinico_pacientes', filtered);
    }

    // Empresas
    getEmpresas() {
        return this.getData('policlinico_empresas');
    }

    getEmpresaById(id) {
        const empresas = this.getEmpresas();
        return empresas.find(empresa => empresa.id === parseInt(id));
    }

    saveEmpresa(empresa) {
        const empresas = this.getEmpresas();
        if (empresa.id) {
            const index = empresas.findIndex(e => e.id === empresa.id);
            if (index !== -1) {
                empresas[index] = empresa;
            }
        } else {
            empresa.id = empresas.length > 0 ? Math.max(...empresas.map(e => e.id)) + 1 : 1;
            empresas.push(empresa);
        }
        this.setData('policlinico_empresas', empresas);
        return empresa;
    }

    deleteEmpresa(id) {
        const empresas = this.getEmpresas();
        const filtered = empresas.filter(e => e.id !== parseInt(id));
        this.setData('policlinico_empresas', filtered);
    }

    // Médicos
    getMedicos() {
        return this.getData('policlinico_medicos');
    }

    getMedicoById(id) {
        const medicos = this.getMedicos();
        return medicos.find(med => med.id === parseInt(id));
    }

    saveMedico(medico) {
        const medicos = this.getMedicos();
        if (medico.id) {
            const index = medicos.findIndex(m => m.id === medico.id);
            if (index !== -1) medicos[index] = medico;
        } else {
            medico.id = medicos.length > 0 ? Math.max(...medicos.map(m => m.id)) + 1 : 1;
            medicos.push(medico);
        }
        this.setData('policlinico_medicos', medicos);
        return medico;
    }

    deleteMedico(id) {
        const medicos = this.getMedicos();
        const filtered = medicos.filter(m => m.id !== parseInt(id));
        this.setData('policlinico_medicos', filtered);
    }

    // Exámenes
    getExamenes() {
        return this.getData('policlinico_examenes');
    }

    getExamenById(id) {
        const examenes = this.getExamenes();
        return examenes.find(examen => examen.id === parseInt(id));
    }

    getExamenesByEmpresa(empresaId) {
        const examenes = this.getExamenes();
        return examenes.filter(examen => examen.empresaId === parseInt(empresaId));
    }

    getExamenesConResultados() {
        const examenes = this.getExamenes();
        const pacientes = this.getPacientes();
        const empresas = this.getEmpresas();
        const resultados = this.getResultados();
        
        return examenes.map(examen => {
            const paciente = pacientes.find(p => p.id === examen.pacienteId);
            const empresa = empresas.find(e => e.id === examen.empresaId);
            const resultadosExamen = resultados.filter(r => r.examenId === examen.id);
            
            return {
                ...examen,
                paciente,
                empresa,
                resultados: resultadosExamen
            };
        });
    }

    saveExamen(examen) {
        const examenes = this.getExamenes();
        const isNew = !examen.id;
        
        if (examen.id) {
            const index = examenes.findIndex(e => e.id === examen.id);
            if (index !== -1) {
                examenes[index] = examen;
            }
        } else {
            examen.id = examenes.length > 0 ? Math.max(...examenes.map(e => e.id)) + 1 : 1;
            examen.codigo = `EXA${String(examen.id).padStart(3, '0')}`;
            examenes.push(examen);
        }
        this.setData('policlinico_examenes', examenes);
        
        // Crear resultados automáticamente para examen nuevo
        if (isNew) {
            this.createResultadosForExamen(examen);
        }
        
        return examen;
    }

    // Citas: Eliminadas del sistema

    // Resultados
    getResultados() {
        return this.getData('policlinico_resultados');
    }

    getResultadosByExamen(examenId) {
        const resultados = this.getResultados();
        return resultados.filter(resultado => resultado.examenId === parseInt(examenId));
    }

    getResultadosByPaciente(pacienteId) {
        const resultados = this.getResultados();
        return resultados.filter(resultado => resultado.pacienteId === parseInt(pacienteId));
    }

    saveResultado(resultado) {
        const resultados = this.getResultados();
        if (resultado.id) {
            const index = resultados.findIndex(r => r.id === resultado.id);
            if (index !== -1) {
                resultados[index] = resultado;
            }
        } else {
            resultado.id = resultados.length > 0 ? Math.max(...resultados.map(r => r.id)) + 1 : 1;
            resultados.push(resultado);
        }
        this.setData('policlinico_resultados', resultados);
        return resultado;
    }

    // Crear resultados automáticamente cuando se crea un examen
    createResultadosForExamen(examen) {
        const resultados = [];
        examen.examenesSeleccionados.forEach(tipoExamen => {
            const resultado = {
                examenId: examen.id,
                pacienteId: examen.pacienteId,
                tipoExamen: tipoExamen,
                resultado: '',
                archivo: '',
                completado: false,
                fechaCompletado: null,
                completadoPor: null,
                observaciones: '',
                fechaCreacion: new Date().toISOString(),
                datosEspecificos: {}
            };
            this.saveResultado(resultado);
            resultados.push(resultado);
        });
        return resultados;
    }

    // Métodos de autenticación
    authenticate(email, password, rol) {
        const users = this.getUsers();
        const user = users.find(u => 
            u.email === email && 
            u.password === password && 
            u.rol === rol &&
            u.activo === true
        );
        return user || null;
    }

    // Roles y permisos
    initDefaultRolesPermisos() {
        const rolesPermisos = {
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
        localStorage.setItem('policlinico_roles_permisos', JSON.stringify(rolesPermisos));
    }

    // Tipos de exámenes disponibles
    initDefaultTiposExamenes() {
        const tiposExamenes = {
            EMO: {
                nombre: 'Examen Médico Ocupacional',
                tipos: {
                    ingreso: 'Examen de Ingreso',
                    retiro: 'Examen de Retiro',
                    anual: 'Examen Anual',
                    recategorizacion: 'Examen de Recategorización'
                },
                examenes_disponibles: [
                    { id : 'signosvitales', nombre: 'SignosVitales', categoria: 'tecnico' },
                    { id: 'oftalmologia', nombre: 'Oftalmología', categoria: 'tecnico' },
                    { id: 'audiometria', nombre: 'Audiometría', categoria: 'tecnico' },
                    { id: 'psicologia', nombre: 'Psicología', categoria: 'tecnico' },
                    { id: 'ekg', nombre: 'Electrocardiograma', categoria: 'tecnico' },
                    { id: 'espirometria', nombre: 'Espirometría', categoria: 'tecnico' },
                    { id: 'cardiologia', nombre: 'Cardiología', categoria: 'tecnico' },
                    { id: 'laboratorio', nombre: 'Laboratorio', categoria: 'tecnico' },
                    { id: 'radiologia', nombre: 'Radiología', categoria: 'tecnico' },
                    { id: 'alturaestructural', nombre: 'AlturaEstructural', categoria: 'tecnico' },
                    { id: 'psicosensometrico', nombre: 'Psicosensometrico', categoria: 'tecnico' },
                ]
            },
            especifico: {
                nombre: 'Examen Específico',
                tipos: {
                    consulta: 'Consulta Especializada'
                },
                examenes_disponibles: [
                    { id : 'signosvitales', nombre: 'SignosVitales', categoria: 'tecnico' },
                    { id: 'oftalmologia', nombre: 'Oftalmología', categoria: 'tecnico' },
                    { id: 'audiometria', nombre: 'Audiometría', categoria: 'tecnico' },
                    { id: 'psicologia', nombre: 'Psicología', categoria: 'tecnico' },
                    { id: 'ekg', nombre: 'Electrocardiograma', categoria: 'tecnico' },
                    { id: 'espirometria', nombre: 'Espirometría', categoria: 'tecnico' },
                    { id: 'cardiologia', nombre: 'Cardiología', categoria: 'tecnico' },
                    { id: 'laboratorio', nombre: 'Laboratorio', categoria: 'tecnico' },
                    { id: 'radiologia', nombre: 'Radiología', categoria: 'tecnico' },
                    { id: 'alturaestructural', nombre: 'AlturaEstructural', categoria: 'tecnico' },
                    { id: 'psicosensometrico', nombre: 'Psicosensometrico', categoria: 'tecnico' },
                ]
            }
        };
        localStorage.setItem('policlinico_tipos_examenes', JSON.stringify(tiposExamenes));
    }

    // Médicos
    initDefaultMedicos() {
        const medicos = [
            { id: 1, nombres: 'Dr. Carlos', apellidos: 'Rodríguez', especialidad: 'Medicina Ocupacional', cmp: 'CMP12345', activo: true },
            { id: 2, nombres: 'Dra. Lucía', apellidos: 'Gómez', especialidad: 'Medicina General', cmp: 'CMP54321', activo: true }
        ];
        localStorage.setItem('policlinico_medicos', JSON.stringify(medicos));
    }

    // Métodos para roles y permisos
    getRolesPermisos() {
        return this.getData('policlinico_roles_permisos');
    }

    getTiposExamenes() {
        return this.getData('policlinico_tipos_examenes');
    }

    hasPermission(userRole, permission) {
        const rolesPermisos = this.getRolesPermisos();
        return rolesPermisos[userRole]?.permisos?.includes(permission) || false;
    }

    // Métodos de utilidad
    generateCode(prefix, id) {
        return `${prefix}${String(id).padStart(3, '0')}`;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('es-PE');
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('es-PE');
    }
}

// Instancia global de la base de datos
window.db = new Database();
