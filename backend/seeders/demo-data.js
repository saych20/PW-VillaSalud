const bcrypt = require('bcrypt');
const database = require('../config/database');

// Datos de prueba realistas para el Sistema EMOS
const demoData = {
    // Usuarios del sistema con diferentes roles
    usuarios: [
        {
            id: 1,
            nombre: 'Carlos',
            apellidos: 'Administrador',
            usuario: 'admin',
            email: 'admin@villasalud.com',
            contraseña: 'admin123',
            rol: 'administrador',
            activo: 1
        },
        {
            id: 2,
            nombre: 'María',
            apellidos: 'López Admisionista',
            usuario: 'admisionista',
            email: 'admisionista@villasalud.com',
            contraseña: 'admin123',
            rol: 'admisionista',
            activo: 1
        },
        {
            id: 3,
            nombre: 'José',
            apellidos: 'Técnico Ramírez',
            usuario: 'tecnico',
            email: 'tecnico@villasalud.com',
            contraseña: 'admin123',
            rol: 'tecnico',
            activo: 1
        },
        {
            id: 4,
            nombre: 'Ana',
            apellidos: 'Empresa García',
            usuario: 'empresa',
            email: 'empresa@minera.com',
            contraseña: 'admin123',
            rol: 'empresa',
            empresa_id: 1,
            activo: 1
        },
        {
            id: 5,
            nombre: 'Dr. Luis',
            apellidos: 'Médico Fernández',
            usuario: 'medico',
            email: 'medico@villasalud.com',
            contraseña: 'admin123',
            rol: 'medico',
            activo: 1
        }
    ],

    // Empresas clientes
    empresas: [
        {
            id: 1,
            nombre: 'Minera del Sur S.A.C.',
            ruc: '20123456789',
            direccion: 'Av. Industrial 123, Lima',
            telefono: '01-234-5678',
            email: 'rrhh@mineradelsur.com',
            contacto_principal: 'Ana García Rodríguez',
            activa: 1
        },
        {
            id: 2,
            nombre: 'Constructora Lima Norte E.I.R.L.',
            ruc: '20987654321',
            direccion: 'Jr. Construcción 456, Lima',
            telefono: '01-987-6543',
            email: 'personal@constructoralima.com',
            contacto_principal: 'Carlos Mendoza Silva',
            activa: 1
        },
        {
            id: 3,
            nombre: 'Transportes Rápidos del Perú S.A.',
            ruc: '20456789123',
            direccion: 'Av. Transporte 789, Callao',
            telefono: '01-456-7890',
            email: 'administracion@transportesrapidos.com',
            contacto_principal: 'María Gonzales Torres',
            activa: 1
        },
        {
            id: 4,
            nombre: 'Industrias Químicas del Centro S.A.C.',
            ruc: '20789123456',
            direccion: 'Parque Industrial 321, Huancayo',
            telefono: '064-123-456',
            email: 'seguridad@industriasquimicas.com',
            contacto_principal: 'Roberto Vásquez Luna',
            activa: 1
        },
        {
            id: 5,
            nombre: 'Servicios Petroleros Offshore S.A.',
            ruc: '20321654987',
            direccion: 'Av. Petróleo 654, Talara',
            telefono: '073-987-321',
            email: 'recursos@petrolerosoffshore.com',
            contacto_principal: 'Patricia Morales Díaz',
            activa: 1
        }
    ],

    // Médicos especialistas
    medicos: [
        {
            id: 1,
            nombre: 'Dr. Luis Alberto',
            apellidos: 'Fernández Castillo',
            especialidad: 'Medicina Ocupacional',
            colegiatura: 'CMP-12345',
            telefono: '999-123-456',
            email: 'lfernandez@villasalud.com',
            permisos_examenes: JSON.stringify(['signos_vitales', 'oftalmologia', 'cardiologia', 'ekg']),
            activo: 1
        },
        {
            id: 2,
            nombre: 'Dra. Carmen Rosa',
            apellidos: 'Vega Morales',
            especialidad: 'Oftalmología',
            colegiatura: 'CMP-23456',
            telefono: '999-234-567',
            email: 'cvega@villasalud.com',
            permisos_examenes: JSON.stringify(['oftalmologia']),
            activo: 1
        },
        {
            id: 3,
            nombre: 'Dr. Miguel Ángel',
            apellidos: 'Torres Ruiz',
            especialidad: 'Audiología',
            colegiatura: 'CMP-34567',
            telefono: '999-345-678',
            email: 'mtorres@villasalud.com',
            permisos_examenes: JSON.stringify(['audiometria']),
            activo: 1
        },
        {
            id: 4,
            nombre: 'Dra. Isabel María',
            apellidos: 'Herrera Sánchez',
            especialidad: 'Psicología Ocupacional',
            colegiatura: 'CPsP-45678',
            telefono: '999-456-789',
            email: 'iherrera@villasalud.com',
            permisos_examenes: JSON.stringify(['psicologia']),
            activo: 1
        },
        {
            id: 5,
            nombre: 'Dr. Roberto Carlos',
            apellidos: 'Mendoza López',
            especialidad: 'Neumología',
            colegiatura: 'CMP-56789',
            telefono: '999-567-890',
            email: 'rmendoza@villasalud.com',
            permisos_examenes: JSON.stringify(['espirometria', 'radiologia']),
            activo: 1
        }
    ],

    // Pacientes trabajadores
    pacientes: [
        {
            id: 1,
            nombre: 'Juan Carlos',
            apellidos: 'Pérez González',
            dni: '12345678',
            fecha_nacimiento: '1985-03-15',
            edad: 39,
            sexo: 'Masculino',
            telefono: '987-654-321',
            email: 'jperez@email.com',
            direccion: 'Av. Los Olivos 123, San Juan de Lurigancho',
            empresa_id: 1
        },
        {
            id: 2,
            nombre: 'María Elena',
            apellidos: 'Rodríguez Silva',
            dni: '23456789',
            fecha_nacimiento: '1990-07-22',
            edad: 34,
            sexo: 'Femenino',
            telefono: '987-765-432',
            email: 'mrodriguez@email.com',
            direccion: 'Jr. Las Flores 456, Villa El Salvador',
            empresa_id: 1
        },
        {
            id: 3,
            nombre: 'Carlos Alberto',
            apellidos: 'Mendoza Torres',
            dni: '34567890',
            fecha_nacimiento: '1988-11-10',
            edad: 36,
            sexo: 'Masculino',
            telefono: '987-876-543',
            email: 'cmendoza@email.com',
            direccion: 'Av. Industrial 789, Ate',
            empresa_id: 2
        },
        {
            id: 4,
            nombre: 'Ana Lucía',
            apellidos: 'García Vásquez',
            dni: '45678901',
            fecha_nacimiento: '1992-05-18',
            edad: 32,
            sexo: 'Femenino',
            telefono: '987-987-654',
            email: 'agarcia@email.com',
            direccion: 'Calle Los Pinos 321, San Martín de Porres',
            empresa_id: 2
        },
        {
            id: 5,
            nombre: 'Roberto Luis',
            apellidos: 'Fernández Castillo',
            dni: '56789012',
            fecha_nacimiento: '1987-09-25',
            edad: 37,
            sexo: 'Masculino',
            telefono: '987-098-765',
            email: 'rfernandez@email.com',
            direccion: 'Av. Universitaria 654, Los Olivos',
            empresa_id: 3
        },
        {
            id: 6,
            nombre: 'Patricia Isabel',
            apellidos: 'Morales Díaz',
            dni: '67890123',
            fecha_nacimiento: '1991-12-08',
            edad: 33,
            sexo: 'Femenino',
            telefono: '987-109-876',
            email: 'pmorales@email.com',
            direccion: 'Jr. Comercio 987, Breña',
            empresa_id: 3
        },
        {
            id: 7,
            nombre: 'Miguel Ángel',
            apellidos: 'Vásquez Luna',
            dni: '78901234',
            fecha_nacimiento: '1986-04-12',
            edad: 38,
            sexo: 'Masculino',
            telefono: '987-210-987',
            email: 'mvasquez@email.com',
            direccion: 'Av. Grau 147, Callao',
            empresa_id: 4
        },
        {
            id: 8,
            nombre: 'Carmen Rosa',
            apellidos: 'Herrera Sánchez',
            dni: '89012345',
            fecha_nacimiento: '1989-08-30',
            edad: 35,
            sexo: 'Femenino',
            telefono: '987-321-098',
            email: 'cherrera@email.com',
            direccion: 'Calle Lima 258, Pueblo Libre',
            empresa_id: 4
        },
        {
            id: 9,
            nombre: 'José Antonio',
            apellidos: 'Torres Ruiz',
            dni: '90123456',
            fecha_nacimiento: '1984-01-20',
            edad: 40,
            sexo: 'Masculino',
            telefono: '987-432-109',
            email: 'jtorres@email.com',
            direccion: 'Av. Brasil 369, Magdalena',
            empresa_id: 5
        },
        {
            id: 10,
            nombre: 'Lucía Mercedes',
            apellidos: 'González Paredes',
            dni: '01234567',
            fecha_nacimiento: '1993-06-14',
            edad: 31,
            sexo: 'Femenino',
            telefono: '987-543-210',
            email: 'lgonzalez@email.com',
            direccion: 'Jr. Independencia 741, Miraflores',
            empresa_id: 5
        }
    ],

    // Exámenes programados con diferentes estados
    examenes: [
        {
            id: 1,
            codigo: 'EMO-2024-001',
            paciente_id: 1,
            empresa_id: 1,
            tipo_examen: 'EMO',
            subtipo_examen: 'ingreso',
            componentes_emo: JSON.stringify([
                'signos_vitales', 'oftalmologia', 'audiometria', 
                'cardiologia', 'psicologia', 'ekg', 'espirometria', 
                'laboratorio', 'radiologia'
            ]),
            fecha_programada: '2024-01-15 09:00:00',
            fecha_realizada: '2024-01-15 09:30:00',
            tecnico_id: 3,
            medico_id: 1,
            estado: 'completado',
            aptitud: 'apto',
            resultados: JSON.stringify({
                signos_vitales: { presion: '120/80', pulso: '72', temperatura: '36.5', peso: '75', talla: '175' },
                oftalmologia: { agudeza_visual_od: '20/20', agudeza_visual_oi: '20/20', vision_colores: 'normal' },
                audiometria: { od_500: 15, od_1000: 10, od_2000: 15, oi_500: 10, oi_1000: 15, oi_2000: 10 },
                cardiologia: { ritmo: 'regular', soplos: 'no', conclusion: 'normal' },
                psicologia: { estado_mental: 'normal', aptitud_psicologica: 'apto' },
                ekg: { ritmo: 'sinusal', conclusion: 'normal' },
                espirometria: { fvc: '4.2L', fev1: '3.5L', conclusion: 'normal' },
                laboratorio: { hemoglobina: '14.5', glucosa: '95', colesterol: '180' },
                radiologia: { torax: 'normal', conclusion: 'sin alteraciones' }
            }),
            observaciones: 'Examen completo sin observaciones',
            procesado: 1,
            cupo_dia: 1
        },
        {
            id: 2,
            codigo: 'EMO-2024-002',
            paciente_id: 2,
            empresa_id: 1,
            tipo_examen: 'EMO',
            subtipo_examen: 'anual',
            componentes_emo: JSON.stringify([
                'signos_vitales', 'oftalmologia', 'audiometria', 
                'psicologia', 'laboratorio'
            ]),
            fecha_programada: '2024-01-16 10:00:00',
            fecha_realizada: '2024-01-16 10:15:00',
            tecnico_id: 3,
            medico_id: 1,
            estado: 'completado',
            aptitud: 'apto_con_restricciones',
            resultados: JSON.stringify({
                signos_vitales: { presion: '130/85', pulso: '78', temperatura: '36.8', peso: '68', talla: '162' },
                oftalmologia: { agudeza_visual_od: '20/25', agudeza_visual_oi: '20/20', vision_colores: 'normal' },
                audiometria: { od_500: 20, od_1000: 25, od_2000: 30, oi_500: 15, oi_1000: 20, oi_2000: 25 },
                psicologia: { estado_mental: 'normal', aptitud_psicologica: 'apto' },
                laboratorio: { hemoglobina: '13.8', glucosa: '105', colesterol: '195' }
            }),
            observaciones: 'Leve pérdida auditiva en frecuencias altas - usar protección auditiva',
            procesado: 1,
            cupo_dia: 2
        },
        {
            id: 3,
            codigo: 'EMO-2024-003',
            paciente_id: 3,
            empresa_id: 2,
            tipo_examen: 'EMO',
            subtipo_examen: 'ingreso',
            componentes_emo: JSON.stringify([
                'signos_vitales', 'oftalmologia', 'audiometria', 
                'cardiologia', 'ekg', 'espirometria', 'radiologia'
            ]),
            fecha_programada: '2024-01-17 08:30:00',
            fecha_realizada: null,
            tecnico_id: 3,
            medico_id: 1,
            estado: 'en_proceso',
            aptitud: null,
            resultados: JSON.stringify({
                signos_vitales: { presion: '125/82', pulso: '70', temperatura: '36.6', peso: '80', talla: '178' },
                oftalmologia: { agudeza_visual_od: '20/20', agudeza_visual_oi: '20/20', vision_colores: 'normal' }
            }),
            observaciones: 'Examen en proceso - pendiente completar evaluaciones',
            procesado: 0,
            cupo_dia: 1
        },
        {
            id: 4,
            codigo: 'EME-2024-001',
            paciente_id: 4,
            empresa_id: 2,
            tipo_examen: 'especifico',
            subtipo_examen: 'altura_estructural',
            componentes_emo: JSON.stringify([
                'signos_vitales', 'oftalmologia', 'audiometria', 
                'psicologia', 'altura'
            ]),
            fecha_programada: '2024-01-18 09:30:00',
            fecha_realizada: null,
            tecnico_id: 3,
            medico_id: 1,
            estado: 'programado',
            aptitud: null,
            resultados: null,
            observaciones: 'Examen específico para trabajo en altura',
            procesado: 0,
            cupo_dia: 2
        },
        {
            id: 5,
            codigo: 'EMO-2024-004',
            paciente_id: 5,
            empresa_id: 3,
            tipo_examen: 'EMO',
            subtipo_examen: 'retiro',
            componentes_emo: JSON.stringify([
                'signos_vitales', 'oftalmologia', 'audiometria', 
                'cardiologia', 'psicologia', 'laboratorio', 'radiologia'
            ]),
            fecha_programada: '2024-01-19 11:00:00',
            fecha_realizada: '2024-01-19 11:20:00',
            tecnico_id: 3,
            medico_id: 1,
            estado: 'completado',
            aptitud: 'observado',
            resultados: JSON.stringify({
                signos_vitales: { presion: '140/90', pulso: '85', temperatura: '37.0', peso: '85', talla: '180' },
                oftalmologia: { agudeza_visual_od: '20/30', agudeza_visual_oi: '20/25', vision_colores: 'normal' },
                audiometria: { od_500: 25, od_1000: 30, od_2000: 35, oi_500: 20, oi_1000: 25, oi_2000: 30 },
                cardiologia: { ritmo: 'regular', soplos: 'no', conclusion: 'hipertensión leve' },
                psicologia: { estado_mental: 'normal', aptitud_psicologica: 'apto' },
                laboratorio: { hemoglobina: '15.2', glucosa: '110', colesterol: '220' },
                radiologia: { torax: 'normal', conclusion: 'sin alteraciones significativas' }
            }),
            observaciones: 'Hipertensión leve detectada - requiere seguimiento médico',
            procesado: 1,
            cupo_dia: 1
        }
    ],

    // Cupos diarios para control de programación
    cupos_diarios: [
        {
            id: 1,
            fecha: '2024-01-15',
            empresa_id: 1,
            cupos_utilizados: 2,
            cupos_maximos: 20
        },
        {
            id: 2,
            fecha: '2024-01-16',
            empresa_id: 1,
            cupos_utilizados: 1,
            cupos_maximos: 20
        },
        {
            id: 3,
            fecha: '2024-01-17',
            empresa_id: 2,
            cupos_utilizados: 1,
            cupos_maximos: 20
        },
        {
            id: 4,
            fecha: '2024-01-18',
            empresa_id: 2,
            cupos_utilizados: 1,
            cupos_maximos: 20
        },
        {
            id: 5,
            fecha: '2024-01-19',
            empresa_id: 3,
            cupos_utilizados: 1,
            cupos_maximos: 20
        }
    ],

    // Interconsultas médicas
    interconsultas: [
        {
            id: 1,
            paciente_id: 2,
            examen_id: 2,
            medico_solicitante_id: 1,
            medico_especialista_id: 3,
            especialidad_requerida: 'Audiología',
            motivo: 'Evaluación especializada por pérdida auditiva en frecuencias altas',
            observaciones: 'Paciente refiere exposición prolongada a ruido industrial',
            estado: 'completada',
            fecha_solicitud: '2024-01-16 11:00:00',
            fecha_respuesta: '2024-01-16 14:30:00'
        },
        {
            id: 2,
            paciente_id: 5,
            examen_id: 5,
            medico_solicitante_id: 1,
            medico_especialista_id: null,
            especialidad_requerida: 'Cardiología',
            motivo: 'Evaluación cardiológica por hipertensión detectada',
            observaciones: 'Presión arterial elevada en múltiples tomas',
            estado: 'pendiente',
            fecha_solicitud: '2024-01-19 12:00:00',
            fecha_respuesta: null
        }
    ]
};

