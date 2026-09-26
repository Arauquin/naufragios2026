// Authentic historical datasets for Panama 16th-17th Century Shipwrecks and Toponymy
import { 
  Buque, 
  Hundimiento, 
  Artefacto, 
  Capitan, 
  Intervencion, 
  CondicionAmbiental, 
  DocumentacionHistorica, 
  Toponimia, 
  UbicacionGeografica, 
  EventoNautico, 
  AuditLog, 
  User 
} from '../types/database';

export const INITIAL_USERS: User[] = [
  { 
    id: 1, 
    name: 'Dr. Carlos Ortega (Superadmin)', 
    email: 'admin@naufragiospanama.gob.pa', 
    role: 'superadmin', 
    is_active: true, 
    institution: 'Universidad Central de Venezuela (UCV) / Proyecto Panamá',
    investigation_purpose: 'Coordinador general del proyecto arqueológico e histórico transístmico.',
    status: 'approved',
    last_login_at: '2026-09-26 10:14:22', 
    last_login_ip: '190.140.22.81',
    created_at: '2024-01-01 08:00:00'
  },
  { 
    id: 2, 
    name: 'Dra. María Leal Cuervo (Editor)', 
    email: 'mleal@up.ac.pa', 
    role: 'editor', 
    is_active: true, 
    institution: 'Universidad de Panamá (UP) - Depto. de Historia y Antropología',
    investigation_purpose: 'Investigadora principal: catalogación de naves de la Flota de Tierra Firme y paleografía.',
    status: 'approved',
    last_login_at: '2026-09-26 09:30:11', 
    last_login_ip: '186.72.105.14',
    created_at: '2024-01-15 11:20:00'
  },
  { 
    id: 3, 
    name: 'Lic. Tomás Fernández (Editor)', 
    email: 'tfernandez@ucv.edu', 
    role: 'editor', 
    is_active: true, 
    institution: 'Universidad Central de Venezuela (UCV) - Escuela de Geografía',
    investigation_purpose: 'Cartografía histórica, georreferenciación WGS84 y toponimia colonial costera.',
    status: 'approved',
    last_login_at: '2026-09-25 16:45:00', 
    last_login_ip: '190.140.22.85',
    created_at: '2024-02-10 14:10:00'
  },
  { 
    id: 4, 
    name: 'Lic. Roberto Varela (Consultor)', 
    email: 'rvarela@micultura.gob.pa', 
    role: 'consultor', 
    is_active: true, 
    institution: 'Ministerio de Cultura de Panamá (MiCultura)',
    investigation_purpose: 'Fiscalización de patrimonio histórico subacuático y consulta de expedientes de pecios.',
    status: 'approved',
    last_login_at: '2026-09-26 11:20:05', 
    last_login_ip: '201.218.45.10',
    created_at: '2024-03-01 09:30:00'
  },
  // Solicitudes pendientes de aprobación por el Administrador:
  {
    id: 5,
    name: 'Dra. Elena Santamaría (Solicitante)',
    email: 'esantamaria@usma.ac.pa',
    role: 'consultor',
    is_active: false,
    institution: 'Universidad Católica Santa María La Antigua (USMA)',
    investigation_purpose: 'Tesis doctoral sobre las rutas de navegación y comercio de plata en Portobelo durante el siglo XVII. Solicito rol de Editor para contrastar fuentes archivísticas del AGI.',
    status: 'pending',
    created_at: '2026-09-26 08:15:00'
  },
  {
    id: 6,
    name: 'Mtro. Jean-Luc Dupont (Solicitante)',
    email: 'jl.dupont@sorbonne-universite.fr',
    role: 'consultor',
    is_active: false,
    institution: 'Sorbonne Université / CNRS Arqueología Marítima',
    investigation_purpose: 'Proyecto internacional de investigación sobre la carabela Vizcaína de Cristóbal Colón y arquitectura naval hispana.',
    status: 'pending',
    created_at: '2026-09-25 19:40:00'
  }
];

