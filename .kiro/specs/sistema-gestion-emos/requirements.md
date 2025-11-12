# Documento de Requerimientos - Sistema de Gestión de Exámenes Médicos Ocupacionales (EMOS)

## Introducción

El Sistema de Gestión de Exámenes Médicos Ocupacionales (EMOS) es una aplicación web moderna diseñada para el Policlínico Villa Salud SRL. El sistema permitirá la gestión integral de exámenes médicos ocupacionales con diferentes perfiles de usuario, control de accesos por roles, y una interfaz amigable y responsiva.

## Glosario

- **EMOS**: Sistema de Gestión de Exámenes Médicos Ocupacionales
- **Usuario_Sistema**: Cualquier persona que interactúa con el sistema
- **Administrador**: Usuario con acceso completo a todas las funcionalidades
- **Admisionista**: Usuario encargado de la gestión de pacientes y programación de exámenes
- **Tecnico**: Usuario que realiza exámenes técnicos y registra resultados
- **Empresa**: Usuario corporativo que programa exámenes para sus trabajadores
- **Medico**: Usuario especialista que registra conclusiones médicas
- **Paciente**: Persona que se somete a exámenes médicos ocupacionales
- **Examen_Ocupacional**: Evaluación médica requerida para determinar aptitud laboral
- **Interconsulta**: Derivación médica entre especialistas
- **Dashboard**: Panel de control con estadísticas y métricas del sistema

## Requerimientos

### Requerimiento 1

**Historia de Usuario:** Como Administrador del sistema, quiero tener acceso total a todas las funcionalidades, para poder gestionar y supervisar completamente el sistema EMOS.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ permitir al Administrador acceso total a todos los módulos: Dashboard, Configuración, Notificaciones, Chat interno, Inventario/Backup, Cerrar sesión, Gestión de usuarios, Roles y permisos, Gestión de citas, Gestión de pacientes, Gestión de empresas, Gestión de médicos, Gestión de exámenes
2. EL Sistema_EMOS DEBERÁ permitir al Administrador realizar operaciones CRUD completas (agregar, editar, eliminar) en todas las gestiones
3. EL Sistema_EMOS DEBERÁ permitir al Administrador configurar roles, permisos, usuarios y médicos con acceso exclusivo
4. EL Sistema_EMOS DEBERÁ mostrar al Administrador un dashboard completo con todas las métricas del sistema

### Requerimiento 2

**Historia de Usuario:** Como Admisionista, quiero gestionar pacientes, empresas, médicos y exámenes, para organizar eficientemente el flujo de trabajo del policlínico.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ permitir al Admisionista acceso a gestión de pacientes, gestión de exámenes y gestión de empresas
2. EL Sistema_EMOS DEBERÁ permitir al Admisionista agregar y editar registros en pacientes, empresas, médicos y exámenes, pero restringir la eliminación
3. EL Sistema_EMOS DEBERÁ permitir al Admisionista crear y editar hojas de interconsulta
4. EL Sistema_EMOS DEBERÁ mostrar al Admisionista una vista filtrada según sus permisos de rol sin acceso a configuración del sistema

### Requerimiento 3

**Historia de Usuario:** Como Técnico, quiero gestionar pacientes, empresas, exámenes y médicos, para completar el proceso técnico de evaluación médica.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ permitir al Tecnico acceso a gestión de pacientes, gestión de exámenes, gestión de empresas y gestión de médicos
2. EL Sistema_EMOS DEBERÁ permitir al Tecnico agregar y editar registros en pacientes, empresas, exámenes y médicos, pero restringir la eliminación
3. EL Sistema_EMOS DEBERÁ permitir al Tecnico registrar resultados de exámenes técnicos y establecer aptitud laboral
4. EL Sistema_EMOS DEBERÁ permitir al Tecnico crear y editar hojas de interconsulta

### Requerimiento 4

