// Sistema Policlínico - Gestión de Empresas
// Funcionalidad para el módulo de empresas

class EmpresaManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.currentEmpresa = this.getCurrentEmpresa();
        this.selectedExamenes = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUserRole();
        this.loadExamenesTable();
        this.updateStats();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('policlinico_user');
        return userData ? JSON.parse(userData) : null;
    }

    getCurrentEmpresa() {
        // Obtener empresa del usuario actual
        if (this.currentUser && this.currentUser.empresaId && window.db) {
            return window.db.getEmpresaById(this.currentUser.empresaId);
        }
        return null;
    }

    setupUserRole() {
        // Verificar que el usuario sea de empresa
        if (!this.currentUser || this.currentUser.rol !== 'empresa') {
            showAlert('Acceso denegado. Solo empresas pueden acceder a esta sección.', 'danger');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return;
        }

        // Actualizar información de la empresa en la interfaz
        if (this.currentEmpresa) {
            const empresaNombre = document.getElementById('empresaNombre');
            const empresaInfo = document.getElementById('empresaInfo');
            
            if (empresaNombre) {
                empresaNombre.textContent = this.currentEmpresa.razonSocial;
            }
            
            if (empresaInfo) {
                empresaInfo.textContent = `Bienvenido, ${this.currentEmpresa.razonSocial}`;
            }
        }
    }

    setupEventListeners() {
        // Filtros
        const filtros = ['filtroNombre', 'filtroDNI', 'filtroTipoExamen', 'filtroFechaDesde', 'filtroFechaHasta'];
        filtros.forEach(filtro => {
            const element = document.getElementById(filtro);
            if (element) {
                element.addEventListener('input', () => this.filtrarExamenes());
                element.addEventListener('change', () => this.filtrarExamenes());
            }
        });
    }

    loadExamenesEmpresa() {
        if (!window.db || !this.currentEmpresa) return [];
        
        // Obtener exámenes de la empresa actual
        const examenes = window.db.getExamenesByEmpresa(this.currentEmpresa.id);
        const pacientes = window.db.getPacientes();
        
        // Combinar datos de exámenes con datos de pacientes
        return examenes.map(examen => {
            const paciente = pacientes.find(p => p.id === examen.pacienteId);
            return {
                ...examen,
                paciente: paciente
            };
        }).filter(examen => examen.paciente); // Solo exámenes con paciente válido
    }
            },
            {
                id: '2',
                empresaId: empresaId,
                codigo: '240119002',
                dni: '87654321',
                nombre: 'María López Martínez',
                tipoExamen: 'periodico',
                fechaExamen: '2024-01-18',
                puesto: 'Supervisora',
                telefono: '555-0124',
                estado: 'en_proceso',
                examenes: ['audiometria', 'oftalmologia']
            },
            {
                id: '3',
                empresaId: empresaId,
                codigo: '240119003',
                dni: '11223344',
                nombre: 'Carlos Rodríguez Silva',
                tipoExamen: 'altura',
                fechaExamen: '2024-01-17',
                puesto: 'Técnico de Altura',
                telefono: '555-0125',
                estado: 'completado',
                examenes: ['audiometria', 'oftalmologia', 'ekg', 'psicosensometrico']
            }
        ];
    }

        const savedExamenes = localStorage.getItem('policlinico_examenes');
        if (savedExamenes) {
            return JSON.parse(savedExamenes);
        }
        
        // Datos de prueba
        return [
            {
                id: '1',
                trabajadorId: '1',
                tipo: 'audiometria',
                estado: 'completado',
                fechaRealizacion: '2024-01-19',
                resultados: {
                    oidoDerecho: { frecuencia250: 10, frecuencia500: 15, frecuencia1000: 20 },
                    oidoIzquierdo: { frecuencia250: 12, frecuencia500: 18, frecuencia1000: 22 },
                    diagnostico: 'Audición normal',
                    observaciones: 'Sin alteraciones detectadas'
                }
            },
            {
                id: '2',
                trabajadorId: '1',
                tipo: 'oftalmologia',
                estado: 'completado',
                fechaRealizacion: '2024-01-19',
                resultados: {
                    ojoDerecho: { agudezaVisual: '20/20', presionIntraocular: 15 },
                    ojoIzquierdo: { agudezaVisual: '20/20', presionIntraocular: 16 },
                    diagnostico: 'Visión normal',
                    observaciones: 'Sin problemas visuales'
                }
            }
        ];
    }

        const savedEmpresas = localStorage.getItem('policlinico_empresas');
        if (savedEmpresas) {
            return JSON.parse(savedEmpresas);
        }
        
        return [
            {
                id: 'empresa1',
                nombre: 'Constructora ABC S.A.',
                ruc: '20123456789',
                direccion: 'Av. Principal 123',
                telefono: '555-0100',
                email: 'admin@constructoraabc.com',
                estado: 'activo'
            },
            {
                id: 'empresa2',
                nombre: 'Minera XYZ Ltda.',
                ruc: '20987654321',
                direccion: 'Calle Minera 456',
                telefono: '555-0200',
                email: 'admin@mineraxyz.com',
                estado: 'activo'
            }
        ];
    }

    saveTrabajadores() {
        localStorage.setItem('policlinico_trabajadores', JSON.stringify(this.trabajadores));
    }

    saveExamenes() {
        localStorage.setItem('policlinico_examenes', JSON.stringify(this.examenes));
    }

    saveEmpresas() {
        localStorage.setItem('policlinico_empresas', JSON.stringify(this.empresas));
    }

    loadTrabajadoresTable() {
        const tableBody = document.getElementById('trabajadoresTable');
        const tableBodyRecientes = document.getElementById('trabajadoresRecientesTable');
        
        if (!tableBody && !tableBodyRecientes) return;

        const trabajadoresFiltrados = this.getTrabajadoresFiltrados();
        const trabajadoresEmpresa = trabajadoresFiltrados; // Ya están filtrados por empresa
        
        const rowHTML = trabajadoresEmpresa.map(trabajador => `
            <tr>
                <td>${trabajador.codigo || 'N/A'}</td>
                <td>${trabajador.cedula}</td>
                <td>${trabajador.nombre} ${trabajador.apellido}</td>
                <td><span class="badge badge-${this.getTipoExamenClass(trabajador.tipoExamen)}">${this.getTipoExamenDisplayName(trabajador.tipoExamen)}</span></td>
                <td>${this.formatDate(trabajador.fechaRegistro)}</td>
                <td><span class="badge badge-success">Activo</span></td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="verTrabajador('${trabajador.id}')">Ver</button>
                    <button class="btn btn-success btn-sm" onclick="descargarEMOTrabajador('${trabajador.id}')">Descargar</button>
                </td>
            </tr>
        `).join('');

        if (tableBody) {
            tableBody.innerHTML = rowHTML;
        }
        
        if (tableBodyRecientes) {
            // Mostrar solo los 5 más recientes
            const recientes = trabajadoresEmpresa.slice(0, 5);
            tableBodyRecientes.innerHTML = recientes.map(trabajador => `
                <tr>
                    <td>${trabajador.codigo || 'N/A'}</td>
                    <td>${trabajador.cedula}</td>
                    <td>${trabajador.nombre} ${trabajador.apellido}</td>
                    <td><span class="badge badge-${this.getTipoExamenClass(trabajador.tipoExamen)}">${this.getTipoExamenDisplayName(trabajador.tipoExamen)}</span></td>
                    <td>${this.formatDate(trabajador.fechaRegistro)}</td>
                    <td><span class="badge badge-success">Activo</span></td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="verTrabajador('${trabajador.id}')">Ver</button>
                        <button class="btn btn-success btn-sm" onclick="descargarEMOTrabajador('${trabajador.id}')">Descargar</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadExamenesTable() {
        const tableBody = document.getElementById('examenesTable');
        if (!tableBody) return;

        const trabajadoresEmpresa = this.trabajadores; // Ya están filtrados por empresa
        
        tableBody.innerHTML = trabajadoresEmpresa.map(trabajador => `
            <tr>
                <td>
                    <input type="checkbox" class="examen-checkbox" value="${trabajador.id}" onchange="toggleExamenSeleccionado('${trabajador.id}')">
                </td>
                <td>${trabajador.codigo || 'N/A'}</td>
                <td>${trabajador.cedula}</td>
                <td>${trabajador.nombre} ${trabajador.apellido}</td>
                <td><span class="badge badge-${this.getTipoExamenClass(trabajador.tipoExamen)}">${this.getTipoExamenDisplayName(trabajador.tipoExamen)}</span></td>
                <td>${this.formatDate(trabajador.fechaRegistro)}</td>
                <td><span class="badge badge-success">Activo</span></td>
                <td>
                    <div style="display: flex; flex-wrap: wrap; gap: 2px;">
                        ${this.getExamenesPorTipo(trabajador.tipoExamen).map(examen => 
                            `<span class="badge badge-info" style="font-size: 0.7rem;">${this.getExamenDisplayName(examen)}</span>`
                        ).join('')}
                    </div>
                </td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="verTrabajador('${trabajador.id}')">Ver</button>
                    <button class="btn btn-success btn-sm" onclick="descargarExamenesEspecificos('${trabajador.id}')">Exámenes</button>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const trabajadoresEmpresa = this.trabajadores; // Ya están filtrados por empresa
        
        // Estadísticas generales
        document.getElementById('totalTrabajadores').textContent = trabajadoresEmpresa.length;
        document.getElementById('totalExamenes').textContent = trabajadoresEmpresa.reduce((sum, t) => sum + t.examenes.length, 0);
        document.getElementById('examenesPendientes').textContent = trabajadoresEmpresa.filter(t => t.estado === 'pendiente').length;
        document.getElementById('examenesCompletados').textContent = trabajadoresEmpresa.filter(t => t.estado === 'completado').length;

        // Estadísticas por tipo
        document.getElementById('preOcupacionalCount').textContent = trabajadoresEmpresa.filter(t => t.tipoExamen === 'pre-ocupacional').length;
        document.getElementById('periodicoCount').textContent = trabajadoresEmpresa.filter(t => t.tipoExamen === 'periodico').length;
        document.getElementById('retiroCount').textContent = trabajadoresEmpresa.filter(t => t.tipoExamen === 'retiro').length;
        document.getElementById('alturaCount').textContent = trabajadoresEmpresa.filter(t => t.tipoExamen === 'altura').length;
        document.getElementById('psicosensometricoCount').textContent = trabajadoresEmpresa.filter(t => t.tipoExamen === 'psicosensometrico').length;
    }

    getTrabajadoresFiltrados() {
        const filtroNombre = document.getElementById('filtroNombre')?.value.toLowerCase();
        const filtroDNI = document.getElementById('filtroDNI')?.value.toLowerCase();
        const filtroTipoExamen = document.getElementById('filtroTipoExamen')?.value;
        const filtroEstado = document.getElementById('filtroEstado')?.value;

        return this.trabajadores.filter(trabajador => {
            if (filtroNombre && !trabajador.nombre.toLowerCase().includes(filtroNombre)) return false;
            if (filtroDNI && !trabajador.dni.includes(filtroDNI)) return false;
            if (filtroTipoExamen && trabajador.tipoExamen !== filtroTipoExamen) return false;
            if (filtroEstado && trabajador.estado !== filtroEstado) return false;
            return true;
        });
    }

    getTipoExamenClass(tipo) {
        const classes = {
            'pre-ocupacional': 'primary',
            'periodico': 'info',
            'retiro': 'warning',
            'altura': 'danger',
            'psicosensometrico': 'success'
        };
        return classes[tipo] || 'secondary';
    }

    getTipoExamenDisplayName(tipo) {
        const tipos = {
            'pre-ocupacional': 'Pre-Ocupacional',
            'periodico': 'Periódico',
            'retiro': 'Retiro',
            'altura': 'Altura',
            'psicosensometrico': 'Psicosensométrico'
        };
        return tipos[tipo] || tipo;
    }

    getExamenDisplayName(examen) {
        const examenes = {
            'audiometria': 'Audiometría',
            'oftalmologia': 'Oftalmología',
            'ekg': 'EKG',
            'laboratorio': 'Laboratorio',
            'psicosensometrico': 'Psicosensométrico',
            'odontologia': 'Odontología',
            'espirometria': 'Espirometría',
            'certificado_aptitud': 'Certificado de Aptitud'
        };
        return examenes[examen] || examen;
    }

    getEstadoClass(estado) {
        const classes = {
            'pendiente': 'warning',
            'en_proceso': 'info',
            'completado': 'success',
            'cancelado': 'danger'
        };
        return classes[estado] || 'secondary';
    }

    getEstadoDisplayName(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'en_proceso': 'En Proceso',
            'completado': 'Completado',
            'cancelado': 'Cancelado'
        };
        return estados[estado] || estado;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    // Métodos para trabajadores
    handleNuevoTrabajador(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const nuevoTrabajador = {
            id: this.generateId(),
            empresaId: this.currentEmpresa.id,
            codigo: this.generateCodigoTrabajador(),
            dni: formData.get('nuevoTrabajadorDNI'),
            nombre: formData.get('nuevoTrabajadorNombre'),
            tipoExamen: formData.get('nuevoTrabajadorTipoExamen'),
            fechaExamen: formData.get('nuevoTrabajadorFechaExamen'),
            puesto: formData.get('nuevoTrabajadorPuesto'),
            telefono: formData.get('nuevoTrabajadorTelefono'),
            estado: 'pendiente',
            examenes: this.getExamenesPorTipo(formData.get('nuevoTrabajadorTipoExamen'))
        };

        // Validar que el DNI no exista en la empresa
        if (this.trabajadores.find(t => t.dni === nuevoTrabajador.dni && t.empresaId === nuevoTrabajador.empresaId)) {
            showAlert('Ya existe un trabajador con este DNI en la empresa', 'danger');
            return;
        }

        this.trabajadores.push(nuevoTrabajador);
        this.saveTrabajadores();
        this.loadTrabajadoresTable();
        this.updateStats();
        this.cerrarModalNuevoTrabajador();
        
        showAlert('Trabajador registrado exitosamente', 'success');
    }

    getExamenesPorTipo(tipo) {
        const examenesPorTipo = {
            'pre-ocupacional': ['audiometria', 'oftalmologia', 'ekg', 'laboratorio', 'odontologia', 'espirometria', 'certificado_aptitud'],
            'periodico': ['audiometria', 'oftalmologia', 'ekg', 'laboratorio'],
            'retiro': ['audiometria', 'oftalmologia', 'ekg', 'laboratorio'],
            'altura': ['audiometria', 'oftalmologia', 'ekg', 'psicosensometrico', 'certificado_aptitud'],
            'psicosensometrico': ['audiometria', 'oftalmologia', 'ekg', 'psicosensometrico', 'certificado_aptitud']
        };
        return examenesPorTipo[tipo] || [];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateCodigoTrabajador() {
        const fecha = new Date();
        const año = fecha.getFullYear().toString().slice(-2);
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        
        const hoy = `${año}${mes}${dia}`;
        const trabajadoresHoy = this.trabajadores.filter(t => t.codigo && t.codigo.startsWith(hoy));
        const siguienteNumero = trabajadoresHoy.length + 1;
        
        return `${hoy}${siguienteNumero.toString().padStart(3, '0')}`;
    }

    // Métodos para modales
    abrirModalNuevoTrabajador() {
        const modal = document.getElementById('modalNuevoTrabajador');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    cerrarModalNuevoTrabajador() {
        const modal = document.getElementById('modalNuevoTrabajador');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('formNuevoTrabajador').reset();
        }
    }

    verTrabajador(trabajadorId) {
        const trabajador = this.trabajadores.find(t => t.id === trabajadorId);
        if (!trabajador) return;

        const modal = document.getElementById('modalVerTrabajador');
        const trabajadorInfo = document.getElementById('trabajadorInfo');
        
        if (modal && trabajadorInfo) {
            trabajadorInfo.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Código:</strong></label>
                        <p>${trabajador.codigo || 'N/A'}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Cédula:</strong></label>
                        <p>${trabajador.cedula}</p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Nombre:</strong></label>
                        <p>${trabajador.nombre} ${trabajador.apellido}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Tipo de Examen:</strong></label>
                        <p><span class="badge badge-${this.getTipoExamenClass(trabajador.tipoExamen)}">${this.getTipoExamenDisplayName(trabajador.tipoExamen)}</span></p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Fecha de Registro:</strong></label>
                        <p>${this.formatDate(trabajador.fechaRegistro)}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Estado:</strong></label>
                        <p><span class="badge badge-success">Activo</span></p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Teléfono:</strong></label>
                        <p>${trabajador.telefono || 'No especificado'}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Email:</strong></label>
                        <p>${trabajador.email || 'No especificado'}</p>
                    </div>
                </div>
                <div class="form-group">
                    <label><strong>Exámenes Disponibles:</strong></label>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px;">
                        ${this.getExamenesPorTipo(trabajador.tipoExamen).map(examen => 
                            `<span class="badge badge-info">${this.getExamenDisplayName(examen)}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    }

    cerrarModalVerTrabajador() {
        const modal = document.getElementById('modalVerTrabajador');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Métodos para selección de exámenes
    toggleExamenSeleccionado(trabajadorId) {
        if (this.selectedExamenes.has(trabajadorId)) {
            this.selectedExamenes.delete(trabajadorId);
        } else {
            this.selectedExamenes.add(trabajadorId);
        }
        this.updateContadorSeleccionados();
    }

    updateContadorSeleccionados() {
        const contador = document.getElementById('contadorSeleccionados');
        if (contador) {
            contador.textContent = `${this.selectedExamenes.size} seleccionados`;
        }
    }

    seleccionarTodos() {
        const checkboxes = document.querySelectorAll('.examen-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedExamenes.add(checkbox.value);
        });
        this.updateContadorSeleccionados();
    }

    deseleccionarTodos() {
        const checkboxes = document.querySelectorAll('.examen-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.selectedExamenes.clear();
        this.updateContadorSeleccionados();
    }

    seleccionarCompletados() {
        this.deseleccionarTodos();
        const trabajadoresCompletados = this.trabajadores.filter(t => t.estado === 'completado' && t.empresaId === this.currentEmpresa?.id);
        trabajadoresCompletados.forEach(trabajador => {
            const checkbox = document.querySelector(`input[value="${trabajador.id}"]`);
            if (checkbox) {
                checkbox.checked = true;
                this.selectedExamenes.add(trabajador.id);
            }
        });
        this.updateContadorSeleccionados();
    }

    seleccionarPendientes() {
        this.deseleccionarTodos();
        const trabajadoresPendientes = this.trabajadores.filter(t => t.estado === 'pendiente' && t.empresaId === this.currentEmpresa?.id);
        trabajadoresPendientes.forEach(trabajador => {
            const checkbox = document.querySelector(`input[value="${trabajador.id}"]`);
            if (checkbox) {
                checkbox.checked = true;
                this.selectedExamenes.add(trabajador.id);
            }
        });
        this.updateContadorSeleccionados();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.examen-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
            if (selectAllCheckbox.checked) {
                this.selectedExamenes.add(checkbox.value);
            } else {
                this.selectedExamenes.delete(checkbox.value);
            }
        });
        this.updateContadorSeleccionados();
    }

    // Métodos de filtrado
    filtrarTrabajadores() {
        this.loadTrabajadoresTable();
    }

    filtrarExamenes() {
        this.loadExamenesTable();
    }

    // Métodos para descarga
    descargarEMOTrabajador(trabajadorId) {
        const trabajador = this.trabajadores.find(t => t.id === trabajadorId);
        if (trabajador && window.pdfGenerator) {
            // Simular datos de paciente para el generador de PDF
            const pacienteSimulado = {
                id: trabajadorId,
                codigo: trabajador.codigo,
                cedula: trabajador.dni,
                nombre: trabajador.nombre.split(' ')[0],
                apellido: trabajador.nombre.split(' ').slice(1).join(' '),
                fechaNacimiento: '1990-01-01',
                genero: 'M',
                telefono: trabajador.telefono,
                email: '',
                direccion: ''
            };
            
            // Agregar paciente temporalmente para el PDF
            const pacientesActuales = JSON.parse(localStorage.getItem('policlinico_pacientes') || '[]');
            pacientesActuales.push(pacienteSimulado);
            localStorage.setItem('policlinico_pacientes', JSON.stringify(pacientesActuales));
            
            // Generar PDF
            window.pdfGenerator.generarPDFPaciente(trabajadorId);
            
            // Remover paciente temporal
            const pacientesFiltrados = pacientesActuales.filter(p => p.id !== trabajadorId);
            localStorage.setItem('policlinico_pacientes', JSON.stringify(pacientesFiltrados));
        }
    }

    descargarExamenesEspecificos(trabajadorId) {
        const trabajador = this.trabajadores.find(t => t.id === trabajadorId);
        if (!trabajador) return;

        const modal = document.getElementById('modalDescargarExamenes');
        const trabajadorSeleccionado = document.getElementById('trabajadorSeleccionado');
        const examenesDisponibles = document.getElementById('examenesDisponibles');
        
        if (modal && trabajadorSeleccionado && examenesDisponibles) {
            trabajadorSeleccionado.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h4>${trabajador.nombre} ${trabajador.apellido}</h4>
                        <p>Cédula: ${trabajador.cedula} | Código: ${trabajador.codigo || 'N/A'}</p>
                        <p>Tipo: ${this.getTipoExamenDisplayName(trabajador.tipoExamen)} | Fecha: ${this.formatDate(trabajador.fechaRegistro)}</p>
                    </div>
                </div>
            `;
            
            // Agregar atributo data para identificar el trabajador
            trabajadorSeleccionado.setAttribute('data-trabajador-id', trabajador.id);
            
            examenesDisponibles.innerHTML = this.getExamenesPorTipo(trabajador.tipoExamen).map(examen => `
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="${examen}" checked>
                    <span>${this.getExamenDisplayName(examen)}</span>
                </label>
            `).join('');
            
            modal.style.display = 'block';
        }
    }

    cerrarModalDescargarExamenes() {
        const modal = document.getElementById('modalDescargarExamenes');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    descargarExamenesSeleccionados() {
        const checkboxes = document.querySelectorAll('#examenesDisponibles input[type="checkbox"]:checked');
        const examenesSeleccionados = Array.from(checkboxes).map(cb => cb.value);
        
        if (examenesSeleccionados.length === 0) {
            showAlert('Por favor seleccione al menos un examen', 'warning');
            return;
        }
        
        // Verificar si el paciente tiene interconsulta (no apto)
        const trabajadorId = this.getTrabajadorIdFromModal();
        const tieneInterconsulta = this.tieneInterconsulta(trabajadorId);
        
        if (tieneInterconsulta) {
            showAlert('Este trabajador tiene restricciones médicas. Solo se puede descargar la hoja de interconsulta.', 'warning');
            this.descargarInterconsulta(trabajadorId);
            return;
        }
        
        showAlert(`Descargando exámenes: ${examenesSeleccionados.join(', ')}`, 'success');
        this.cerrarModalDescargarExamenes();
    }

    getTrabajadorIdFromModal() {
        // Obtener el ID del trabajador desde el modal actual
        const modal = document.getElementById('modalDescargarExamenes');
        if (modal && modal.style.display === 'block') {
            // Buscar en el contenido del modal
            const trabajadorInfo = document.querySelector('#trabajadorSeleccionado');
            if (trabajadorInfo) {
                // Extraer ID del contenido o usar un atributo data
                return trabajadorInfo.getAttribute('data-trabajador-id');
            }
        }
        return null;
    }

    tieneInterconsulta(trabajadorId) {
        // Verificar si el trabajador tiene una interconsulta
        const interconsultas = JSON.parse(localStorage.getItem('policlinico_interconsultas') || '[]');
        return interconsultas.some(i => i.pacienteId === trabajadorId && (i.motivo === 'no_apto' || i.motivo === 'restricciones'));
    }

    descargarInterconsulta(trabajadorId) {
        // Descargar solo la hoja de interconsulta
        const interconsultas = JSON.parse(localStorage.getItem('policlinico_interconsultas') || '[]');
        const interconsulta = interconsultas.find(i => i.pacienteId === trabajadorId);
        
        if (interconsulta) {
            showAlert(`Descargando hoja de interconsulta para trabajador con restricciones médicas`, 'info');
            // Aquí se implementaría la descarga del PDF de interconsulta
        } else {
            showAlert('No se encontró hoja de interconsulta para este trabajador', 'warning');
        }
        
        this.cerrarModalDescargarExamenes();
    }

    descargarEMOCompletoModal() {
        showAlert('Descargando EMO completo del trabajador', 'success');
        this.cerrarModalDescargarExamenes();
    }

    // Métodos para acciones del dashboard
    verTodosTrabajadores() {
        window.location.href = 'trabajadores.html';
    }

    descargarReporteCompleto() {
        const trabajadoresEmpresa = this.trabajadores; // Ya están filtrados por empresa
        
        if (trabajadoresEmpresa.length === 0) {
            showAlert('No hay trabajadores para generar el reporte', 'warning');
            return;
        }
        
        // Generar CSV del reporte completo
        const csvContent = this.generateCSVTrabajadores(trabajadoresEmpresa);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_trabajadores_${this.currentEmpresa.nombre}_${this.formatDate(new Date().toISOString()).replace(/\//g, '-')}.csv`;
        link.click();
        
        showAlert('Reporte completo descargado exitosamente', 'success');
    }

    generateCSVTrabajadores(trabajadores) {
        const headers = ['Código', 'DNI', 'Nombre', 'Tipo Examen', 'Fecha', 'Estado', 'Puesto', 'Teléfono'];
        const rows = trabajadores.map(t => [
            t.codigo,
            t.dni,
            t.nombre,
            this.getTipoExamenDisplayName(t.tipoExamen),
            this.formatDate(t.fechaExamen),
            this.getEstadoDisplayName(t.estado),
            t.puesto || '',
            t.telefono || ''
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    verExamenesPendientes() {
        this.seleccionarPendientes();
        showAlert('Exámenes pendientes seleccionados', 'info');
    }

    exportarDatos() {
        this.descargarReporteCompleto();
    }

    actualizarTrabajadores() {
        this.loadTrabajadoresTable();
        this.updateStats();
        showAlert('Lista de trabajadores actualizada', 'success');
    }

    exportarTrabajadores() {
        this.descargarReporteCompleto();
    }

    actualizarExamenes() {
        this.loadExamenesTable();
        showAlert('Lista de exámenes actualizada', 'success');
    }

    descargarSeleccionados() {
        if (this.selectedExamenes.size === 0) {
            showAlert('Por favor seleccione al menos un trabajador', 'warning');
            return;
        }
        
        showAlert(`Descargando ${this.selectedExamenes.size} trabajadores seleccionados`, 'success');
    }
}

// Funciones globales
function abrirModalNuevoTrabajador() {
    if (window.empresaManager) {
        window.empresaManager.abrirModalNuevoTrabajador();
    }
}

function cerrarModalNuevoTrabajador() {
    if (window.empresaManager) {
        window.empresaManager.cerrarModalNuevoTrabajador();
    }
}

function verTrabajador(trabajadorId) {
    if (window.empresaManager) {
        window.empresaManager.verTrabajador(trabajadorId);
    }
}

function cerrarModalVerTrabajador() {
    if (window.empresaManager) {
        window.empresaManager.cerrarModalVerTrabajador();
    }
}

function descargarEMOTrabajador(trabajadorId) {
    if (window.empresaManager) {
        window.empresaManager.descargarEMOTrabajador(trabajadorId);
    }
}

function descargarExamenesEspecificos(trabajadorId) {
    if (window.empresaManager) {
        window.empresaManager.descargarExamenesEspecificos(trabajadorId);
    }
}

function cerrarModalDescargarExamenes() {
    if (window.empresaManager) {
        window.empresaManager.cerrarModalDescargarExamenes();
    }
}

function descargarExamenesSeleccionados() {
    if (window.empresaManager) {
        window.empresaManager.descargarExamenesSeleccionados();
    }
}

function descargarEMOCompletoModal() {
    if (window.empresaManager) {
        window.empresaManager.descargarEMOCompletoModal();
    }
}

function toggleExamenSeleccionado(trabajadorId) {
    if (window.empresaManager) {
        window.empresaManager.toggleExamenSeleccionado(trabajadorId);
    }
}

function seleccionarTodos() {
    if (window.empresaManager) {
        window.empresaManager.seleccionarTodos();
    }
}

function deseleccionarTodos() {
    if (window.empresaManager) {
        window.empresaManager.deseleccionarTodos();
    }
}

function seleccionarCompletados() {
    if (window.empresaManager) {
        window.empresaManager.seleccionarCompletados();
    }
}

function seleccionarPendientes() {
    if (window.empresaManager) {
        window.empresaManager.seleccionarPendientes();
    }
}

function toggleSelectAll() {
    if (window.empresaManager) {
        window.empresaManager.toggleSelectAll();
    }
}

function filtrarTrabajadores() {
    if (window.empresaManager) {
        window.empresaManager.filtrarTrabajadores();
    }
}

function filtrarExamenes() {
    if (window.empresaManager) {
        window.empresaManager.filtrarExamenes();
    }
}

// Funciones del dashboard
function verTodosTrabajadores() {
    if (window.empresaManager) {
        window.empresaManager.verTodosTrabajadores();
    }
}

function descargarReporteCompleto() {
    if (window.empresaManager) {
        window.empresaManager.descargarReporteCompleto();
    }
}

function verExamenesPendientes() {
    if (window.empresaManager) {
        window.empresaManager.verExamenesPendientes();
    }
}

function exportarDatos() {
    if (window.empresaManager) {
        window.empresaManager.exportarDatos();
    }
}

function actualizarTrabajadores() {
    if (window.empresaManager) {
        window.empresaManager.actualizarTrabajadores();
    }
}

function exportarTrabajadores() {
    if (window.empresaManager) {
        window.empresaManager.exportarTrabajadores();
    }
}

function actualizarExamenes() {
    if (window.empresaManager) {
        window.empresaManager.actualizarExamenes();
    }
}

function descargarSeleccionados() {
    if (window.empresaManager) {
        window.empresaManager.descargarSeleccionados();
    }
}

function descargarEMOCompleto() {
    showAlert('Descargando EMO completo', 'success');
}

function verExamenesTrabajador() {
    showAlert('Redirigiendo a exámenes del trabajador', 'info');
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Inicializar el manager de empresa
document.addEventListener('DOMContentLoaded', () => {
    window.empresaManager = new EmpresaManager();
});