export const INITIAL_BUQUES: Buque[] = [
  {
    id: 1,
    nombre_buque: 'Nuestra Señora de la Encarnación',
    tipo_embarcacion: 'Nao mercante armada',
    nacionalidad: 'Española',
    tonelaje: 280.00,
    anno_construccion: 1648,
    puerto_origen: 'Cartagena de Indias',
    puerto_destino: 'Portobelo',
    propietario: 'Flota de Tierra Firme (Corona / Mercaderes de Sevilla)',
    carga_declarada: 'Cien fardos de telas, espadas toledanas, clavazón, pernos de plomo, cerámicas y botijas de vino de Castilla.',
    numero_tripulantes: 45,
    descripcion: 'Nave de la Flota de Tierra Firme capitaneada por el Almirante Antonio de Echeverz. Naufragó en 1681 durante una tormenta cerca de la desembocadura del río Chagres.',
    fuente_informacion: 'AGI, Contratación, 1459; Archivo General de la Marina Álvaro de Bazán; INAC Panamá.',
    created_at: '2024-03-12 14:20:00',
    updated_at: '2026-09-20 18:30:00',
    created_by: 2,
    updated_by: 2
  },
  {
    id: 2,
    nombre_buque: 'San José (Galeón Almiranta)',
    tipo_embarcacion: 'Galeón de guerra',
    nacionalidad: 'Española',
    tonelaje: 650.00,
    anno_construccion: 1611,
    puerto_origen: 'El Callao (Virreinato del Perú)',
    puerto_destino: 'Panamá Viejo',
    propietario: 'Armada del Mar del Sur',
    carga_declarada: 'Plata amonedada y barras de plata de las reales cajas de Potosí, lingotes de oro de Quito, correspondencia del Virrey.',
    numero_tripulantes: 220,
    descripcion: 'Almiranta de la Armada del Mar del Sur. Encalló y se fue a pique en 1631 contra el bajo de San José, próximo a la isla Contadora en el Archipiélago de Las Perlas.',
    fuente_informacion: 'AGI, Patronato Real, Legajo 194; AGI, Escribanía de Cámara, 502-A.',
    created_at: '2024-03-15 11:10:00',
    updated_at: '2026-09-22 09:12:00',
    created_by: 2,
    updated_by: 3
  },
  {
    id: 3,
    nombre_buque: 'La Vizcaína',
    tipo_embarcacion: 'Carabela',
    nacionalidad: 'Española',
    tonelaje: 60.00,
    anno_construccion: 1498,
    puerto_origen: 'Cádiz',
    puerto_destino: 'Costa de Veragua (Tierra Firme)',
    propietario: 'Cristóbal Colón (Cuarto Viaje)',
    carga_declarada: 'Bastimentos, pólvora, cañoncetes falconetes, anclas, pertrechos marineros.',
    numero_tripulantes: 28,
    descripcion: 'Una de las cuatro carabelas del cuarto y último viaje de Cristóbal Colón. Fue abandonada en la bahía de Portobelo en 1503 debido al ataque devastador del teredo navalis (broma de mar).',
    fuente_informacion: 'Relación de Diego Méndez (1536); Crónicas de Hernando Colón; Investigaciones arqueológicas UP-UCV.',
    created_at: '2024-04-01 08:00:00',
    updated_at: '2026-09-24 16:40:00',
    created_by: 3,
    updated_by: 2
  },
  {
    id: 4,
    nombre_buque: 'San Cristóbal (La Capitana de Portobelo)',
    tipo_embarcacion: 'Galeón',
    nacionalidad: 'Española',
    tonelaje: 520.00,
    anno_construccion: 1592,
    puerto_origen: 'San Juan de Ulúa / La Habana',
    puerto_destino: 'Nombre de Dios / Portobelo',
    propietario: 'Flota de Nueva España',
    carga_declarada: 'Artillería de bronce, pertrechos militares, azogue para las minas de plata, cerámicas talaveranas.',
    numero_tripulantes: 180,
    descripcion: 'Hundido en 1605 por fuertes marejadas del norte mientras fondeaba en la entrada este del puerto de Portobelo.',
    fuente_informacion: 'AGI, Santo Domingo, 128; Actas del Cabildo de Portobelo (1605).',
    created_at: '2024-04-10 10:00:00',
    updated_at: '2026-09-21 11:00:00',
    created_by: 2,
    updated_by: 1
  },
  {
    id: 5,
    nombre_buque: 'Santa María de la Consolación (El Barco de la Muerte)',
    tipo_embarcacion: 'Galeón armado',
    nacionalidad: 'Española',
    tonelaje: 440.00,
    anno_construccion: 1668,
    puerto_origen: 'Guayaquil',
    puerto_destino: 'Panamá Viejo',
    propietario: 'Comerciantes del Pacífico / Armada del Mar del Sur',
    carga_declarada: '146.000 pesos ensayados en monedas macuquinas, barras de plata, lingotes de oro, cerámica colonial.',
    numero_tripulantes: 140,
    descripcion: 'Naufragó en 1681 al encallar en arrecifes durante una huida precipitada tras el avistamiento de bucaneros comandados por Bartholomew Sharp.',
    fuente_informacion: 'AGI, Audiencia de Panamá, Legajo 18; Relación del pirata William Dampier.',
    created_at: '2024-05-02 12:15:00',
    updated_at: '2026-09-19 14:00:00',
    created_by: 3,
    updated_by: 2
  }
];