// Función para inicializar la base de datos con datos de prueba
async function initializeDemoData() {
    try {
        console.log('🔄 Inicializando base de datos con datos de prueba...');

        // Limpiar tablas existentes
        await database.run('DELETE FROM interconsultas');
        await database.run('DELETE FROM cupos_diarios');
        await database.run('DELETE FROM examenes');
        await database.run('DELETE FROM pacientes');
        await database.run('DELETE FROM medicos');
        await database.run('DELETE FROM empresas');
        await database.run('DELETE FROM usuarios');

        // Insertar usuarios
        console.log('👥 Insertando usuarios...');
        for (const usuario of demoData.usuarios) {
            const hashedPassword = await bcrypt.hash(usuario.contraseña, 10);
            await database.run(`
                INSERT INTO usuarios (id, nombre, usuario, email, contraseña, rol, empresa_id, activo, fecha_creacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                usuario.id, usuario.nombre + ' ' + usuario.apellidos, usuario.usuario, 
                usuario.email, hashedPassword, usuario.rol, usuario.empresa_id || null, usuario.activo
            ]);
        }

        // Insertar empresas
        console.log('🏢 Insertando empresas...');
        for (const empresa of demoData.empresas) {
            await database.run(`
                INSERT INTO empresas (id, nombre, ruc, direccion, telefono, email, contacto_principal, activa, fecha_registro)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                empresa.id, empresa.nombre, empresa.ruc, empresa.direccion,
                empresa.telefono, empresa.email, empresa.contacto_principal, empresa.activa
            ]);
        }

        // Insertar médicos
        console.log('👨‍⚕️ Insertando médicos...');
        for (const medico of demoData.medicos) {
            await database.run(`
                INSERT INTO medicos (id, nombre, apellidos, especialidad, colegiatura, telefono, email, permisos_examenes, activo, fecha_registro)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                medico.id, medico.nombre, medico.apellidos, medico.especialidad,
                medico.colegiatura, medico.telefono, medico.email, medico.permisos_examenes, medico.activo
            ]);
        }

        // Insertar pacientes
        console.log('🧑‍💼 Insertando pacientes...');
        for (const paciente of demoData.pacientes) {
            await database.run(`
                INSERT INTO pacientes (id, nombre, apellidos, dni, fecha_nacimiento, edad, sexo, telefono, email, direccion, empresa_id, fecha_registro)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                paciente.id, paciente.nombre, paciente.apellidos, paciente.dni,
                paciente.fecha_nacimiento, paciente.edad, paciente.sexo, paciente.telefono,
                paciente.email, paciente.direccion, paciente.empresa_id
            ]);
        }

        // Insertar exámenes
        console.log('🩺 Insertando exámenes...');
        for (const examen of demoData.examenes) {
            await database.run(`
                INSERT INTO examenes (id, codigo, paciente_id, empresa_id, tipo_examen, subtipo_examen, componentes_emo, fecha_programada, fecha_realizada, tecnico_id, medico_id, estado, aptitud, resultados, observaciones, procesado, cupo_dia, fecha_creacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `, [
                examen.id, examen.codigo, examen.paciente_id, examen.empresa_id,
                examen.tipo_examen, examen.subtipo_examen, examen.componentes_emo, examen.fecha_programada,
                examen.fecha_realizada, examen.tecnico_id, examen.medico_id, examen.estado,
                examen.aptitud, examen.resultados, examen.observaciones, examen.procesado, examen.cupo_dia
            ]);
        }

        // Insertar cupos diarios
        console.log('📅 Insertando cupos diarios...');
        for (const cupo of demoData.cupos_diarios) {
            await database.run(`
                INSERT INTO cupos_diarios (id, fecha, empresa_id, cupos_utilizados, cupos_maximos, fecha_creacion)
                VALUES (?, ?, ?, ?, ?, datetime('now'))
            `, [cupo.id, cupo.fecha, cupo.empresa_id, cupo.cupos_utilizados, cupo.cupos_maximos]);
        }

        // Insertar interconsultas
        console.log('📋 Insertando interconsultas...');
        for (const interconsulta of demoData.interconsultas) {
            await database.run(`
                INSERT INTO interconsultas (id, paciente_id, examen_id, medico_solicitante_id, medico_especialista_id, especialidad_requerida, motivo, observaciones, estado, fecha_solicitud, fecha_respuesta)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                interconsulta.id, interconsulta.paciente_id, interconsulta.examen_id,
                interconsulta.medico_solicitante_id, interconsulta.medico_especialista_id,
                interconsulta.especialidad_requerida, interconsulta.motivo, interconsulta.observaciones,
                interconsulta.estado, interconsulta.fecha_solicitud, interconsulta.fecha_respuesta
            ]);
        }

        console.log('✅ Base de datos inicializada correctamente con datos de prueba');
        console.log('📊 Datos creados:');
        console.log(`   - ${demoData.usuarios.length} usuarios`);
        console.log(`   - ${demoData.empresas.length} empresas`);
        console.log(`   - ${demoData.medicos.length} médicos`);
        console.log(`   - ${demoData.pacientes.length} pacientes`);
        console.log(`   - ${demoData.examenes.length} exámenes`);
        console.log(`   - ${demoData.cupos_diarios.length} registros de cupos`);
        console.log(`   - ${demoData.interconsultas.length} interconsultas`);
        
        console.log('\\n🔑 Credenciales de acceso:');
        console.log('   - Administrador: admin / admin123');
        console.log('   - Admisionista: admisionista / admin123');
        console.log('   - Técnico: tecnico / admin123');
        console.log('   - Empresa: empresa / admin123');
        console.log('   - Médico: medico / admin123');

    } catch (error) {
        console.error('❌ Error inicializando datos de prueba:', error);
        throw error;
    }
}

module.exports = {
    initializeDemoData,
    demoData
};