// Database interfaces corresponding to MySQL 8.x schema in technical proposal

export type UserRole = 'superadmin' | 'admin' | 'editor' | 'consultor';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  institution?: string;
  investigation_purpose?: string;
  status?: 'pending' | 'approved' | 'rejected';
  last_login_at?: string;
  last_login_ip?: string;
  created_at?: string;
}

export interface Buque {
  id: number;
  nombre_buque: string;
  tipo_embarcacion: string; // Galeón, Nao, Fragata, Bergantín, Carabela...
  nacionalidad: string; // Española, Inglesa, Francesa, Holandesa
  tonelaje?: number;
  anno_construccion?: number;
  puerto_origen?: string;
  puerto_destino?: string;
  propietario?: string;
  carga_declarada?: string;
  numero_tripulantes?: number;
  descripcion?: string;
  fuente_informacion?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: number;
  updated_by?: number;
}

export interface Hundimiento {
  id: number;
  buque_id: number;
  fecha_hundimiento?: string;
  anno_hundimiento: number;
  siglo: 'XVI' | 'XVII' | 'XVIII' | 'XIX' | 'XX' | 'XXI';
  causa_hundimiento: string;
  latitud: number;
  longitud: number;
  profundidad_metros?: number;
  ubicacion_descripcion: string;
  zona_maritima: string; // Caribe, Pacífico, Río Chagres, Golfo de San Miguel
  estado_conservacion: 'excelente' | 'bueno' | 'regular' | 'malo' | 'destruido';
  notas_historicas?: string;
  created_at: string;
}

export interface Artefacto {
  id: number;
  buque_id: number;
  nombre_artefacto: string;
  tipo_artefacto: string; // Cañón de bronce, Ancla, Astrolabio, Moneda macuquina, Vajilla
  material: string; // Bronce, Hierro, Plata, Cerámica vidriada, Madera
  anno_fabricacion?: number;
  estado_conservacion: 'excelente' | 'bueno' | 'regular' | 'malo' | 'fragmentado';
  ubicacion_actual: string; // Museo del Canal Interoceánico, Patronato Panamá Viejo
  descripcion: string;
  referencia_catalogo: string;
  foto_referencia?: string;
}

export interface Capitan {
  id: number;
  buque_id: number;
  nombre_capitan: string;
  rango: string; // Capitán General, Almirante, Maestre, Piloto Mayor
  nacionalidad: string;
  anno_nacimiento?: number;
  anno_fallecimiento?: number;
  notas_biograficas?: string;
}

export interface Intervencion {
  id: number;
  buque_id: number;
  tipo_intervencion: string; // Prospección geofísica, Sonar de barrido lateral, Excavación subacuática
  fecha_inicio: string;
  fecha_fin?: string;
  institucion: string; // Universidad de Panamá, INAC/MiCultura, INAH
  responsable: string;
  descripcion: string;
  resultados: string;
  informe_referencia: string;
}

export interface CondicionAmbiental {
  id: number;
  buque_id: number;
  tipo_fondo: string; // Coralino, Arenoso, Fangoso, Rocoso
  visibilidad_metros: number;
  corrientes: string;
  temperatura_agua: number; // Celsius
  salinidad: number; // PSU o g/L
  riesgo_biologico: string;
  notas?: string;
  fecha_registro: string;
}

export interface DocumentacionHistorica {
  id: number;
  buque_id: number;
  tipo_documento: string; // Carta náutica, Relación jurada, Manifiesto de carga, Real Cédula
  titulo: string;
  autor?: string;
  anno_documento: number;
  archivo_origen: string; // Archivo General de Indias (AGI), Biblioteca Nacional de España (BNE)
  signatura: string; // Ej: AGI, Panamá, Legajo 234
  idioma: string;
  transcripcion?: string;
  traduccion?: string;
  url_digital?: string;
}

export interface Toponimia {
  id: number;
  nombre_actual: string;
  nombre_historico: string;
  tipo_toponimia: string; // Bahía, Cabo, Isla, Punta, Puerto, Río, Fondeadero
  etimologia?: string;
  lengua_origen?: string; // Español, Cueva, Guna, Ngäbe, Chibcha
  siglo_primer_registro?: number; // 16, 17...
  descripcion_historica: string;
  pais: string;
  region: string; // Colón, Portobelo, Darién, Las Perlas, Veraguas
  estado_uso: 'vigente' | 'en_desuso' | 'modificado' | 'desconocido';
  created_at: string;
  created_by?: number;
}

export interface UbicacionGeografica {
  id: number;
  toponimia_id: number;
  latitud: number;
  longitud: number;
  precision_coords: string; // Exacta, Aproximada, Estimada
  fuente_cartografica: string;
  anno_referencia_mapa?: number;
  descripcion_geografica: string;
  tipo_costa: string; // Mar Caribe, Océano Pacífico, Canal de Panamá
}

export interface EventoNautico {
  id: number;
  ubicacion_geografica_id: number;
  buque_id?: number;
  tipo_evento: string; // Naufragio, Encallamiento, Asalto pirata, Fondeo de armada
  fecha_evento?: string;
  anno_evento?: number;
  descripcion: string;
  fuente_referencia: string;
}

export interface ReferenciaDocumental {
  id: number;
  toponimia_id: number;
  tipo_referencia: string;
  titulo: string;
  autor?: string;
  anno?: number;
  archivo?: string;
  signatura?: string;
  descripcion?: string;
  url_digital?: string;
}

export interface AspectoLinguistico {
  id: number;
  toponimia_id: number;
  idioma: string;
  raiz_lexica?: string;
  morfologia?: string;
  evolucion_fonetica?: string;
  variantes_escritura?: string;
  notas?: string;
}

export interface MetadatoToponimia {
  id: number;
  toponimia_id: number;
  responsable_registro: string;
  institucion: string;
  fecha_creacion_registro: string;
  ultima_revision: string;
  estado_verificacion: 'pendiente' | 'verificado' | 'en_revision' | 'rechazado';
  notas_administrativas?: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string;
  event: 'created' | 'updated' | 'deleted' | 'login' | 'logout';
  auditable_type: string;
  auditable_id: number;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  url: string;
  ip_address: string;
  user_agent: string;
  tags?: string;
  created_at: string;
}