export const INITIAL_HUNDIMIENTOS: Hundimiento[] = [
  {
    id: 1,
    buque_id: 1,
    fecha_hundimiento: '1681-11-29',
    anno_hundimiento: 1681,
    siglo: 'XVII',
    causa_hundimiento: 'Temporal violento con vientos de componente norte y rotura de timón al cruzar la barra.',
    latitud: 9.3245000,
    longitud: -80.0035000,
    profundidad_metros: 13.50,
    ubicacion_descripcion: 'Frente al arrecife de Naranjos y la desembocadura histórica del río Chagres, bajo el Fuerte de San Lorenzo.',
    zona_maritima: 'Mar Caribe (Litoral de Colón / Chagres)',
    estado_conservacion: 'excelente',
    notas_historicas: 'Descubierto con su estructura de casco y carga casi intacta gracias a estar cubierto por gruesas capas de sedimento fangoso que frenaron la corrosión.',
    created_at: '2024-03-12 14:25:00'
  },
  {
    id: 2,
    buque_id: 2,
    fecha_hundimiento: '1631-06-17',
    anno_hundimiento: 1631,
    siglo: 'XVII',
    causa_hundimiento: 'Encallamiento nocturno contra bajos rocosos en marea vaciante y posterior vía de agua en sentina.',
    latitud: 8.6258000,
    longitud: -79.0354000,
    profundidad_metros: 22.00,
    ubicacion_descripcion: 'Bajo rocoso de San José, al sur de la Isla Contadora, Archipiélago de Las Perlas.',
    zona_maritima: 'Golfo de Panamá (Océano Pacífico)',
    estado_conservacion: 'bueno',
    notas_historicas: 'Se realizaron rescates coloniales primitivos con buzos indígenas en 1632, recuperando parte de las cajas de plata de Potosí.',
    created_at: '2024-03-15 11:15:00'
  },
  {
    id: 3,
    buque_id: 3,
    fecha_hundimiento: '1503-04-16',
    anno_hundimiento: 1503,
    siglo: 'XVI',
    causa_hundimiento: 'Inundación irreversible producida por la broma marina (Teredo navalis); barrenada por orden del Almirante Colón.',
    latitud: 9.5532000,
    longitud: -79.6601000,
    profundidad_metros: 11.20,
    ubicacion_descripcion: 'Seno interior de la rada de Puerto Bello (Portobelo), en fondeadero seguro prehispánico.',
    zona_maritima: 'Mar Caribe (Bahía de Portobelo)',
    estado_conservacion: 'regular',
    notas_historicas: 'Considerado uno de los vestigios arqueológicos subacuáticos colombinos más antiguos del hemisferio occidental.',
    created_at: '2024-04-01 08:15:00'
  },
  {
    id: 4,
    buque_id: 4,
    fecha_hundimiento: '1605-09-04',
    anno_hundimiento: 1605,
    siglo: 'XVII',
    causa_hundimiento: 'Garreo de anclas durante marejada ciclónica e impacto contra las rocas del baluarte.',
    latitud: 9.5587000,
    longitud: -79.6552000,
    profundidad_metros: 16.00,
    ubicacion_descripcion: 'Punta Santiago, entrada al puerto de San Felipe de Portobelo.',
    zona_maritima: 'Mar Caribe (Costa Arriba de Colón)',
    estado_conservacion: 'regular',
    notas_historicas: 'Consta en la documentación del Cabildo de Portobelo que se perdieron 12 cañones pesados.',
    created_at: '2024-04-10 10:10:00'
  },
  {
    id: 5,
    buque_id: 5,
    fecha_hundimiento: '1681-05-18',
    anno_hundimiento: 1681,
    siglo: 'XVII',
    causa_hundimiento: 'Colisión forzosa contra arrecifes para evitar que el buque y su tesoro cayeran en manos de los filibusteros ingleses.',
    latitud: 8.2314000,
    longitud: -82.2642000,
    profundidad_metros: 18.50,
    ubicacion_descripcion: 'Arrecife de la Isla de Muertos / Golfo de Chiriquí.',
    zona_maritima: 'Océano Pacífico (Golfo de Chiriquí)',
    estado_conservacion: 'destruido',
    notas_historicas: 'El capitán ordenó encallar y prender fuego a la arboladura para evitar la captura de la plata del Perú por Bartholomew Sharp.',
    created_at: '2024-05-02 12:20:00'
  }
];

