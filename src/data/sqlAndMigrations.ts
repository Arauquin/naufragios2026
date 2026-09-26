// SQL Scripts and Laravel Migration Definitions based on technical document UP-UCV (Leal Cuervo, Ortega & Fernandez)

export const FULL_MYSQL_SCRIPT = `-- ============================================================
-- SISTEMA WEB DE GESTIÓN: HISTÓRICA DE NAUFRAGIOS Y TOPONIMIA
-- Aguas Territoriales de la República de Panamá (Siglos XVI y XVII)
-- Basado en: Propuesta Leal Cuervo, Ortega & Fernández (UP / UCV)
-- Compatible: MySQL 8.x / MariaDB 10.5+
-- Motor: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS \`naufragios_panama\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`naufragios_panama\`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. TABLA: users (Usuarios del Sistema)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(150) NOT NULL COMMENT 'Nombre completo del investigador o usuario',
  \`email\` VARCHAR(200) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt con factor de coste >= 12',
  \`email_verified_at\` TIMESTAMP NULL DEFAULT NULL,
  \`verification_code\` VARCHAR(6) NULL DEFAULT NULL COMMENT 'Código OTP de 6 dígitos para validar existencia de correo',
  \`code_expires_at\` TIMESTAMP NULL DEFAULT NULL COMMENT 'Expiración OTP (15 minutos)',
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=inactivo (no verificado), 1=activo verificado',
  \`institution\` VARCHAR(250) NULL COMMENT 'Universidad, Museo o Centro de Investigación',
  \`investigation_purpose\` TEXT NULL COMMENT 'Propósito y justificación científica',
  \`last_login_at\` TIMESTAMP NULL DEFAULT NULL,
  \`last_login_ip\` VARCHAR(45) NULL DEFAULT NULL,
  \`remember_token\` VARCHAR(100) NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL COMMENT 'SoftDelete: auditoría forense',
  PRIMARY KEY (\`id\`),
  INDEX \`idx_users_email\` (\`email\`),
  INDEX \`idx_users_code\` (\`verification_code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. TABLAS DE ROLES Y PERMISOS (Spatie Laravel-Permission)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`roles\`;
CREATE TABLE \`roles\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(125) NOT NULL COMMENT 'superadmin | admin | editor | consultor',
  \`guard_name\` VARCHAR(125) NOT NULL DEFAULT 'web',
  \`created_at\` TIMESTAMP NULL,
  \`updated_at\` TIMESTAMP NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`roles_name_guard_unique\` (\`name\`, \`guard_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS \`permissions\`;
CREATE TABLE \`permissions\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(125) NOT NULL COMMENT 'ver-buques | crear-buques | etc.',
  \`guard_name\` VARCHAR(125) NOT NULL DEFAULT 'web',
  \`created_at\` TIMESTAMP NULL,
  \`updated_at\` TIMESTAMP NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`permissions_name_guard_unique\` (\`name\`, \`guard_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS \`model_has_roles\`;
CREATE TABLE \`model_has_roles\` (
  \`role_id\` BIGINT UNSIGNED NOT NULL,
  \`model_type\` VARCHAR(255) NOT NULL,
  \`model_id\` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (\`role_id\`, \`model_id\`, \`model_type\`),
  INDEX \`model_has_roles_model_id_model_type_index\` (\`model_id\`, \`model_type\`),
  CONSTRAINT \`fk_mhr_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS \`model_has_permissions\`;
CREATE TABLE \`model_has_permissions\` (
  \`permission_id\` BIGINT UNSIGNED NOT NULL,
  \`model_type\` VARCHAR(255) NOT NULL,
  \`model_id\` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (\`permission_id\`, \`model_id\`, \`model_type\`),
  INDEX \`model_has_permissions_model_id_model_type_index\` (\`model_id\`, \`model_type\`),
  CONSTRAINT \`fk_mhp_perm\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS \`role_has_permissions\`;
CREATE TABLE \`role_has_permissions\` (
  \`permission_id\` BIGINT UNSIGNED NOT NULL,
  \`role_id\` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (\`permission_id\`, \`role_id\`),
  INDEX \`role_has_permissions_role_id_index\` (\`role_id\`),
  CONSTRAINT \`fk_rhp_perm\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_rhp_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. TABLA: audit_logs (Trazabilidad Forense / Laravel-Auditing)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`audit_logs\`;
CREATE TABLE \`audit_logs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`event\` VARCHAR(50) NOT NULL COMMENT 'created | updated | deleted | login | logout',
  \`auditable_type\` VARCHAR(255) NOT NULL COMMENT 'App\\\\Models\\\\Buque, etc.',
  \`auditable_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`old_values\` JSON NULL DEFAULT NULL COMMENT 'Estado anterior del registro',
  \`new_values\` JSON NULL DEFAULT NULL COMMENT 'Nuevo estado tras mutación',
  \`url\` VARCHAR(1000) NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`user_agent\` VARCHAR(1023) NULL,
  \`tags\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_audit_user\` (\`user_id\`),
  INDEX \`idx_audit_event\` (\`event\`),
  INDEX \`idx_audit_type\` (\`auditable_type\`, \`auditable_id\`),
  CONSTRAINT \`fk_audit_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. BASE DE DATOS NAUFRAGIOS: TABLA buques
-- Entidad central de las embarcaciones históricas
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`buques\`;
CREATE TABLE \`buques\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`nombre_buque\` VARCHAR(200) NOT NULL COMMENT 'Nombre histórico registrado en archivos',
  \`tipo_embarcacion\` VARCHAR(100) NULL COMMENT 'Galeón, Nao, Fragata, Bergantín, Carabela, Pataje...',
  \`nacionalidad\` VARCHAR(100) NULL COMMENT 'Española, Inglesa, Portuguesa, Francesa, Holandesa',
  \`tonelaje\` DECIMAL(10,2) NULL COMMENT 'Toneladas de arqueo de la época',
  \`anno_construccion\` YEAR NULL COMMENT 'Año documentado de botadura',
  \`puerto_origen\` VARCHAR(200) NULL COMMENT 'Sevilla, Cádiz, La Habana, Cartagena de Indias...',
  \`puerto_destino\` VARCHAR(200) NULL COMMENT 'Nombre de Dios, Portobelo, Panamá Viejo...',
  \`propietario\` VARCHAR(200) NULL COMMENT 'Corona de Castilla, Armador particular, Consulado...',
  \`carga_declarada\` TEXT NULL COMMENT 'Plata del Perú, oro, grana cochinilla, azogue, artillería',
  \`numero_tripulantes\` INT NULL,
  \`descripcion\` TEXT NULL,
  \`fuente_informacion\` VARCHAR(500) NULL COMMENT 'Referencia archivística preliminar',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL COMMENT 'SoftDelete',
  \`created_by\` BIGINT UNSIGNED NULL,
  \`updated_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_buque_nombre\` (\`nombre_buque\`),
  INDEX \`idx_buque_tipo\` (\`tipo_embarcacion\`),
  INDEX \`idx_buque_nacionalidad\` (\`nacionalidad\`),
  CONSTRAINT \`fk_buques_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_buques_updated_by\` FOREIGN KEY (\`updated_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. TABLA: hundimientos (Relación 1:N con buques)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`hundimientos\`;
CREATE TABLE \`hundimientos\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`buque_id\` BIGINT UNSIGNED NOT NULL COMMENT 'FK hacia tabla buques',
  \`fecha_hundimiento\` DATE NULL COMMENT 'Fecha exacta según relación histórica',
  \`anno_hundimiento\` SMALLINT NULL COMMENT 'Año si fecha exacta se desconoce',
  \`siglo\` ENUM('XVI','XVII','XVIII','XIX','XX','XXI') NULL,
  \`causa_hundimiento\` VARCHAR(300) NULL COMMENT 'Temporal/Tormenta, Combate naval, Encallamiento en bajo/arrecife, Fuego a bordo',
  \`latitud\` DECIMAL(10,7) NULL COMMENT 'Coordenada decimal WGS84',
  \`longitud\` DECIMAL(10,7) NULL COMMENT 'Coordenada decimal WGS84',
  \`profundidad_metros\` DECIMAL(8,2) NULL COMMENT 'Profundidad batimétrica aproximada',
  \`ubicacion_descripcion\` VARCHAR(500) NULL COMMENT 'Descripción histórica del paraje náutico',
  \`zona_maritima\` VARCHAR(200) NULL COMMENT 'Mar Caribe, Golfo de Panamá, Archipiélago de Las Perlas, Desembocadura Chagres...',
  \`estado_conservacion\` ENUM('excelente','bueno','regular','malo','destruido') NULL,
  \`notas_historicas\` TEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_hund_buque\` (\`buque_id\`),
  INDEX \`idx_hund_fecha\` (\`anno_hundimiento\`),
  INDEX \`idx_hund_siglo\` (\`siglo\`),
  INDEX \`idx_hund_coords\` (\`latitud\`, \`longitud\`),
  CONSTRAINT \`fk_hund_buque\` FOREIGN KEY (\`buque_id\`) REFERENCES \`buques\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_hund_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. TABLA: artefactos (Relación 1:N con buques)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`artefactos\`;
CREATE TABLE \`artefactos\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`buque_id\` BIGINT UNSIGNED NOT NULL,
  \`nombre_artefacto\` VARCHAR(200) NOT NULL COMMENT 'Cañón de bronce, Ancla de almirantazgo, Astrolabio...',
  \`tipo_artefacto\` VARCHAR(150) NULL COMMENT 'Armamento, Navegación, Carga comercial, Enseres de tripulación, Estructura naval',
  \`material\` VARCHAR(150) NULL COMMENT 'Bronce, Hierro fundido, Cerámica vidriada, Plata, Madera',
  \`anno_fabricacion\` SMALLINT NULL,
  \`estado_conservacion\` ENUM('excelente','bueno','regular','malo','fragmentado') NULL,
  \`ubicacion_actual\` VARCHAR(300) NULL COMMENT 'Museo del Canal, Patronato Panamá Viejo, In situ protegido',
  \`descripcion\` TEXT NULL,
  \`referencia_catalogo\` VARCHAR(150) NULL,
  \`foto_referencia\` VARCHAR(500) NULL COMMENT 'Ruta de almacenamiento local (storage/artefactos/...)',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_arte_buque\` (\`buque_id\`),
  INDEX \`idx_arte_tipo\` (\`tipo_artefacto\`),
  CONSTRAINT \`fk_arte_buque\` FOREIGN KEY (\`buque_id\`) REFERENCES \`buques\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_arte_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. TABLA: capitanes (Relación 1:N con buques)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`capitanes\`;
CREATE TABLE \`capitanes\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`buque_id\` BIGINT UNSIGNED NOT NULL,
  \`nombre_capitan\` VARCHAR(250) NOT NULL,
  \`rango\` VARCHAR(100) NULL COMMENT 'Capitán General, Almirante, Capitán de Mar y Guerra, Piloto Mayor, Maestre',
  \`nacionalidad\` VARCHAR(100) NULL,
  \`anno_nacimiento\` SMALLINT NULL,
  \`anno_fallecimiento\` SMALLINT NULL,
  \`notas_biograficas\` TEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_cap_buque\` (\`buque_id\`),
  INDEX \`idx_cap_nombre\` (\`nombre_capitan\`),
  CONSTRAINT \`fk_cap_buque\` FOREIGN KEY (\`buque_id\`) REFERENCES \`buques\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_cap_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. TABLA: intervenciones (Prospecciones y Arqueología)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`intervenciones\`;
CREATE TABLE \`intervenciones\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`buque_id\` BIGINT UNSIGNED NOT NULL,
  \`tipo_intervencion\` VARCHAR(150) NULL COMMENT 'Prospección geofísica, Relevamiento fotogramétrico, Excavación controlada',
  \`fecha_inicio\` DATE NULL,
  \`fecha_fin\` DATE NULL,
  \`institucion\` VARCHAR(300) NULL COMMENT 'Universidad de Panamá, MiCultura, INAH, Centro de Investigaciones',
  \`responsable\` VARCHAR(200) NULL COMMENT 'Arqueólogo subacuático principal',
  \`descripcion\` TEXT NULL,
  \`resultados\` TEXT NULL,
  \`informe_referencia\` VARCHAR(500) NULL COMMENT 'Signatura de informe o enlace DOI/PDF',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_interv_buque\` (\`buque_id\`),
  CONSTRAINT \`fk_interv_buque\` FOREIGN KEY (\`buque_id\`) REFERENCES \`buques\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_interv_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. TABLA: condiciones_ambientales (Oceanografía y Tafonomía)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`condiciones_ambientales\`;
CREATE TABLE \`condiciones_ambientales\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`buque_id\` BIGINT UNSIGNED NOT NULL,
  \`tipo_fondo\` VARCHAR(150) NULL COMMENT 'Arenoso bioclástico, Rocoso basáltico, Arrecifal coralino, Sedimento fangoso',
  \`visibilidad_metros\` DECIMAL(6,2) NULL COMMENT 'Visibilidad media en columna de agua',
  \`corrientes\` VARCHAR(200) NULL COMMENT 'Intensidad y dirección de derivas litorales',
  \`temperatura_agua\` DECIMAL(5,2) NULL COMMENT 'Grados Celsius',
  \`salinidad\` DECIMAL(5,2) NULL COMMENT 'Unidades prácticas de salinidad (PSU)',
  \`riesgo_biologico\` VARCHAR(300) NULL COMMENT 'Presencia de teredos navalis, corales de fuego, tiburones',
  \`notas\` TEXT NULL,
  \`fecha_registro\` DATE NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_cond_buque\` (\`buque_id\`),
  CONSTRAINT \`fk_cond_buque\` FOREIGN KEY (\`buque_id\`) REFERENCES \`buques\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_cond_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. TABLA: documentacion_historica (Fuentes Primarias y Cartografía)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`documentacion_historica\`;
CREATE TABLE \`documentacion_historica\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`buque_id\` BIGINT UNSIGNED NOT NULL,
  \`tipo_documento\` VARCHAR(150) NULL COMMENT 'Crónica, Carta náutica, Relación sumaria, Manifiesto, Real Cédula',
  \`titulo\` VARCHAR(400) NOT NULL,
  \`autor\` VARCHAR(250) NULL,
  \`anno_documento\` SMALLINT NULL,
  \`archivo_origen\` VARCHAR(300) NULL COMMENT 'Archivo General de Indias (AGI), Biblioteca Nacional de España (BNE), ANP',
  \`signatura\` VARCHAR(200) NULL COMMENT 'Signatura archivística (Ej. AGI, Panamá, 235, L.2)',
  \`idioma\` VARCHAR(80) NULL DEFAULT 'Español antiguo',
  \`transcripcion\` LONGTEXT NULL COMMENT 'Transcripción paleográfica',
  \`traduccion\` LONGTEXT NULL COMMENT 'Traducción o modernización sintáctica',
  \`url_digital\` VARCHAR(1000) NULL COMMENT 'Enlace al documento digitalizado en PARES o repositorio',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_doc_buque\` (\`buque_id\`),
  FULLTEXT INDEX \`ft_doc_titulo\` (\`titulo\`, \`transcripcion\`),
  CONSTRAINT \`fk_doc_buque\` FOREIGN KEY (\`buque_id\`) REFERENCES \`buques\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_doc_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. BASE DE DATOS TOPONIMIA: TABLA toponimia
-- Entidad central de los accidentes geográficos históricos
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`toponimia\`;
CREATE TABLE \`toponimia\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`nombre_actual\` VARCHAR(300) NOT NULL COMMENT 'Nombre geográfico oficial actual según IGN Tommy Guardia',
  \`nombre_historico\` VARCHAR(300) NULL COMMENT 'Nombre registrado en crónicas y cartas de marear coloniales',
  \`tipo_toponimia\` VARCHAR(150) NULL COMMENT 'Bahía, Cabo, Isla, Punta, Ensenada, Río, Fondeadero, Bajo',
  \`etimologia\` TEXT NULL COMMENT 'Origen semántico y análisis del vocablo',
  \`lengua_origen\` VARCHAR(100) NULL COMMENT 'Español colonial, Cueva, Guna, Ngäbe, Chibcha, Inglés',
  \`siglo_primer_registro\` SMALLINT NULL COMMENT 'Siglo de la primera mención cartográfica conocida',
  \`descripcion_historica\` TEXT NULL,
  \`pais\` VARCHAR(100) NULL DEFAULT 'Panamá',
  \`region\` VARCHAR(200) NULL COMMENT 'Colón, Portobelo, Darién, Golfo de Panamá, Veraguas',
  \`estado_uso\` ENUM('vigente','en_desuso','modificado','desconocido') NULL DEFAULT 'vigente',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_top_nombre\` (\`nombre_actual\`),
  INDEX \`idx_top_historico\` (\`nombre_historico\`),
  INDEX \`idx_top_region\` (\`region\`),
  FULLTEXT INDEX \`ft_top_nombres\` (\`nombre_actual\`, \`nombre_historico\`, \`descripcion_historica\`),
  CONSTRAINT \`fk_top_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. TABLA: ubicacion_geografica (Coordenadas y Cartografía)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`ubicacion_geografica\`;
CREATE TABLE \`ubicacion_geografica\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`toponimia_id\` BIGINT UNSIGNED NOT NULL,
  \`latitud\` DECIMAL(10,7) NULL COMMENT 'Coordenada WGS84',
  \`longitud\` DECIMAL(10,7) NULL COMMENT 'Coordenada WGS84',
  \`precision_coords\` VARCHAR(100) NULL COMMENT 'Exacta, Aproximada, Estimada',
  \`fuente_cartografica\` VARCHAR(300) NULL COMMENT 'Carta náutica o derrotero de referencia',
  \`anno_referencia_mapa\` SMALLINT NULL,
  \`descripcion_geografica\` TEXT NULL,
  \`tipo_costa\` VARCHAR(150) NULL COMMENT 'Mar Caribe, Océano Pacífico, Vertiente Mixta Canal',
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_ubig_top\` (\`toponimia_id\`),
  INDEX \`idx_ubig_coords\` (\`latitud\`, \`longitud\`),
  CONSTRAINT \`fk_ubig_top\` FOREIGN KEY (\`toponimia_id\`) REFERENCES \`toponimia\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_ubig_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. TABLA: evento_nautico (Vínculo Toponimia <-> Naufragios)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`evento_nautico\`;
CREATE TABLE \`evento_nautico\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`ubicacion_geografica_id\` BIGINT UNSIGNED NOT NULL,
  \`buque_id\` BIGINT UNSIGNED NULL COMMENT 'Vínculo opcional directo con buque registrado',
  \`tipo_evento\` VARCHAR(200) NULL COMMENT 'Naufragio, Encallamiento, Asalto pirata, Derrota forzosa',
  \`fecha_evento\` DATE NULL,
  \`anno_evento\` SMALLINT NULL,
  \`descripcion\` TEXT NULL,
  \`fuente_referencia\` VARCHAR(500) NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_evn_ubig\` (\`ubicacion_geografica_id\`),
  INDEX \`idx_evn_buque\` (\`buque_id\`),
  CONSTRAINT \`fk_evn_ubig\` FOREIGN KEY (\`ubicacion_geografica_id\`) REFERENCES \`ubicacion_geografica\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_evn_buque\` FOREIGN KEY (\`buque_id\`) REFERENCES \`buques\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_evn_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. TABLA: referencias_documentales (Fuentes de la Toponimia)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`referencias_documentales\`;
CREATE TABLE \`referencias_documentales\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`toponimia_id\` BIGINT UNSIGNED NOT NULL,
  \`tipo_referencia\` VARCHAR(150) NULL COMMENT 'Carta náutica, Mapa manuscrito, Relación geográfica, Cédula',
  \`titulo\` VARCHAR(400) NOT NULL,
  \`autor\` VARCHAR(250) NULL,
  \`anno\` SMALLINT NULL,
  \`archivo\` VARCHAR(300) NULL COMMENT 'Archivo donde reposa el documento',
  \`signatura\` VARCHAR(200) NULL,
  \`descripcion\` TEXT NULL,
  \`url_digital\` VARCHAR(1000) NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_refdoc_top\` (\`toponimia_id\`),
  CONSTRAINT \`fk_refdoc_top\` FOREIGN KEY (\`toponimia_id\`) REFERENCES \`toponimia\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_refdoc_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. TABLA: aspectos_linguisticos (Análisis Filológico y Fonético)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`aspectos_linguisticos\`;
CREATE TABLE \`aspectos_linguisticos\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`toponimia_id\` BIGINT UNSIGNED NOT NULL,
  \`idioma\` VARCHAR(100) NULL COMMENT 'Español, Náhuatl, Cueva, Guna, Chibcha, etc.',
  \`raiz_lexica\` VARCHAR(200) NULL COMMENT 'Raíz o étimo documentado',
  \`morfologia\` TEXT NULL COMMENT 'Estructura gramatical compositiva',
  \`evolucion_fonetica\` TEXT NULL COMMENT 'Transformación diacrónica del término',
  \`variantes_escritura\` VARCHAR(500) NULL COMMENT 'Grafías alternativas halladas en manuscritos',
  \`notas\` TEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_aspling_top\` (\`toponimia_id\`),
  CONSTRAINT \`fk_aspling_top\` FOREIGN KEY (\`toponimia_id\`) REFERENCES \`toponimia\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_aspling_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 16. TABLA: metadatos_toponimia (Control de Calidad Académica)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS \`metadatos_toponimia\`;
CREATE TABLE \`metadatos_toponimia\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`toponimia_id\` BIGINT UNSIGNED NOT NULL,
  \`responsable_registro\` VARCHAR(250) NULL COMMENT 'Investigador autor de la ficha',
  \`institucion\` VARCHAR(300) NULL COMMENT 'UP, UCV, MiCultura, etc.',
  \`fecha_creacion_registro\` DATE NULL,
  \`ultima_revision\` DATE NULL,
  \`estado_verificacion\` ENUM('pendiente','verificado','en_revision','rechazado') NULL DEFAULT 'pendiente',
  \`notas_administrativas\` TEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_meta_top\` (\`toponimia_id\`),
  CONSTRAINT \`fk_meta_top\` FOREIGN KEY (\`toponimia_id\`) REFERENCES \`toponimia\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_meta_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 17. DATOS SEMILLA: Roles y Permisos Iniciales (Spatie)
-- ------------------------------------------------------------
INSERT INTO \`roles\` (\`id\`, \`name\`, \`guard_name\`, \`created_at\`, \`updated_at\`) VALUES
(1, 'superadmin', 'web', NOW(), NOW()),
(2, 'admin', 'web', NOW(), NOW()),
(3, 'editor', 'web', NOW(), NOW()),
(4, 'consultor', 'web', NOW(), NOW());

INSERT INTO \`permissions\` (\`id\`, \`name\`, \`guard_name\`, \`created_at\`, \`updated_at\`) VALUES
-- Buques
(1, 'ver-buques', 'web', NOW(), NOW()),
(2, 'crear-buques', 'web', NOW(), NOW()),
(3, 'editar-buques', 'web', NOW(), NOW()),
(4, 'eliminar-buques', 'web', NOW(), NOW()),
-- Hundimientos
(5, 'ver-hundimientos', 'web', NOW(), NOW()),
(6, 'crear-hundimientos', 'web', NOW(), NOW()),
(7, 'editar-hundimientos', 'web', NOW(), NOW()),
(8, 'eliminar-hundimientos', 'web', NOW(), NOW()),
-- Artefactos
(9, 'ver-artefactos', 'web', NOW(), NOW()),
(10, 'crear-artefactos', 'web', NOW(), NOW()),
(11, 'editar-artefactos', 'web', NOW(), NOW()),
(12, 'eliminar-artefactos', 'web', NOW(), NOW()),
-- Toponimia
(13, 'ver-toponimia', 'web', NOW(), NOW()),
(14, 'crear-toponimia', 'web', NOW(), NOW()),
(15, 'editar-toponimia', 'web', NOW(), NOW()),
(16, 'eliminar-toponimia', 'web', NOW(), NOW()),
-- Administración y Auditoría
(17, 'gestionar-usuarios', 'web', NOW(), NOW()),
(18, 'ver-auditoria', 'web', NOW(), NOW()),
(19, 'gestionar-roles', 'web', NOW(), NOW()),
(20, 'exportar-datos', 'web', NOW(), NOW());

-- Asignación de Permisos: superadmin (todos los 20 permisos)
INSERT INTO \`role_has_permissions\` (\`permission_id\`, \`role_id\`)
SELECT \`id\`, 1 FROM \`permissions\`;

-- Asignación de Permisos: admin (todos excepto gestionar-roles)
INSERT INTO \`role_has_permissions\` (\`permission_id\`, \`role_id\`)
SELECT \`id\`, 2 FROM \`permissions\` WHERE \`name\` != 'gestionar-roles';

-- Asignación de Permisos: editor (ver, crear, editar en naufragios y toponimia + exportar)
INSERT INTO \`role_has_permissions\` (\`permission_id\`, \`role_id\`)
SELECT \`id\`, 3 FROM \`permissions\`
WHERE \`name\` IN (
  'ver-buques', 'crear-buques', 'editar-buques',
  'ver-hundimientos', 'crear-hundimientos', 'editar-hundimientos',
  'ver-artefactos', 'crear-artefactos', 'editar-artefactos',
  'ver-toponimia', 'crear-toponimia', 'editar-toponimia',
  'exportar-datos'
);

-- Asignación de Permisos: consultor (solo lectura y exportación)
INSERT INTO \`role_has_permissions\` (\`permission_id\`, \`role_id\`)
SELECT \`id\`, 4 FROM \`permissions\`
WHERE \`name\` IN ('ver-buques', 'ver-hundimientos', 'ver-artefactos', 'ver-toponimia', 'exportar-datos');

SET FOREIGN_KEY_CHECKS = 1;
`;