**Historia de Usuario:** Como Empresa, quiero programar exámenes para mis trabajadores y descargar resultados, para cumplir con las normativas de salud ocupacional.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ permitir a la Empresa programar exámenes seleccionando datos del paciente, tipo de examen, fecha y cupos disponibles
2. EL Sistema_EMOS DEBERÁ mostrar a la Empresa cupos disponibles al programar exámenes con límite de 20 exámenes por día
3. EL Sistema_EMOS DEBERÁ permitir a la Empresa solo ver resultados de exámenes de sus trabajadores
4. EL Sistema_EMOS DEBERÁ permitir a la Empresa descargar resultados completos en PDF cuando estén procesados
5. EL Sistema_EMOS DEBERÁ restringir a la Empresa el acceso solo a gestión de exámenes

### Requerimiento 5

**Historia de Usuario:** Como Médico especialista, quiero acceder a exámenes de mi especialidad y registrar conclusiones, para completar las evaluaciones médicas ocupacionales.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ proporcionar al Medico acceso limitado según permisos otorgados por especialidad
2. EL Sistema_EMOS DEBERÁ permitir al Medico acceder solo a exámenes específicos según permisos (ej. Oftalmología, Audiometría)
3. EL Sistema_EMOS DEBERÁ permitir al Medico ver resultados y registrar conclusiones médicas en exámenes permitidos
4. EL Sistema_EMOS DEBERÁ restringir al Medico el acceso a exámenes fuera de sus permisos asignados

### Requerimiento 6

**Historia de Usuario:** Como Usuario_Sistema, quiero una interfaz responsiva y amigable, para acceder al sistema desde diferentes dispositivos de manera eficiente.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ mostrar una interfaz responsiva que se adapte a dispositivos móviles y de escritorio
2. EL Sistema_EMOS DEBERÁ mantener los colores corporativos definidos en la paleta de colores
3. EL Sistema_EMOS DEBERÁ mostrar una página de inicio tipo landing page con acceso al login
4. EL Sistema_EMOS DEBERÁ proporcionar navegación intuitiva mediante menús y tarjetas

### Requerimiento 7

**Historia de Usuario:** Como Usuario_Sistema, quiero un sistema de autenticación seguro, para proteger la información médica confidencial.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ validar credenciales de usuario antes de permitir el acceso
2. EL Sistema_EMOS DEBERÁ mantener sesiones seguras durante el uso del sistema
3. EL Sistema_EMOS DEBERÁ redirigir a usuarios no autenticados a la página de login
4. EL Sistema_EMOS DEBERÁ permitir el cierre de sesión seguro

### Requerimiento 8

**Historia de Usuario:** Como Administrador, quiero gestionar la programación de exámenes, para optimizar el flujo de trabajo del policlínico.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ permitir programar exámenes ocupacionales con fecha, hora y tipo específico
2. EL Sistema_EMOS DEBERÁ mostrar el estado de aptitud (Apto/No Apto/Observado/Apto con restricciones)
3. CUANDO todos los resultados estén registrados, EL Sistema_EMOS DEBERÁ marcar el examen como "Completado"
4. EL Sistema_EMOS DEBERÁ permitir agregar exámenes adicionales a pacientes existentes

### Requerimiento 9

**Historia de Usuario:** Como Usuario_Sistema autorizado, quiero generar reportes en PDF, para documentar y compartir resultados de exámenes.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ generar reportes PDF con resultados consolidados de exámenes
2. EL Sistema_EMOS DEBERÁ incluir información completa del paciente y empresa en los reportes
3. EL Sistema_EMOS DEBERÁ permitir la descarga inmediata de reportes generados
4. EL Sistema_EMOS DEBERÁ mantener el formato profesional y legible en los reportes PDF

### Requerimiento 10

**Historia de Usuario:** Como Usuario_Sistema autorizado, quiero gestionar citas médicas, para organizar la agenda y programación del policlínico.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ permitir crear, editar y consultar citas médicas según permisos de rol
2. EL Sistema_EMOS DEBERÁ mostrar calendario de citas con disponibilidad de horarios
3. EL Sistema_EMOS DEBERÁ vincular citas con pacientes, médicos y tipos de examen
4. EL Sistema_EMOS DEBERÁ enviar notificaciones de recordatorio de citas programadas