export const INITIAL_ARTEFACTOS: Artefacto[] = [
  {
    id: 1,
    buque_id: 1,
    nombre_artefacto: 'Caja de espadas toledanas con guarnición de lazo',
    tipo_artefacto: 'Armamento civil y militar',
    material: 'Hierro acerado y vainas de cuero fosilizado',
    anno_fabricacion: 1675,
    estado_conservacion: 'excelente',
    ubicacion_actual: 'Patronato Panamá Viejo / Museo del Canal',
    descripcion: 'Conjunto de 24 espadas roperas fabricadas en Toledo, selladas con el punzón del armero real. Preservadas íntegras dentro de su embalaje de madera.',
    referencia_catalogo: 'ARQ-ENC-1681-0042',
    foto_referencia: '/storage/artefactos/espadas_toledo_1681.jpg'
  },
  {
    id: 2,
    buque_id: 1,
    nombre_artefacto: 'Botija perulera vidriada para transporte de vino',
    tipo_artefacto: 'Contenedor cerámico de transporte',
    material: 'Cerámica de barro cocido con esmalte plumbífero interior',
    anno_fabricacion: 1678,
    estado_conservacion: 'excelente',
    ubicacion_actual: 'Laboratorio de Conservación Subacuática - UP',
    descripcion: 'Ánfora globular con sello impreso de mercader sevillano. Contiene resina vegetal impermeabilizante original.',
    referencia_catalogo: 'ARQ-ENC-1681-0118',
    foto_referencia: '/storage/artefactos/botija_vino_chagres.jpg'
  },
  {
    id: 3,
    buque_id: 2,
    nombre_artefacto: 'Cañón culebrina de bronce con escudo de Felipe IV',
    tipo_artefacto: 'Artillería naval',
    material: 'Bronce (aleación cobre-estaño)',
    anno_fabricacion: 1622,
    estado_conservacion: 'bueno',
    ubicacion_actual: 'Museo del Canal Interoceánico de Panamá',
    descripcion: 'Culebrina de 18 libras fundida en Lima, con inscripciones del maestro artillero y las armas de la Corona de Castilla.',
    referencia_catalogo: 'ART-SJ-1631-001',
    foto_referencia: '/storage/artefactos/canon_bronce_felipeiv.jpg'
  },
  {
    id: 4,
    buque_id: 2,
    nombre_artefacto: 'Astrolabio náutico graduado de navegación',
    tipo_artefacto: 'Instrumento de navegación astronómica',
    material: 'Bronce fundido',
    anno_fabricacion: 1618,
    estado_conservacion: 'excelente',
    ubicacion_actual: 'Museo del Canal Interoceánico',
    descripcion: 'Astrolabio marino de rueda perforada con alidada móvil, utilizado por el piloto mayor para medir la altura solar al mediodía.',
    referencia_catalogo: 'NAV-SJ-1631-009',
    foto_referencia: '/storage/artefactos/astrolabio_perlas.jpg'
  },
  {
    id: 5,
    buque_id: 3,
    nombre_artefacto: 'Falconete de retrocarga de hierro forjado',
    tipo_artefacto: 'Artillería ligera de borda',
    material: 'Hierro forjado con cámara de recámara móvil',
    anno_fabricacion: 1495,
    estado_conservacion: 'regular',
    ubicacion_actual: 'Fuerte de San Jerónimo / MiCultura Portobelo',
    descripcion: 'Pieza de artillería de retrocarga correspondiente a las naves del periodo del cuarto viaje de Colón.',
    referencia_catalogo: 'COL-VIZ-1503-0003',
    foto_referencia: '/storage/artefactos/falconete_vizcaina.jpg'
  }
];