export interface MigrationFile {
  filename: string;
  order: number;
  description: string;
  code: string;
}

export const LARAVEL_MIGRATIONS: MigrationFile[] = [
  {
    filename: '2024_01_01_000000_create_users_table.php',
    order: 1,
    description: 'Tabla principal de usuarios con SoftDeletes, auditoría y campos de seguridad.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150)->comment('Nombre completo del usuario');
            $table->string('email', 200)->unique();
            $table->string('password', 255)->comment('Hash bcrypt con coste >= 12');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('verification_code', 6)->nullable()->comment('Código OTP numérico de 6 dígitos');
            $table->timestamp('code_expires_at')->nullable()->comment('Expiración OTP (15 minutos)');
            $table->boolean('is_active')->default(false)->comment('0=inactivo no verificado, 1=activo');
            $table->string('institution', 250)->nullable();
            $table->text('investigation_purpose')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes()->comment('SoftDelete: no borra físicamente para análisis forense');

            $table->index('email');
            $table->index('verification_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};`
  },
  {
    filename: '2024_01_01_000001_create_permission_tables.php',
    order: 2,
    description: 'Tablas de Spatie Permission (roles, permissions, model_has_roles, role_has_permissions).',
    code: `<?php

use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Database\\Migrations\\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');

        Schema::create($tableNames['permissions'], function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 125);
            $table->string('guard_name', 125)->default('web');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create($tableNames['roles'], function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 125);
            $table->string('guard_name', 125)->default('web');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create($tableNames['model_has_permissions'], function (Blueprint $table) use ($tableNames, $columnNames) {
            $table->unsignedBigInteger('permission_id');
            $table->string('model_type', 255);
            $table->unsignedBigInteger($columnNames['model_morph_key']);
            $table->index([$columnNames['model_morph_key'], 'model_type'], 'model_has_permissions_model_id_model_type_index');

            $table->foreign('permission_id')
                ->references('id')
                ->on($tableNames['permissions'])
                ->onDelete('cascade');

            $table->primary(['permission_id', $columnNames['model_morph_key'], 'model_type'],
                'model_has_permissions_permission_model_type_primary');
        });

        Schema::create($tableNames['model_has_roles'], function (Blueprint $table) use ($tableNames, $columnNames) {
            $table->unsignedBigInteger('role_id');
            $table->string('model_type', 255);
            $table->unsignedBigInteger($columnNames['model_morph_key']);
            $table->index([$columnNames['model_morph_key'], 'model_type'], 'model_has_roles_model_id_model_type_index');

            $table->foreign('role_id')
                ->references('id')
                ->on($tableNames['roles'])
                ->onDelete('cascade');

            $table->primary(['role_id', $columnNames['model_morph_key'], 'model_type'],
                'model_has_roles_role_model_type_primary');
        });

        Schema::create($tableNames['role_has_permissions'], function (Blueprint $table) use ($tableNames) {
            $table->unsignedBigInteger('permission_id');
            $table->unsignedBigInteger('role_id');

            $table->foreign('permission_id')
                ->references('id')
                ->on($tableNames['permissions'])
                ->onDelete('cascade');

            $table->foreign('role_id')
                ->references('id')
                ->on($tableNames['roles'])
                ->onDelete('cascade');

            $table->primary(['permission_id', 'role_id'], 'role_has_permissions_permission_id_role_id_primary');
        });
    }

    public function down(): void
    {
        $tableNames = config('permission.table_names');
        Schema::dropIfExists($tableNames['role_has_permissions']);
        Schema::dropIfExists($tableNames['model_has_roles']);
        Schema::dropIfExists($tableNames['model_has_permissions']);
        Schema::dropIfExists($tableNames['roles']);
        Schema::dropIfExists($tableNames['permissions']);
    }
};`
  },
  {
    filename: '2024_01_01_000002_create_audit_logs_table.php',
    order: 3,
    description: 'Registro forense de auditoría owen-it/laravel-auditing.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event', 50)->comment('created|updated|deleted|login|logout');
            $table->string('auditable_type', 255)->comment('App\\\\Models\\\\Buque, etc.');
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->json('old_values')->nullable()->comment('Valores antes del cambio');
            $table->json('new_values')->nullable()->comment('Valores después del cambio');
            $table->string('url', 1000)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 1023)->nullable();
            $table->string('tags', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id', 'idx_audit_user');
            $table->index('event', 'idx_audit_event');
            $table->index(['auditable_type', 'auditable_id'], 'idx_audit_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};`
  },
  {
    filename: '2024_01_01_000003_create_buques_table.php',
    order: 4,
    description: 'Entidad central del módulo de Naufragios (Siglos XVI y XVII).',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buques', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_buque', 200)->comment('Nombre histórico del buque');
            $table->string('tipo_embarcacion', 100)->nullable()->comment('Galeón, Nao, Fragata, Bergantín, Carabela');
            $table->string('nacionalidad', 100)->nullable()->comment('Española, Portuguesa, Inglesa, etc.');
            $table->decimal('tonelaje', 10, 2)->nullable()->comment('Toneladas de arqueo');
            $table->year('anno_construccion')->nullable();
            $table->string('puerto_origen', 200)->nullable();
            $table->string('puerto_destino', 200)->nullable();
            $table->string('propietario', 200)->nullable()->comment('Corona, armador, comerciante');
            $table->text('carga_declarada')->nullable()->comment('Mercancías documentadas en el buque');
            $table->integer('numero_tripulantes')->nullable();
            $table->text('descripcion')->nullable();
            $table->string('fuente_informacion', 500)->nullable()->comment('Referencia documental de origen');

            // Auditoría de usuarios
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('nombre_buque', 'idx_buque_nombre');
            $table->index('tipo_embarcacion', 'idx_buque_tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buques');
    }
};`
  },
  {
    filename: '2024_01_01_000004_create_hundimientos_table.php',
    order: 5,
    description: 'Eventos de naufragio con coordenadas WGS84, siglo, causa y profundidad.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hundimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buque_id')->constrained('buques')->cascadeOnDelete();
            $table->date('fecha_hundimiento')->nullable()->comment('Fecha exacta o aproximada');
            $table->smallInteger('anno_hundimiento')->nullable()->comment('Año si fecha exacta no disponible');
            $table->enum('siglo', ['XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'])->nullable();
            $table->string('causa_hundimiento', 300)->nullable()->comment('Tormenta, combate naval, encallamiento...');
            $table->decimal('latitud', 10, 7)->nullable()->comment('Coordenada WGS84');
            $table->decimal('longitud', 10, 7)->nullable()->comment('Coordenada WGS84');
            $table->decimal('profundidad_metros', 8, 2)->nullable()->comment('Profundidad del sitio');
            $table->string('ubicacion_descripcion', 500)->nullable()->comment('Descripción histórica de la ubicación');
            $table->string('zona_maritima', 200)->nullable()->comment('Pacífico, Caribe, Río Chagres...');
            $table->enum('estado_conservacion', ['excelente', 'bueno', 'regular', 'malo', 'destruido'])->nullable();
            $table->text('notas_historicas')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('buque_id', 'idx_hund_buque');
            $table->index('anno_hundimiento', 'idx_hund_fecha');
            $table->index(['latitud', 'longitud'], 'idx_hund_coords');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hundimientos');
    }
};`
  },
  {
    filename: '2024_01_01_000005_create_artefactos_table.php',
    order: 6,
    description: 'Objetos recuperados o catalogados (cañones, anclas, cerámica, numismática).',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artefactos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buque_id')->constrained('buques')->cascadeOnDelete();
            $table->string('nombre_artefacto', 200);
            $table->string('tipo_artefacto', 150)->nullable()->comment('Cañón, ancla, cerámica, moneda...');
            $table->string('material', 150)->nullable()->comment('Hierro, bronce, cerámica, madera...');
            $table->smallInteger('anno_fabricacion')->nullable();
            $table->enum('estado_conservacion', ['excelente', 'bueno', 'regular', 'malo', 'fragmentado'])->nullable();
            $table->string('ubicacion_actual', 300)->nullable()->comment('Museo, depósito, in situ');
            $table->text('descripcion')->nullable();
            $table->string('referencia_catalogo', 150)->nullable();
            $table->string('foto_referencia', 500)->nullable()->comment('Ruta relativa en storage');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('buque_id', 'idx_arte_buque');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artefactos');
    }
};`
  },
  {
    filename: '2024_01_01_000006_create_capitanes_table.php',
    order: 7,
    description: 'Capitanes, almirantes y pilotos mayores vinculados al buque.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capitanes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buque_id')->constrained('buques')->cascadeOnDelete();
            $table->string('nombre_capitan', 250);
            $table->string('rango', 100)->nullable()->comment('Capitán, Almirante, Piloto Mayor...');
            $table->string('nacionalidad', 100)->nullable();
            $table->smallInteger('anno_nacimiento')->nullable();
            $table->smallInteger('anno_fallecimiento')->nullable();
            $table->text('notas_biograficas')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capitanes');
    }
};`
  },
  {
    filename: '2024_01_01_000007_create_intervenciones_table.php',
    order: 8,
    description: 'Campañas arqueológicas subacuáticas, prospecciones y relevamientos.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intervenciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buque_id')->constrained('buques')->cascadeOnDelete();
            $table->string('tipo_intervencion', 150)->nullable()->comment('Excavación, prospección, relevamiento...');
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->string('institucion', 300)->nullable()->comment('Universidad, MiCultura, etc.');
            $table->string('responsable', 200)->nullable()->comment('Investigador o director');
            $table->text('descripcion')->nullable();
            $table->text('resultados')->nullable();
            $table->string('informe_referencia', 500)->nullable()->comment('Referencia o enlace al informe final');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intervenciones');
    }
};`
  },
  {
    filename: '2024_01_01_000008_create_condiciones_ambientales_table.php',
    order: 9,
    description: 'Condiciones de conservación del medio marino (tipo fondo, visibilidad, salinidad).',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('condiciones_ambientales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buque_id')->constrained('buques')->cascadeOnDelete();
            $table->string('tipo_fondo', 150)->nullable()->comment('Arenoso, rocoso, coralino, fangoso...');
            $table->decimal('visibilidad_metros', 6, 2)->nullable()->comment('Visibilidad media submarina');
            $table->string('corrientes', 200)->nullable()->comment('Descripción corrientes marinas');
            $table->decimal('temperatura_agua', 5, 2)->nullable()->comment('Temperatura en °C');
            $table->decimal('salinidad', 5, 2)->nullable()->comment('Salinidad en PSU o g/L');
            $table->string('riesgo_biologico', 300)->nullable()->comment('Fauna marina peligrosa u organismos xilófagos');
            $table->text('notas')->nullable();
            $table->date('fecha_registro')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('condiciones_ambientales');
    }
};`
  },
  {
    filename: '2024_01_01_000009_create_documentacion_historica_table.php',
    order: 10,
    description: 'Fuentes primarias y secundarias (AGI, BNE, ANP) con índice FULLTEXT.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Support\\Facades\\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentacion_historica', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buque_id')->constrained('buques')->cascadeOnDelete();
            $table->string('tipo_documento', 150)->nullable()->comment('Crónica, carta náutica, acta, mapa...');
            $table->string('titulo', 400);
            $table->string('autor', 250)->nullable();
            $table->smallInteger('anno_documento')->nullable();
            $table->string('archivo_origen', 300)->nullable()->comment('AGI, BNE, Archivo Nacional de Panamá...');
            $table->string('signatura', 200)->nullable()->comment('Signatura archivística');
            $table->string('idioma', 80)->default('Español antiguo');
            $table->longText('transcripcion')->nullable()->comment('Transcripción paleográfica');
            $table->longText('traduccion')->nullable()->comment('Traducción al español moderno si aplica');
            $table->string('url_digital', 1000)->nullable()->comment('Enlace al documento digitalizado');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // Índice FULLTEXT en MySQL
        DB::statement('ALTER TABLE documentacion_historica ADD FULLTEXT ft_doc_titulo(titulo, transcripcion)');
    }

    public function down(): void
    {
        Schema::dropIfExists('documentacion_historica');
    }
};`
  },
  {
    filename: '2024_01_01_000010_create_toponimia_table.php',
    order: 11,
    description: 'Entidad principal del módulo de Toponimia Histórica de Panamá.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Support\\Facades\\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('toponimia', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_actual', 300)->comment('Nombre geográfico actual');
            $table->string('nombre_historico', 300)->nullable()->comment('Nombre usado en documentos históricos');
            $table->string('tipo_toponimia', 150)->nullable()->comment('Bahía, cabo, isla, punta, ensenada...');
            $table->text('etimologia')->nullable()->comment('Origen y significado del nombre');
            $table->string('lengua_origen', 100)->nullable()->comment('Español, Indígena, Inglés...');
            $table->smallInteger('siglo_primer_registro')->nullable()->comment('Siglo de la primera mención documentada');
            $table->text('descripcion_historica')->nullable();
            $table->string('pais', 100)->default('Panamá');
            $table->string('region', 200)->nullable();
            $table->enum('estado_uso', ['vigente', 'en_desuso', 'modificado', 'desconocido'])->default('vigente');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('nombre_actual', 'idx_top_nombre');
        });

        DB::statement('ALTER TABLE toponimia ADD FULLTEXT ft_top_nombres(nombre_actual, nombre_historico, descripcion_historica)');
    }

    public function down(): void
    {
        Schema::dropIfExists('toponimia');
    }
};`
  },
  {
    filename: '2024_01_01_000011_create_ubicacion_geografica_table.php',
    order: 12,
    description: 'Datos cartográficos y coordenadas geográficas WGS84 para Leaflet.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ubicacion_geografica', function (Blueprint $table) {
            $table->id();
            $table->foreignId('toponimia_id')->constrained('toponimia')->cascadeOnDelete();
            $table->decimal('latitud', 10, 7)->nullable()->comment('Coordenada WGS84');
            $table->decimal('longitud', 10, 7)->nullable()->comment('Coordenada WGS84');
            $table->string('precision_coords', 100)->nullable()->comment('Exacta, aproximada, estimada');
            $table->string('fuente_cartografica', 300)->nullable()->comment('Carta náutica, mapa histórico');
            $table->smallInteger('anno_referencia_mapa')->nullable();
            $table->text('descripcion_geografica')->nullable();
            $table->string('tipo_costa', 150)->nullable()->comment('Pacífico, Caribe, Canal...');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('toponimia_id', 'idx_ubig_top');
            $table->index(['latitud', 'longitud'], 'idx_ubig_coords');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ubicacion_geografica');
    }
};`
  },
  {
    filename: '2024_01_01_000012_create_evento_nautico_table.php',
    order: 13,
    description: 'Eventos de naufragio o náuticos vinculados a ubicaciones geográficas y buques.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evento_nautico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ubicacion_geografica_id')->constrained('ubicacion_geografica')->cascadeOnDelete();
            $table->foreignId('buque_id')->nullable()->constrained('buques')->nullOnDelete()->comment('Vínculo opcional con BD Naufragios');
            $table->string('tipo_evento', 200)->nullable()->comment('Naufragio, encallamiento, abordaje...');
            $table->date('fecha_evento')->nullable();
            $table->smallInteger('anno_evento')->nullable();
            $table->text('descripcion')->nullable();
            $table->string('fuente_referencia', 500)->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evento_nautico');
    }
};`
  },
  {
    filename: '2024_01_01_000013_create_referencias_documentales_table.php',
    order: 14,
    description: 'Fuentes documentales primarias que dan fe de la toponimia.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referencias_documentales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('toponimia_id')->constrained('toponimia')->cascadeOnDelete();
            $table->string('tipo_referencia', 150)->nullable()->comment('Mapa, crónica, relación, acta...');
            $table->string('titulo', 400);
            $table->string('autor', 250)->nullable();
            $table->smallInteger('anno')->nullable();
            $table->string('archivo', 300)->nullable();
            $table->string('signatura', 200)->nullable();
            $table->text('descripcion')->nullable();
            $table->string('url_digital', 1000)->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referencias_documentales');
    }
};`
  },
  {
    filename: '2024_01_01_000014_create_aspectos_linguisticos_table.php',
    order: 15,
    description: 'Análisis lingüístico de los topónimos (raíz léxica, morfología, variantes).',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aspectos_linguisticos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('toponimia_id')->constrained('toponimia')->cascadeOnDelete();
            $table->string('idioma', 100)->nullable()->comment('Español, Náhuatl, Kuna, Chibcha...');
            $table->string('raiz_lexica', 200)->nullable()->comment('Raíz o vocablo de origen');
            $table->text('morfologia')->nullable()->comment('Análisis morfológico del nombre');
            $table->text('evolucion_fonetica')->nullable()->comment('Cambios fonéticos documentados');
            $table->string('variantes_escritura', 500)->nullable()->comment('Otras grafías históricas registradas');
            $table->text('notas')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aspectos_linguisticos');
    }
};`
  },
  {
    filename: '2024_01_01_000015_create_metadatos_toponimia_table.php',
    order: 16,
    description: 'Metadatos administrativos, verificación y estado de revisión científica.',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metadatos_toponimia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('toponimia_id')->constrained('toponimia')->cascadeOnDelete();
            $table->string('responsable_registro', 250)->nullable()->comment('Investigador que creó el registro');
            $table->string('institucion', 300)->nullable();
            $table->date('fecha_creacion_registro')->nullable();
            $table->date('ultima_revision')->nullable();
            $table->enum('estado_verificacion', ['pendiente', 'verificado', 'en_revision', 'rechazado'])->default('pendiente');
            $table->text('notas_administrativas')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metadatos_toponimia');
    }
};`
  }
];

export const SEEDER_ROLES_PERMISSIONS = `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Spatie\\Permission\\Models\\Role;
use Spatie\\Permission\\Models\\Permission;
use Spatie\\Permission\\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar caché de permisos
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Entidades principales del sistema según UP/UCV
        $entidades = [
            'buques',
            'hundimientos',
            'artefactos',
            'capitanes',
            'intervenciones',
            'condiciones',
            'documentacion',
            'toponimia',
            'ubicacion',
            'eventos',
            'referencias',
            'aspectos',
            'metadatos'
        ];

        $acciones = ['ver', 'crear', 'editar', 'eliminar'];

        // Crear permisos granulares por entidad
        foreach ($entidades as $entidad) {
            foreach ($acciones as $accion) {
                Permission::firstOrCreate([
                    'name' => "{$accion}-{$entidad}",
                    'guard_name' => 'web'
                ]);
            }
        }

        // Permisos de sistema y administración
        Permission::firstOrCreate(['name' => 'gestionar-usuarios', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'ver-auditoria', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'gestionar-roles', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'exportar-datos', 'guard_name' => 'web']);

        // Crear roles
        $superadmin = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $admin      = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $editor     = Role::firstOrCreate(['name' => 'editor', 'guard_name' => 'web']);
        $consultor  = Role::firstOrCreate(['name' => 'consultor', 'guard_name' => 'web']);

        // 1. SUPERADMIN: Todos los permisos sin excepción
        $superadmin->givePermissionTo(Permission::all());

        // 2. ADMIN: Todo excepto gestionar-roles
        $admin->givePermissionTo(Permission::whereNotIn('name', ['gestionar-roles'])->get());

        // 3. EDITOR (Investigador): Ver, Crear, Editar en naufragios y toponimia + Exportar
        $editor->givePermissionTo(
            Permission::where(function ($q) {
                $q->where('name', 'like', 'ver-%')
                  ->orWhere('name', 'like', 'crear-%')
                  ->orWhere('name', 'like', 'editar-%')
                  ->orWhere('name', 'exportar-datos');
            })->whereNotIn('name', ['gestionar-usuarios', 'ver-auditoria', 'gestionar-roles'])->get()
        );

        // 4. CONSULTOR (Público): Solo lectura y exportar reportes
        $consultor->givePermissionTo(
            Permission::where(function ($q) {
                $q->where('name', 'like', 'ver-%')
                  ->orWhere('name', 'exportar-datos');
            })->whereNotIn('name', ['ver-auditoria', 'gestionar-usuarios', 'gestionar-roles'])->get()
        );
    }
}
`;

export const SEEDER_SUPER_ADMIN = `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use App\\Models\\User;
use Illuminate\\Support\\Facades\\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * ÚNICO usuario inicial del sistema: Propietario y Superadministrador.
     */
    public function run(): void
    {
        $superAdmin = User::firstOrCreate(
            ['email' => 'arauquin09@gmail.com'],
            [
                'name' => 'Francisco Fernández',
                'password' => Hash::make(env('SUPERADMIN_DEFAULT_PASSWORD', 'Panama#Maritimo2026!')),
                'email_verified_at' => now(),
                'is_active' => true,
                'institution' => 'Administración General del Sistema',
                'investigation_purpose' => 'Propietario y Superadministrador del Sistema Histórico de Naufragios y Toponimia.',
            ]
        );

        $superAdmin->assignRole('superadmin');
    }
}
`;
