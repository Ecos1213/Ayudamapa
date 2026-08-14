-- emergencias_colombia.sql
-- Plataforma de Coordinación de Emergencias - Colombia
-- MySQL 8.0+

DROP DATABASE IF EXISTS emergencias_colombia;
CREATE DATABASE emergencias_colombia CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE emergencias_colombia;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(255),
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE tipos_lugar (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE estados_lugar (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE niveles_urgencia (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    orden TINYINT UNSIGNED NOT NULL
) ENGINE=InnoDB;

CREATE TABLE estados_acceso (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE estados_necesidad (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE estados_reporte (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE entidades (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(80) NOT NULL,
    nit VARCHAR(30) UNIQUE,
    telefono VARCHAR(30),
    email VARCHAR(150),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    departamento VARCHAR(100),
    verificada TINYINT(1) NOT NULL DEFAULT 0,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_entidad_ciudad (ciudad, departamento)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rol_id INT UNSIGNED NOT NULL,
    entidad_id BIGINT UNSIGNED NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    telefono VARCHAR(30),
    documento VARCHAR(30),
    activo TINYINT(1) NOT NULL DEFAULT 1,
    verificado TINYINT(1) NOT NULL DEFAULT 0,
    ultimo_acceso DATETIME NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_usuario_entidad FOREIGN KEY (entidad_id) REFERENCES entidades(id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_usuario_rol (rol_id),
    INDEX idx_usuario_entidad (entidad_id),
    INDEX idx_usuario_activo (activo)
) ENGINE=InnoDB;

CREATE TABLE lugares (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo_id TINYINT UNSIGNED NOT NULL,
    estado_id TINYINT UNSIGNED NOT NULL,
    urgencia_id TINYINT UNSIGNED NOT NULL,
    acceso_id TINYINT UNSIGNED NOT NULL,
    nombre VARCHAR(180) NOT NULL,
    direccion VARCHAR(255),
    ciudad VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    capacidad INT UNSIGNED NOT NULL DEFAULT 0,
    personas_atendidas INT UNSIGNED NOT NULL DEFAULT 0,
    contacto VARCHAR(150),
    verificado TINYINT(1) NOT NULL DEFAULT 0,
    reportado_por BIGINT UNSIGNED NULL,
    verificado_por BIGINT UNSIGNED NULL,
    fecha_verificacion DATETIME NULL,
    ultima_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lugar_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_lugar(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_lugar_estado FOREIGN KEY (estado_id) REFERENCES estados_lugar(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_lugar_urgencia FOREIGN KEY (urgencia_id) REFERENCES niveles_urgencia(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_lugar_acceso FOREIGN KEY (acceso_id) REFERENCES estados_acceso(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_lugar_reportado FOREIGN KEY (reportado_por) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_lugar_verificado FOREIGN KEY (verificado_por) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_lugar_lat CHECK (lat BETWEEN -90 AND 90),
    CONSTRAINT chk_lugar_lng CHECK (lng BETWEEN -180 AND 180),
    INDEX idx_lugar_ciudad_departamento (ciudad, departamento),
    INDEX idx_lugar_tipo (tipo_id),
    INDEX idx_lugar_estado (estado_id),
    INDEX idx_lugar_urgencia (urgencia_id),
    INDEX idx_lugar_verificado (verificado),
    INDEX idx_lugar_actualizacion (ultima_actualizacion),
    INDEX idx_lugar_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE necesidades (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lugar_id BIGINT UNSIGNED NOT NULL,
    item VARCHAR(180) NOT NULL,
    cantidad_requerida DECIMAL(12,2) NOT NULL DEFAULT 0,
    cantidad_cubierta DECIMAL(12,2) NOT NULL DEFAULT 0,
    unidad VARCHAR(50) NOT NULL DEFAULT 'unidades',
    estado_id TINYINT UNSIGNED NOT NULL,
    ultima_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_necesidad_lugar FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_necesidad_estado FOREIGN KEY (estado_id) REFERENCES estados_necesidad(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_necesidad_requerida CHECK (cantidad_requerida >= 0),
    CONSTRAINT chk_necesidad_cubierta CHECK (cantidad_cubierta >= 0 AND cantidad_cubierta <= cantidad_requerida),
    INDEX idx_necesidad_lugar (lugar_id),
    INDEX idx_necesidad_item (item),
    INDEX idx_necesidad_estado (estado_id),
    INDEX idx_necesidad_pendiente (item, estado_id)
) ENGINE=InnoDB;

CREATE TABLE reportes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lugar_id BIGINT UNSIGNED NULL,
    reportado_por BIGINT UNSIGNED NULL,
    revisado_por BIGINT UNSIGNED NULL,
    tipo_reporte VARCHAR(50) NOT NULL,
    titulo VARCHAR(180) NOT NULL,
    descripcion TEXT NOT NULL,
    ciudad VARCHAR(100),
    departamento VARCHAR(100),
    lat DECIMAL(10,7) NULL,
    lng DECIMAL(10,7) NULL,
    estado_reporte_id TINYINT UNSIGNED NOT NULL,
    fecha_reporte DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revision DATETIME NULL,
    comentario_revision TEXT NULL,
    CONSTRAINT fk_reporte_lugar FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_reporte_usuario FOREIGN KEY (reportado_por) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_reporte_revisor FOREIGN KEY (revisado_por) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_reporte_estado FOREIGN KEY (estado_reporte_id) REFERENCES estados_reporte(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_reporte_lat CHECK (lat IS NULL OR lat BETWEEN -90 AND 90),
    CONSTRAINT chk_reporte_lng CHECK (lng IS NULL OR lng BETWEEN -180 AND 180),
    INDEX idx_reporte_estado (estado_reporte_id),
    INDEX idx_reporte_lugar (lugar_id),
    INDEX idx_reporte_fecha (fecha_reporte),
    INDEX idx_reporte_ciudad (ciudad, departamento)
) ENGINE=InnoDB;

CREATE TABLE historial_lugares (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lugar_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    datos_anteriores JSON NULL,
    datos_nuevos JSON NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_lugar FOREIGN KEY (lugar_id) REFERENCES lugares(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_historial_lugar_fecha (lugar_id, creado_en),
    INDEX idx_historial_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE auditoria (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NULL,
    accion VARCHAR(80) NOT NULL,
    tabla_afectada VARCHAR(80),
    registro_id BIGINT UNSIGNED NULL,
    descripcion TEXT,
    ip VARCHAR(45),
    user_agent VARCHAR(500),
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_auditoria_usuario_fecha (usuario_id, creado_en),
    INDEX idx_auditoria_tabla_registro (tabla_afectada, registro_id),
    INDEX idx_auditoria_fecha (creado_en)
) ENGINE=InnoDB;

CREATE TABLE usuarios_entidades (
    usuario_id BIGINT UNSIGNED NOT NULL,
    entidad_id BIGINT UNSIGNED NOT NULL,
    cargo VARCHAR(120),
    verificado TINYINT(1) NOT NULL DEFAULT 0,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, entidad_id),
    CONSTRAINT fk_ue_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ue_entidad FOREIGN KEY (entidad_id) REFERENCES entidades(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO roles (codigo, nombre, descripcion) VALUES
('citizen', 'Ciudadano', 'Consulta información y envía reportes'),
('volunteer', 'Voluntario', 'Reporta y edita lugares autorizados'),
('entity', 'Entidad verificada', 'Crea, edita, verifica y prioriza información'),
('coordinator', 'Coordinador', 'Aprueba reportes y supervisa la operación'),
('admin', 'Administrador', 'Control administrativo completo');

INSERT INTO tipos_lugar (codigo, nombre) VALUES
('albergue', 'Albergue'),
('rescate', 'Zona de rescate / escombros'),
('acopio', 'Punto de acopio'),
('salud', 'Centro de salud');

INSERT INTO estados_lugar (codigo, nombre) VALUES
('activo', 'Activo'),
('cerrado', 'Cerrado'),
('en_riesgo', 'En riesgo');

INSERT INTO niveles_urgencia (codigo, nombre, orden) VALUES
('alta', 'Alta', 1),
('media', 'Media', 2),
('baja', 'Baja', 3);

INSERT INTO estados_acceso (codigo, nombre) VALUES
('accesible', 'Accesible'),
('parcial', 'Vía parcialmente bloqueada'),
('bloqueada', 'Vía bloqueada');

INSERT INTO estados_necesidad (codigo, nombre) VALUES
('cubierta', 'Cubierta'),
('parcial', 'Parcial'),
('pendiente', 'Pendiente');

INSERT INTO estados_reporte (codigo, nombre) VALUES
('pendiente', 'Pendiente de revisión'),
('aprobado', 'Aprobado'),
('rechazado', 'Rechazado'),
('corregir', 'Requiere corrección');

INSERT INTO entidades (nombre, tipo, telefono, email, ciudad, departamento, verificada) VALUES
('Cuerpo de Bomberos - Ejemplo', 'Bomberos', '3000000000', 'bomberos@example.com', 'Cali', 'Valle del Cauca', 1),
('Organización de Ayuda Comunitaria - Ejemplo', 'ONG', '3010000000', 'ong@example.com', 'Cali', 'Valle del Cauca', 1);

-- Cuentas administrativas iniciales.
-- password_hash queda NULL intencionalmente.
-- El backend debe establecer un hash bcrypt antes del login.

INSERT INTO usuarios (rol_id, nombres, apellidos, email, telefono, verificado, activo) VALUES
((SELECT id FROM roles WHERE codigo = 'admin'), 'Administrador', 'Principal', 'admin@emergencias.local', '3000000000', 1, 1),
((SELECT id FROM roles WHERE codigo = 'coordinator'), 'Coordinador', 'Principal', 'coordinador@emergencias.local', '3000000001', 1, 1);

INSERT INTO usuarios (rol_id, entidad_id, nombres, apellidos, email, telefono, verificado, activo) VALUES
((SELECT id FROM roles WHERE codigo = 'entity'), (SELECT id FROM entidades WHERE email = 'bomberos@example.com'), 'Usuario', 'Bomberos', 'bombero@emergencias.local', '3000000002', 1, 1),
((SELECT id FROM roles WHERE codigo = 'volunteer'), NULL, 'Voluntario', 'Ejemplo', 'voluntario@emergencias.local', '3000000003', 1, 1),
((SELECT id FROM roles WHERE codigo = 'citizen'), NULL, 'Ciudadano', 'Ejemplo', 'ciudadano@emergencias.local', '3000000004', 1, 1);

INSERT INTO lugares (
    tipo_id, estado_id, urgencia_id, acceso_id, nombre, direccion, ciudad, departamento,
    lat, lng, capacidad, personas_atendidas, contacto, verificado, reportado_por
) VALUES
(
    (SELECT id FROM tipos_lugar WHERE codigo = 'albergue'),
    (SELECT id FROM estados_lugar WHERE codigo = 'activo'),
    (SELECT id FROM niveles_urgencia WHERE codigo = 'alta'),
    (SELECT id FROM estados_acceso WHERE codigo = 'accesible'),
    'Albergue Comunitario San José', 'Carrera 10 # 20-30', 'Cali', 'Valle del Cauca',
    3.4516000, -76.5320000, 300, 185, '3001112233', 1,
    (SELECT id FROM usuarios WHERE email = 'coordinador@emergencias.local')
),
(
    (SELECT id FROM tipos_lugar WHERE codigo = 'acopio'),
    (SELECT id FROM estados_lugar WHERE codigo = 'activo'),
    (SELECT id FROM niveles_urgencia WHERE codigo = 'media'),
    (SELECT id FROM estados_acceso WHERE codigo = 'accesible'),
    'Punto de Acopio Central', 'Calle 15 # 8-20', 'Cali', 'Valle del Cauca',
    3.4372000, -76.5225000, 0, 0, '3004445566', 1,
    (SELECT id FROM usuarios WHERE email = 'bombero@emergencias.local')
),
(
    (SELECT id FROM tipos_lugar WHERE codigo = 'salud'),
    (SELECT id FROM estados_lugar WHERE codigo = 'en_riesgo'),
    (SELECT id FROM niveles_urgencia WHERE codigo = 'alta'),
    (SELECT id FROM estados_acceso WHERE codigo = 'parcial'),
    'Centro de Salud Comunitario', 'Carrera 5 # 30-10', 'Cali', 'Valle del Cauca',
    3.4251000, -76.5401000, 120, 98, '3007778899', 1,
    (SELECT id FROM usuarios WHERE email = 'coordinador@emergencias.local')
);

INSERT INTO necesidades (lugar_id, item, cantidad_requerida, cantidad_cubierta, unidad, estado_id) VALUES
((SELECT id FROM lugares WHERE nombre = 'Albergue Comunitario San José'), 'Agua', 1000, 300, 'litros', (SELECT id FROM estados_necesidad WHERE codigo = 'parcial')),
((SELECT id FROM lugares WHERE nombre = 'Albergue Comunitario San José'), 'Alimentos', 500, 100, 'raciones', (SELECT id FROM estados_necesidad WHERE codigo = 'parcial')),
((SELECT id FROM lugares WHERE nombre = 'Albergue Comunitario San José'), 'Mantas', 200, 200, 'unidades', (SELECT id FROM estados_necesidad WHERE codigo = 'cubierta')),
((SELECT id FROM lugares WHERE nombre = 'Albergue Comunitario San José'), 'Kits de higiene', 150, 0, 'kits', (SELECT id FROM estados_necesidad WHERE codigo = 'pendiente')),
((SELECT id FROM lugares WHERE nombre = 'Punto de Acopio Central'), 'Linternas', 50, 12, 'unidades', (SELECT id FROM estados_necesidad WHERE codigo = 'parcial')),
((SELECT id FROM lugares WHERE nombre = 'Punto de Acopio Central'), 'Colchonetas', 80, 0, 'unidades', (SELECT id FROM estados_necesidad WHERE codigo = 'pendiente')),
((SELECT id FROM lugares WHERE nombre = 'Centro de Salud Comunitario'), 'Medicamentos', 100, 20, 'kits', (SELECT id FROM estados_necesidad WHERE codigo = 'parcial')),
((SELECT id FROM lugares WHERE nombre = 'Centro de Salud Comunitario'), 'Guantes', 500, 500, 'pares', (SELECT id FROM estados_necesidad WHERE codigo = 'cubierta'));

INSERT INTO usuarios_entidades (usuario_id, entidad_id, cargo, verificado, activo) VALUES
(
    (SELECT id FROM usuarios WHERE email = 'bombero@emergencias.local'),
    (SELECT id FROM entidades WHERE email = 'bomberos@example.com'),
    'Coordinador de operaciones', 1, 1
);

INSERT INTO reportes (
    lugar_id, reportado_por, tipo_reporte, titulo, descripcion,
    ciudad, departamento, estado_reporte_id
) VALUES (
    (SELECT id FROM lugares WHERE nombre = 'Albergue Comunitario San José'),
    (SELECT id FROM usuarios WHERE email = 'ciudadano@emergencias.local'),
    'necesidad',
    'Falta agua en el albergue',
    'Se reporta necesidad adicional de agua para las personas atendidas.',
    'Cali',
    'Valle del Cauca',
    (SELECT id FROM estados_reporte WHERE codigo = 'pendiente')
);

CREATE VIEW vw_lugares_completos AS
SELECT
    l.id, l.nombre, tl.codigo AS tipo, tl.nombre AS tipo_nombre,
    l.direccion, l.ciudad, l.departamento, l.lat, l.lng,
    l.capacidad, l.personas_atendidas, l.contacto,
    el.codigo AS estado, el.nombre AS estado_nombre,
    nu.codigo AS urgencia, nu.nombre AS urgencia_nombre,
    ea.codigo AS acceso, ea.nombre AS acceso_nombre,
    l.verificado, l.ultima_actualizacion,
    CONCAT(u.nombres, ' ', u.apellidos) AS reportado_por
FROM lugares l
INNER JOIN tipos_lugar tl ON tl.id = l.tipo_id
INNER JOIN estados_lugar el ON el.id = l.estado_id
INNER JOIN niveles_urgencia nu ON nu.id = l.urgencia_id
INNER JOIN estados_acceso ea ON ea.id = l.acceso_id
LEFT JOIN usuarios u ON u.id = l.reportado_por;

CREATE VIEW vw_necesidades_pendientes AS
SELECT
    n.id, n.lugar_id, l.nombre AS lugar, l.ciudad, l.departamento,
    n.item, n.cantidad_requerida, n.cantidad_cubierta,
    (n.cantidad_requerida - n.cantidad_cubierta) AS cantidad_faltante,
    n.unidad, en.codigo AS estado, en.nombre AS estado_nombre
FROM necesidades n
INNER JOIN lugares l ON l.id = n.lugar_id
INNER JOIN estados_necesidad en ON en.id = n.estado_id
WHERE n.cantidad_requerida > n.cantidad_cubierta;

SET FOREIGN_KEY_CHECKS = 1;

-- Comprobaciones:
-- SELECT * FROM vw_lugares_completos;
-- SELECT * FROM vw_necesidades_pendientes;
-- SELECT u.id, u.email, r.codigo AS rol
-- FROM usuarios u INNER JOIN roles r ON r.id = u.rol_id
-- WHERE r.codigo IN ('admin','coordinator');