export const INITIAL_CAPITANES: Capitan[] = [
  {
    id: 1,
    buque_id: 1,
    nombre_capitan: 'Antonio de Echeverz y Zubiza',
    rango: 'Almirante de la Flota de Tierra Firme',
    nacionalidad: 'Española (Navarra)',
    anno_nacimiento: 1638,
    anno_fallecimiento: 1708,
    notas_biograficas: 'Ilustre marino navarro, Caballero de la Orden de Santiago. Comandó convoyes de la Carrera de Indias entre Cádiz, La Habana y el Istmo de Panamá.'
  },
  {
    id: 2,
    buque_id: 2,
    nombre_capitan: 'Don Juan de la Cueva y Mendoza',
    rango: 'Capitán de Mar y Guerra',
    nacionalidad: 'Española (Sevilla)',
    anno_nacimiento: 1588,
    anno_fallecimiento: 1631,
    notas_biograficas: 'Oficial de la Real Armada del Mar del Sur. Pereció durante las maniobras de auxilio cuando el Galeón San José impactó contra el bajío en 1631.'
  },
  {
    id: 3,
    buque_id: 3,
    nombre_capitan: 'Bartolomé Fieschi (Fiesco)',
    rango: 'Capitán de la Carabela Vizcaína',
    nacionalidad: 'Genovesa',
    anno_nacimiento: 1465,
    anno_fallecimiento: 1520,
    notas_biograficas: 'Marino leal al Almirante Cristóbal Colón. Cruzó en canoa indígena desde Jamaica hasta La Española junto a Diego Méndez en busca de socorro.'
  }
];

export const INITIAL_INTERVENCIONES: Intervencion[] = [
  {
    id: 1,
    buque_id: 1,
    tipo_intervencion: 'Prospección geofísica con magnetómetro y fotogrametría 3D',
    fecha_inicio: '2011-06-10',
    fecha_fin: '2011-07-28',
    institucion: 'Universidad de Panamá (UP) en colaboración con Texas State University',
    responsable: 'Dr. Frederick Hanselmann y Arql. panameño invitado',
    descripcion: 'Localización del pecio subacuático con sonar de barrido lateral y magnetómetro de cesio, confirmando la posición sumergida de la Encarnación.',
    resultados: 'Hallazgo de la quilla completa, cuadernas inferiores y más de 100 cajas de carga comercial preservadas bajo 1 metro de lodo.',
    informe_referencia: 'Informe Técnico Subacuático INAC-UP Tomo IV / Registro Nacional de Bienes Patrimoniales.'
  },
  {
    id: 2,
    buque_id: 2,
    tipo_intervencion: 'Relevamiento arqueológico no invasivo y muestreo sedimentario',
    fecha_inicio: '2018-02-15',
    fecha_fin: '2018-03-30',
    institucion: 'Universidad Central de Venezuela (UCV) y Universidad de Panamá',
    responsable: 'Dra. María Leal Cuervo',
    descripcion: 'Cartografía detallada de la dispersión de lastre pétreo y delimitación del polígono de protección arqueológica del bajo de San José.',
    resultados: 'Identificación de 4 cañones de bronce y dispersión de anclas del siglo XVII en un radio de 120 metros.',
    informe_referencia: 'Actas Científicas de Arqueología Histórica del Istmo 2018, pp. 45-89.'
  }
];

export const INITIAL_CONDICIONES: CondicionAmbiental[] = [
  {
    id: 1,
    buque_id: 1,
    tipo_fondo: 'Fangoso con aportes fluviales finos del río Chagres',
    visibilidad_metros: 2.50,
    corrientes: 'Corriente litoral este-oeste moderada de 0.8 a 1.4 nudos',
    temperatura_agua: 28.20,
    salinidad: 32.50,
    riesgo_biologico: 'Presencia ocasional de barramundas y peces león; nula presencia de teredo navalis debido a capa anóxica de lodo.',
    notas: 'El ambiente anóxico subacuático ha preservado maderas de roble español y cabos de cáñamo en estado óptimo.',
    fecha_registro: '2024-02-18'
  },
  {
    id: 2,
    buque_id: 2,
    tipo_fondo: 'Rocoso basáltico con bolsas de arenas bioclásticas',
    visibilidad_metros: 8.00,
    corrientes: 'Fuertes corrientes de marea semidiurna (rango mareal de hasta 5 metros)',
    temperatura_agua: 25.50,
    salinidad: 35.00,
    riesgo_biologico: 'Erizos de espinas largas y colonias de esponjas marinas sobre los cañones.',
    notas: 'Excelente visibilidad en época seca (enero-abril).',
    fecha_registro: '2024-03-05'
  }
];