### Requerimiento 11

**Historia de Usuario:** Como Usuario_Sistema, quiero acceder a un dashboard informativo, para monitorear métricas y estadísticas relevantes del sistema.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ mostrar estadísticas de exámenes realizados por período
2. EL Sistema_EMOS DEBERÁ mostrar gráficos dinámicos con datos actualizados
3. EL Sistema_EMOS DEBERÁ permitir filtrar información por fecha, médico o empresa
4. EL Sistema_EMOS DEBERÁ adaptar el dashboard según el rol del usuario

### Requerimiento 12

**Historia de Usuario:** Como Usuario_Sistema autorizado, quiero gestionar exámenes médicos ocupacionales con componentes específicos, para realizar evaluaciones completas de salud ocupacional.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ permitir seleccionar componentes de examen médico ocupacional: Signos vitales, Oftalmología, Audiometría, Cardiología, Psicología, EKG, Espirometría, Laboratorio, Altura, Radiología, Músculo esquelética, Odontología
2. EL Sistema_EMOS DEBERÁ permitir agregar exámenes adicionales a pacientes existentes si no se seleccionaron inicialmente
3. EL Sistema_EMOS DEBERÁ mostrar columna de aptitud para seleccionar: Apto, No Apto, Observado, Apto con restricciones
4. CUANDO todos los exámenes estén completos, EL Sistema_EMOS DEBERÁ mostrar estado "Completado" y habilitar opción "Procesar"
5. EL Sistema_EMOS DEBERÁ permitir editar cada examen individual y procesar resultados para descarga en PDF

### Requerimiento 13

**Historia de Usuario:** Como Usuario_Sistema con permisos, quiero gestionar médicos del sistema, para asignar especialistas a diferentes tipos de exámenes.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ permitir al Administrador agregar, editar y eliminar médicos
2. EL Sistema_EMOS DEBERÁ permitir al Admisionista y Técnico agregar y editar médicos, pero restringir eliminación
3. EL Sistema_EMOS DEBERÁ permitir asignar especialidades médicas a cada médico registrado
4. EL Sistema_EMOS DEBERÁ validar datos profesionales como colegiatura y especialidad

### Requerimiento 14

**Historia de Usuario:** Como Usuario_Sistema, quiero una página de inicio atractiva y amigable, para acceder fácilmente al sistema con una presentación profesional.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ mostrar una página de inicio llamativa con los colores corporativos del sistema
2. EL Sistema_EMOS DEBERÁ presentar información del Policlínico Villa Salud SRL de manera profesional
3. EL Sistema_EMOS DEBERÁ incluir animaciones y elementos visuales atractivos al cargar la página
4. EL Sistema_EMOS DEBERÁ proporcionar acceso directo al sistema de login desde la página principal

### Requerimiento 15

**Historia de Usuario:** Como Usuario_Sistema, quiero acceder a módulos específicos según mi rol, para trabajar eficientemente con las funcionalidades permitidas.

#### Criterios de Aceptación

1. EL Sistema_EMOS DEBERÁ mostrar todos los módulos al Administrador: Configuración, Notificaciones, Chat interno, Inventario/Backup, Cerrar sesión, Gestión de usuarios, Roles y permisos, Gestión de citas, Gestión de pacientes, Gestión de empresas, Gestión de exámenes, Gestión de médicos
2. EL Sistema_EMOS DEBERÁ mostrar módulos limitados al Admisionista: Gestión de pacientes, Gestión de exámenes, Gestión de empresas, Gestión de médicos, Hojas de interconsulta
3. EL Sistema_EMOS DEBERÁ mostrar módulos limitados al Técnico: Gestión de pacientes, Gestión de exámenes, Gestión de empresas, Gestión de médicos, Hojas de interconsulta
4. EL Sistema_EMOS DEBERÁ mostrar módulo único a la Empresa: Gestión de exámenes (solo ver resultados)