export const INITIAL_DOCUMENTACION: DocumentacionHistorica[] = [
  {
    id: 1,
    buque_id: 1,
    tipo_documento: 'Relación sumaria y declaración de naufragio ante el Almirantazgo',
    titulo: 'Relación del temporal y pérdida de la Nao La Encarnación a la boca del Río de Chagre',
    autor: 'Escribano de Su Majestad D. Bartolomé Sánchez de Soria',
    anno_documento: 1681,
    archivo_origen: 'Archivo General de Indias (AGI), Sevilla',
    signatura: 'AGI, Audiencia de Panamá, Legajo 238, Folios 12-29v',
    idioma: 'Español antiguo (caligrafía procesal)',
    transcripcion: 'En el puerto y fortaleza de San Lorenço del Chagre, a primero de diziembre del año de mill y seiscientos y ochenta y uno... certifico la pérdida total de la nao nombrada la Encarnación...',
    traduccion: 'En el puerto y fuerte de San Lorenzo del Chagres, al primero de diciembre de 1681... certifico la pérdida total de la nao nombrada la Encarnación tras romper amarras por furioso vendaval.',
    url_digital: 'https://pares.culturaydeporte.gob.es/inicio.html?ref=AGI-PAN-238'
  },
  {
    id: 2,
    buque_id: 2,
    tipo_documento: 'Inventario de rescate de la plata de Su Majestad',
    titulo: 'Cuentas del buceo y alijo de la plata sumergida en el bajo de San Joseph en Las Perlas',
    autor: 'Comisario Real Francisco de la Rocha',
    anno_documento: 1633,
    archivo_origen: 'Archivo General de Indias (AGI), Sevilla',
    signatura: 'AGI, Contaduría del Virreinato, Legajo 514',
    idioma: 'Español antiguo',
    transcripcion: 'Memoria de las barras de plata e reales de a ocho que sacaron los negros buzos de la compañía del maese...',
    traduccion: 'Memoria de las barras de plata y reales de a ocho que recuperaron los buzos en la faena del bajo de San José.',
    url_digital: 'https://pares.culturaydeporte.gob.es/inicio.html?ref=AGI-CONT-514'
  }
];

export const INITIAL_TOPONIMIA: Toponimia[] = [
  {
    id: 1,
    nombre_actual: 'Portobelo',
    nombre_historico: 'San Felipe de Puerto Bello',
    tipo_toponimia: 'Puerto y Bahía fortificada',
    etimologia: 'Designación descriptiva española atribuida al Almirante Cristóbal Colón en 1502: "Porto Bello" por la extraordinaria hermosura y seguridad de la rada natural.',
    lengua_origen: 'Español antiguo e Italiano colonial',
    siglo_primer_registro: 16,
    descripcion_historica: 'Término de la célebre feria de galeones de la Flota de Tierra Firme a partir de 1597 tras el abandono del malsano Nombre de Dios.',
    pais: 'Panamá',
    region: 'Costa Arriba de Colón',
    estado_uso: 'vigente',
    created_at: '2024-01-10 10:00:00',
    created_by: 2
  },
  {
    id: 2,
    nombre_actual: 'San Lorenzo el Real del Chagres',
    nombre_historico: 'Castillo y Boca del Río de Chagre',
    tipo_toponimia: 'Desembocadura fluvial y promontorio fortificado',
    etimologia: 'Topónimo de origen prehispánico ("Chagre" o "Chagres"), posiblemente de procedencia lingüística Cueva o Chibcha, modificado por los colonizadores castellanos.',
    lengua_origen: 'Indígena (Cueva) con adición hagiográfica española',
    siglo_primer_registro: 16,
    descripcion_historica: 'Llave de la navegación transístmica por el río Chagres hacia Venta de Cruces y la Ciudad de Panamá en el Mar del Sur.',
    pais: 'Panamá',
    region: 'Colón / Desembocadura del Chagres',
    estado_uso: 'vigente',
    created_at: '2024-01-11 11:30:00',
    created_by: 2
  },
  {
    id: 3,
    nombre_actual: 'Nombre de Dios',
    nombre_historico: 'Nombre de Dios / Puerto de Bastimentos',
    tipo_toponimia: 'Fondeadero histórico y puerto',
    etimologia: 'Exclamación devocional fundada por Diego de Nicuesa en 1510: "Paremos aquí en el nombre de Dios".',
    lengua_origen: 'Español',
    siglo_primer_registro: 16,
    descripcion_historica: 'Primer gran puerto caribeño de la Carrera de Indias en el Istmo de Panamá, abandonado a fines del siglo XVI por su extrema vulnerabilidad a ataques y enfermedades.',
    pais: 'Panamá',
    region: 'Costa Arriba de Colón',
    estado_uso: 'vigente',
    created_at: '2024-01-15 09:00:00',
    created_by: 3
  },
  {
    id: 4,
    nombre_actual: 'Archipiélago de Las Perlas',
    nombre_historico: 'Islas de Terarequí / Islas del Rey',
    tipo_toponimia: 'Archipiélago e islas marinas',
    etimologia: 'Bautizado por Vasco Núñez de Balboa en 1513 por la abundancia de ostras perlíferas que explotaban los cacicazgos indígenas autóctonos.',
    lengua_origen: 'Español (sustituyó el original indígena Terarequí)',
    siglo_primer_registro: 16,
    descripcion_historica: 'Sede de la pesquería colonial de perlas del Pacífico y fondeadero de las naves procedentes del virreinato peruano antes de arribar a Panamá Viejo.',
    pais: 'Panamá',
    region: 'Golfo de Panamá (Océano Pacífico)',
    estado_uso: 'vigente',
    created_at: '2024-01-20 14:00:00',
    created_by: 2
  },
  {
    id: 5,
    nombre_actual: 'Isla Taboga',
    nombre_historico: 'Isla de San Pedro / Taboga',
    tipo_toponimia: 'Isla costera y fondeadero',
    etimologia: 'Derivado del cacique indígena "Taboga" que señoreaba la isla al arribo de los navegantes españoles en 1515.',
    lengua_origen: 'Indígena (Cueva)',
    siglo_primer_registro: 16,
    descripcion_historica: 'Llamada la Isla de las Flores, punto crucial de aguada y avituallamiento para toda la Armada del Mar del Sur.',
    pais: 'Panamá',
    region: 'Bahía de Panamá',
    estado_uso: 'vigente',
    created_at: '2024-01-22 16:30:00',
    created_by: 3
  },
  {
    id: 6,
    nombre_actual: 'Acla',
    nombre_historico: 'Villa de Acla',
    tipo_toponimia: 'Ensenada histórica y poblado extinguido',
    etimologia: 'Voz de la lengua Cueva que significa "huesos de hombres" o "lugar de mortandad", registrada por los cronistas Fernández de Oviedo y Pedro Mártir.',
    lengua_origen: 'Cueva (Indígena extinta)',
    siglo_primer_registro: 16,
    descripcion_historica: 'Población donde fue sentenciado y decapitado Vasco Núñez de Balboa en 1519 por Pedrarias Dávila. Sitio de botadura de bergantines coloniales.',
    pais: 'Panamá',
    region: 'Comarca Guna Yala / Darién Caribe',
    estado_uso: 'en_desuso',
    created_at: '2024-02-05 10:15:00',
    created_by: 2
  }
];

export const INITIAL_UBICACIONES: UbicacionGeografica[] = [
  {
    id: 1,
    toponimia_id: 1,
    latitud: 9.5539000,
    longitud: -79.6548000,
    precision_coords: 'Exacta',
    fuente_cartografica: 'Plano del Puerto de San Felipe de Puerto Bello por Bautista Antonelli (1597), AGI.',
    anno_referencia_mapa: 1597,
    descripcion_geografica: 'Rada profunda y protegida de vientos dominantes con baluartes de San Jerónimo y San Fernando flanqueando la bocana.',
    tipo_costa: 'Mar Caribe'
  },
  {
    id: 2,
    toponimia_id: 2,
    latitud: 9.3195000,
    longitud: -80.0018000,
    precision_coords: 'Exacta',
    fuente_cartografica: 'Mapa de la Costa de Tierra Firme y Río Chagre (1620), Archivo General de Simancas.',
    anno_referencia_mapa: 1620,
    descripcion_geografica: 'Peñón escarpado sobre la margen derecha de la desembocadura del río Chagres, coronado por el Castillo de San Lorenzo.',
    tipo_costa: 'Mar Caribe'
  },
  {
    id: 3,
    toponimia_id: 3,
    latitud: 9.5794000,
    longitud: -79.4756000,
    precision_coords: 'Aproximada',
    fuente_cartografica: 'Derrotero general del Mar del Norte de Antonio de Herrera (1601).',
    anno_referencia_mapa: 1601,
    descripcion_geografica: 'Bahía abierta y cenagosa con bajos de coral que dificultaban la maniobra de galeones mayores.',
    tipo_costa: 'Mar Caribe'
  },
  {
    id: 4,
    toponimia_id: 4,
    latitud: 8.6312000,
    longitud: -79.0321000,
    precision_coords: 'Exacta',
    fuente_cartografica: 'Carta hidrográfica del Golfo de Panamá levantada por la Real Armada (1790).',
    anno_referencia_mapa: 1790,
    descripcion_geografica: 'Conjunto insular constituido por más de 200 islas e islotes en el centro del Golfo de Panamá.',
    tipo_costa: 'Océano Pacífico'
  },
  {
    id: 5,
    toponimia_id: 5,
    latitud: 8.7915000,
    longitud: -79.5540000,
    precision_coords: 'Exacta',
    fuente_cartografica: 'Plano náutico de la Bahía de Panamá por Antonio de Ulloa (1744).',
    anno_referencia_mapa: 1744,
    descripcion_geografica: 'Isla montañosa con manantiales de agua dulce a 12 millas náuticas al sur de la Ciudad de Panamá.',
    tipo_costa: 'Océano Pacífico'
  }
];

export const INITIAL_EVENTOS_NAUTICOS: EventoNautico[] = [
  {
    id: 1,
    ubicacion_geografica_id: 2,
    buque_id: 1,
    tipo_evento: 'Naufragio por temporal ciclónico',
    fecha_evento: '1681-11-29',
    anno_evento: 1681,
    descripcion: 'Pérdida de la nao Encarnación de la Flota de Antonio de Echeverz contra los bajos de Naranjos en la entrada de Chagres.',
    fuente_referencia: 'AGI, Panamá, Legajo 238; Crónica naval del almirantazgo.'
  },
  {
    id: 2,
    ubicacion_geografica_id: 4,
    buque_id: 2,
    tipo_evento: 'Encallamiento y naufragio de galeón de plata',
    fecha_evento: '1631-06-17',
    anno_evento: 1631,
    descripcion: 'Varada mortal del galeón San José en el arrecife que desde entonces lleva su nombre en Las Perlas.',
    fuente_referencia: 'Relación oficial de la Real Audiencia de Panamá (1631).'
  },
  {
    id: 3,
    ubicacion_geografica_id: 1,
    buque_id: 3,
    tipo_evento: 'Abandono y hundimiento deliberado de nave colombina',
    fecha_evento: '1503-04-16',
    anno_evento: 1503,
    descripcion: 'Barrenamiento de la carabela Vizcaína al no poder mantenerla a flote debido a la carcoma en el casco.',
    fuente_referencia: 'Diario de a bordo y cartas de Cristóbal Colón a los Reyes Católicos.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Dr. Carlos Ortega',
    event: 'created',
    auditable_type: 'App\\Models\\Buque',
    auditable_id: 1,
    old_values: null,
    new_values: { nombre_buque: 'Nuestra Señora de la Encarnación', tipo: 'Nao mercante', nacionalidad: 'Española', anno: 1648 },
    url: 'https://naufragios.panama.gob.pa/buques',
    ip_address: '190.140.22.81',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    created_at: '2026-09-24 10:15:32'
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Dra. María Leal Cuervo',
    event: 'updated',
    auditable_type: 'App\\Models\\Hundimiento',
    auditable_id: 1,
    old_values: { profundidad_metros: 12.00, estado_conservacion: 'bueno' },
    new_values: { profundidad_metros: 13.50, estado_conservacion: 'excelente' },
    url: 'https://naufragios.panama.gob.pa/hundimientos/1',
    ip_address: '186.72.105.14',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    created_at: '2026-09-25 14:22:10'
  },
  {
    id: 3,
    user_id: 3,
    user_name: 'Lic. Tomás Fernández',
    event: 'created',
    auditable_type: 'App\\Models\\Toponimia',
    auditable_id: 2,
    old_values: null,
    new_values: { nombre_actual: 'San Lorenzo el Real del Chagres', lengua_origen: 'Cueva / Español' },
    url: 'https://naufragios.panama.gob.pa/toponimia',
    ip_address: '190.140.22.85',
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/125.0',
    created_at: '2026-09-26 09:44:05'
  }
];
