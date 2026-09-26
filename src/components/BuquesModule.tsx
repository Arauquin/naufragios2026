import React, { useState } from 'react';
import { 
  Buque, 
  Hundimiento, 
  Artefacto, 
  Capitan, 
  Intervencion, 
  CondicionAmbiental, 
  DocumentacionHistorica, 
  UserRole 
} from '../types/database';
import { 
  Anchor, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  FileText, 
  ExternalLink, 
  Compass, 
  ShieldAlert, 
  Layers, 
  User as UserIcon, 
  Calendar, 
  CheckCircle2, 
  Download,
  X
} from 'lucide-react';

interface BuquesModuleProps {
  buques: Buque[];
  hundimientos: Hundimiento[];
  artefactos: Artefacto[];
  capitanes: Capitan[];
  intervenciones: Intervencion[];
  condiciones: CondicionAmbiental[];
  documentacion: DocumentacionHistorica[];
  userRole: UserRole;
  selectedBuqueId: number | null;
  onSelectBuque: (id: number | null) => void;
  onSaveBuque: (buqueData: Partial<Buque>) => void;
  onDeleteBuque: (id: number) => void;
  onExportPdf: (buque: Buque) => void;
}

export const BuquesModule: React.FC<BuquesModuleProps> = ({
  buques,
  hundimientos,
  artefactos,
  capitanes,
  intervenciones,
  condiciones,
  documentacion,
  userRole,
  selectedBuqueId,
  onSelectBuque,
  onSaveBuque,
  onDeleteBuque,
  onExportPdf,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSiglo, setFilterSiglo] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'general' | 'hundimiento' | 'artefactos' | 'capitanes' | 'intervenciones' | 'condiciones' | 'documentos'>('general');
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingBuque, setEditingBuque] = useState<Partial<Buque> | null>(null);

  // RBAC Permission checks (mimicking Spatie Laravel Permission)
  const canCreate = ['superadmin', 'admin', 'editor'].includes(userRole);
  const canEdit = ['superadmin', 'admin', 'editor'].includes(userRole);
  const canDelete = ['superadmin', 'admin'].includes(userRole);

  const selectedBuque = buques.find((b) => b.id === selectedBuqueId);
  const currentHundimiento = hundimientos.find((h) => h.buque_id === selectedBuqueId);
  const currentArtefactos = artefactos.filter((a) => a.buque_id === selectedBuqueId);
  const currentCapitanes = capitanes.filter((c) => c.buque_id === selectedBuqueId);
  const currentIntervenciones = intervenciones.filter((i) => i.buque_id === selectedBuqueId);
  const currentCondiciones = condiciones.filter((c) => c.buque_id === selectedBuqueId);
  const currentDocumentos = documentacion.filter((d) => d.buque_id === selectedBuqueId);

  // Filter list
  const filteredBuques = buques.filter((b) => {
    const matchesSearch = 
      b.nombre_buque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tipo_embarcacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.puerto_origen && b.puerto_origen.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.puerto_destino && b.puerto_destino.toLowerCase().includes(searchTerm.toLowerCase()));

    const bHundimiento = hundimientos.find((h) => h.buque_id === b.id);
    const matchesSiglo = filterSiglo === 'all' || (bHundimiento && bHundimiento.siglo === filterSiglo);
    const matchesTipo = filterTipo === 'all' || b.tipo_embarcacion.toLowerCase().includes(filterTipo.toLowerCase());

    return matchesSearch && matchesSiglo && matchesTipo;
  });

  const handleOpenCreate = () => {
    setEditingBuque({
      nombre_buque: '',
      tipo_embarcacion: 'Galeón',
      nacionalidad: 'Española',
      tonelaje: 350,
      anno_construccion: 1620,
      puerto_origen: 'Sevilla',
      puerto_destino: 'Portobelo',
      propietario: 'Corona Española / Carrera de Indias',
      carga_declarada: 'Plata amonedada, lingotes y pertrechos.',
      numero_tripulantes: 80,
      descripcion: 'Registro histórico documentado en archivos coloniales.',
      fuente_informacion: 'Archivo General de Indias (AGI), Panamá',
    });
    setIsEditingModalOpen(true);
  };

  const handleOpenEdit = (buque: Buque) => {
    setEditingBuque(buque);
    setIsEditingModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuque?.nombre_buque) return;
    onSaveBuque(editingBuque);
    setIsEditingModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-cinzel text-amber-300 flex items-center gap-2">
            <Anchor className="w-5 h-5 text-amber-400" /> Registro de Buques y Pecios Históricos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aguas jurisdiccionales de la República de Panamá &middot; Siglos XVI y XVII (UP-UCV)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Registrar Buque
            </button>
          )}

          <div className="text-xs px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Rol actual: <span className="font-semibold text-amber-400 capitalize">{userRole}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, tipo, puerto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={filterSiglo}
          onChange={(e) => setFilterSiglo(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="all">Todos los siglos</option>
          <option value="XVI">Siglo XVI (1501-1600)</option>
          <option value="XVII">Siglo XVII (1601-1700)</option>
        </select>

        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="all">Todas las embarcaciones</option>
          <option value="galeón">Galeones de guerra y armada</option>
          <option value="nao">Naos mercantes</option>
          <option value="carabela">Carabelas (Época colombina)</option>
        </select>
      </div>

      {/* Main Grid: List on Left, Detail Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Buques List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Embarcaciones Catalogadas ({filteredBuques.length})
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredBuques.map((buque) => {
              const h = hundimientos.find((item) => item.buque_id === buque.id);
              const isSelected = buque.id === selectedBuqueId;

              return (
                <div
                  key={buque.id}
                  onClick={() => onSelectBuque(buque.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-cinzel font-bold text-slate-100 text-sm">{buque.nombre_buque}</h3>
                      <div className="text-xs text-amber-400 font-medium mt-0.5">
                        {buque.tipo_embarcacion} &middot; {buque.nacionalidad}
                      </div>
                    </div>
                    {h && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        Siglo {h.siglo} ({h.anno_hundimiento})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {buque.descripcion}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-500">
                    <span>{buque.puerto_origen || 'Origen no reg.'} &rarr; {buque.puerto_destino || 'Panamá'}</span>
                    <span className="font-mono text-slate-400">{buque.tonelaje ? `${buque.tonelaje} t` : ''}</span>
                  </div>
                </div>
              );
            })}

            {filteredBuques.length === 0 && (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No se encontraron buques con los filtros seleccionados.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Archaeological Dossier */}
        <div className="lg:col-span-7">
          {selectedBuque ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="text-[11px] text-amber-500 uppercase tracking-widest font-semibold">
                    Expediente Histórico &middot; ID #{selectedBuque.id}
                  </div>
                  <h1 className="text-xl font-bold font-cinzel text-white mt-0.5">
                    {selectedBuque.nombre_buque}
                  </h1>
                  <div className="text-xs text-slate-400 mt-1">
                    {selectedBuque.tipo_embarcacion} &middot; Bandera {selectedBuque.nacionalidad} &middot; Botadura {selectedBuque.anno_construccion || 'Desconocida'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => onExportPdf(selectedBuque)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                    title="Exportar Ficha Técnica a PDF (Consultores y Editores)"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" /> Exportar PDF
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(selectedBuque)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                      title="Editar Buque (@can('editar-buques'))"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Confirmar SoftDelete del buque "${selectedBuque.nombre_buque}"?`)) {
                          onDeleteBuque(selectedBuque.id);
                        }
                      }}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg border border-red-800/50 transition-colors"
                      title="Eliminación Lógica SoftDelete (@can('eliminar-buques'))"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Submodule Tabs */}
              <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'general', label: 'Buque', count: null },
                  { id: 'hundimiento', label: 'Hundimiento', count: currentHundimiento ? 1 : 0 },
                  { id: 'artefactos', label: 'Artefactos', count: currentArtefactos.length },
                  { id: 'capitanes', label: 'Capitanes', count: currentCapitanes.length },
                  { id: 'intervenciones', label: 'Intervenciones', count: currentIntervenciones.length },
                  { id: 'condiciones', label: 'Ambiente', count: currentCondiciones.length },
                  { id: 'documentos', label: 'Doc. Histórica (AGI)', count: currentDocumentos.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content Display */}
              <div className="min-h-[300px]">
                {/* 1. General Info */}
                {activeTab === 'general' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block">Arqueo (Tonelaje):</span>
                        <span className="font-semibold text-slate-200">{selectedBuque.tonelaje || '-'} toneladas</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Año Construcción:</span>
                        <span className="font-semibold text-slate-200">{selectedBuque.anno_construccion || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tripulantes:</span>
                        <span className="font-semibold text-slate-200">{selectedBuque.numero_tripulantes || '-'} marineros</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Puerto Origen:</span>
                        <span className="font-semibold text-slate-200">{selectedBuque.puerto_origen || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Puerto Destino:</span>
                        <span className="font-semibold text-slate-200">{selectedBuque.puerto_destino || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Armador / Propietario:</span>
                        <span className="font-semibold text-slate-200">{selectedBuque.propietario || '-'}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-300 mb-1">Descripción General e Historial Náutico:</h4>
                      <p className="text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded border border-slate-800/60">
                        {selectedBuque.descripcion}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-300 mb-1">Manifiesto de Carga Declarada:</h4>
                      <p className="text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded border border-slate-800/60">
                        {selectedBuque.carga_declarada || 'Sin desglose detallado en los registros conservados.'}
                      </p>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800">
                      <strong>Fuente de origen:</strong> {selectedBuque.fuente_informacion}
                    </div>
                  </div>
                )}

                {/* 2. Hundimiento */}
                {activeTab === 'hundimiento' && (
                  <div className="space-y-4 text-xs">
                    {currentHundimiento ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                          <div>
                            <span className="text-slate-500 block">Fecha Naufragio:</span>
                            <span className="font-semibold text-amber-300 font-mono">
                              {currentHundimiento.fecha_hundimiento || currentHundimiento.anno_hundimiento}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Siglo Histórico:</span>
                            <span className="font-semibold text-slate-200">Siglo {currentHundimiento.siglo}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Profundidad Batimétrica:</span>
                            <span className="font-semibold text-slate-200">{currentHundimiento.profundidad_metros ? `${currentHundimiento.profundidad_metros} m` : 'No batimétrica'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Conservación:</span>
                            <span className="font-semibold text-emerald-400 capitalize">{currentHundimiento.estado_conservacion}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80 space-y-2">
                          <div>
                            <span className="text-slate-400 font-semibold block">Causa del Siniestro:</span>
                            <p className="text-slate-200 mt-0.5">{currentHundimiento.causa_hundimiento}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block">Ubicación y Paraje Marítimo:</span>
                            <p className="text-slate-200 mt-0.5">{currentHundimiento.ubicacion_descripcion} &middot; ({currentHundimiento.zona_maritima})</p>
                          </div>
                          <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] pt-1">
                            <Compass className="w-3.5 h-3.5" />
                            <span>Coordenadas WGS84: {currentHundimiento.latitud}° N, {currentHundimiento.longitud}° W</span>
                          </div>
                        </div>

                        {currentHundimiento.notas_historicas && (
                          <div>
                            <span className="text-slate-400 font-semibold block mb-1">Notas Arqueológicas e Históricas:</span>
                            <p className="text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded border border-slate-800">
                              {currentHundimiento.notas_historicas}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No hay registro de hundimiento asociado a este buque.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Artefactos */}
                {activeTab === 'artefactos' && (
                  <div className="space-y-3">
                    {currentArtefactos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentArtefactos.map((art) => (
                          <div key={art.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-amber-300">{art.nombre_artefacto}</h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {art.referencia_catalogo}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              {art.tipo_artefacto} &middot; <span className="text-slate-300">{art.material}</span>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              {art.descripcion}
                            </p>
                            <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-800/80">
                              Ubicación: <span className="text-slate-300">{art.ubicacion_actual}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 text-xs">
                        No se han catalogado artefactos para este buque.
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Capitanes */}
                {activeTab === 'capitanes' && (
                  <div className="space-y-3 text-xs">
                    {currentCapitanes.length > 0 ? (
                      currentCapitanes.map((cap) => (
                        <div key={cap.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-slate-100 text-sm">{cap.nombre_capitan}</h4>
                              <div className="text-amber-400 font-medium text-[11px]">
                                {cap.rango} &middot; {cap.nacionalidad}
                              </div>
                            </div>
                            {(cap.anno_nacimiento || cap.anno_fallecimiento) && (
                              <span className="text-[11px] font-mono text-slate-400">
                                ({cap.anno_nacimiento || '?'} - {cap.anno_fallecimiento || '?'})
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 leading-relaxed text-[11px]">
                            {cap.notas_biograficas}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No hay capitanes registrados para esta nave.
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Intervenciones Arqueológicas */}
                {activeTab === 'intervenciones' && (
                  <div className="space-y-3 text-xs">
                    {currentIntervenciones.length > 0 ? (
                      currentIntervenciones.map((inv) => (
                        <div key={inv.id} className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-amber-300">{inv.tipo_intervencion}</h4>
                              <div className="text-slate-400 text-[11px] mt-0.5">
                                {inv.institucion} &middot; Dir: <span className="text-slate-200">{inv.responsable}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {inv.fecha_inicio} {inv.fecha_fin ? `al ${inv.fecha_fin}` : ''}
                            </span>
                          </div>
                          <div className="text-slate-300 text-[11px] leading-relaxed">
                            <strong>Metodología:</strong> {inv.descripcion}
                          </div>
                          <div className="text-slate-300 text-[11px] leading-relaxed">
                            <strong>Resultados científicos:</strong> {inv.resultados}
                          </div>
                          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                            Ref: {inv.informe_referencia}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No hay campañas o intervenciones arqueológicas registradas aún.
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Condiciones Ambientales */}
                {activeTab === 'condiciones' && (
                  <div className="space-y-3 text-xs">
                    {currentCondiciones.length > 0 ? (
                      currentCondiciones.map((cond) => (
                        <div key={cond.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="p-2 bg-slate-900 rounded">
                              <span className="text-slate-500 block text-[10px]">Tipo de Fondo:</span>
                              <span className="font-semibold text-slate-200">{cond.tipo_fondo}</span>
                            </div>
                            <div className="p-2 bg-slate-900 rounded">
                              <span className="text-slate-500 block text-[10px]">Visibilidad Submarina:</span>
                              <span className="font-semibold text-slate-200">{cond.visibilidad_metros} m</span>
                            </div>
                            <div className="p-2 bg-slate-900 rounded">
                              <span className="text-slate-500 block text-[10px]">Temperatura Agua:</span>
                              <span className="font-semibold text-slate-200">{cond.temperatura_agua} °C</span>
                            </div>
                            <div className="p-2 bg-slate-900 rounded">
                              <span className="text-slate-500 block text-[10px]">Salinidad:</span>
                              <span className="font-semibold text-slate-200">{cond.salinidad} PSU</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-slate-400"><strong>Corrientes:</strong> {cond.corrientes}</div>
                            <div className="text-slate-400"><strong>Riesgo Biológico / Tafonomía:</strong> {cond.riesgo_biologico}</div>
                            {cond.notas && <div className="text-slate-400"><strong>Observaciones:</strong> {cond.notas}</div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No hay datos oceanográficos registrados para este sitio.
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Documentación Histórica (AGI) */}
                {activeTab === 'documentos' && (
                  <div className="space-y-3 text-xs">
                    {currentDocumentos.length > 0 ? (
                      currentDocumentos.map((doc) => (
                        <div key={doc.id} className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-amber-300 text-sm">{doc.titulo}</h4>
                              <div className="text-slate-400 text-[11px]">
                                {doc.tipo_documento} &middot; Año {doc.anno_documento} &middot; Autor: {doc.autor || 'Desconocido'}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                              {doc.signatura}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400">
                            <strong>Archivo:</strong> {doc.archivo_origen} &middot; <strong>Lengua:</strong> {doc.idioma}
                          </div>

                          {doc.transcripcion && (
                            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                              <span className="text-[10px] uppercase font-bold text-amber-400/80 block mb-1">
                                Transcripción Paleográfica Documental:
                              </span>
                              <p className="font-serif italic text-slate-300 leading-relaxed text-[11px]">
                                "{doc.transcripcion}"
                              </p>
                            </div>
                          )}

                          {doc.traduccion && (
                            <div className="bg-slate-900/50 p-2 rounded border border-slate-800/80 text-slate-300 text-[11px]">
                              <strong>Versión Modernizada:</strong> {doc.traduccion}
                            </div>
                          )}

                          {doc.url_digital && (
                            <a
                              href={doc.url_digital}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 underline"
                            >
                              Consultar documento digitalizado en PARES / Repositorio <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No hay documentos históricos adjuntos en este expediente.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
              <Anchor className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm font-medium">Seleccione una embarcación de la lista</p>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                Visualice el expediente arqueológico completo con coordenadas WGS84, artefactos, capitanes y fuentes del Archivo General de Indias (AGI).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Buque (Mobile-First responsive modal) */}
      {isEditingModalOpen && editingBuque && (
        <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-cinzel font-bold text-lg text-amber-300 flex items-center gap-2">
                <Anchor className="w-5 h-5 text-amber-400" />
                {editingBuque.id ? `Editar Buque: ${editingBuque.nombre_buque}` : 'Registrar Nuevo Buque'}
              </h3>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Nombre Histórico del Buque *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBuque.nombre_buque || ''}
                    onChange={(e) => setEditingBuque({ ...editingBuque, nombre_buque: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="Ej. Galeón San José"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Tipo de Embarcación
                  </label>
                  <input
                    type="text"
                    value={editingBuque.tipo_embarcacion || ''}
                    onChange={(e) => setEditingBuque({ ...editingBuque, tipo_embarcacion: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="Galeón, Nao, Fragata, Bergantín, Carabela..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Nacionalidad / Pabellón
                  </label>
                  <input
                    type="text"
                    value={editingBuque.nacionalidad || ''}
                    onChange={(e) => setEditingBuque({ ...editingBuque, nacionalidad: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="Española, Portuguesa, Inglesa..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Tonelaje (Arqueo)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBuque.tonelaje || ''}
                    onChange={(e) => setEditingBuque({ ...editingBuque, tonelaje: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="Ej. 650.00"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Año de Construcción / Botadura
                  </label>
                  <input
                    type="number"
                    min="1400"
                    max="1900"
                    value={editingBuque.anno_construccion || ''}
                    onChange={(e) => setEditingBuque({ ...editingBuque, anno_construccion: parseInt(e.target.value) || undefined })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="1611"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Número de Tripulantes
                  </label>
                  <input
                    type="number"
                    value={editingBuque.numero_tripulantes || ''}
                    onChange={(e) => setEditingBuque({ ...editingBuque, numero_tripulantes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="220"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Puerto de Origen
                  </label>
                  <input
                    type="text"
                    value={editingBuque.puerto_origen || ''}
                    onChange={(e) => setEditingBuque({ ...editingBuque, puerto_origen: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="El Callao, Sevilla, Cartagena..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    Puerto de Destino
                  </label>
                  <input
                    type="text"
                    value={editingBuque.puerto_destino || ''}
                    onChange={(e) => setEditingBuque({ ...editingBuque, puerto_destino: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="Panamá Viejo, Nombre de Dios, Portobelo..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Descripción Histórica & Resumen del Pecio
                </label>
                <textarea
                  rows={3}
                  value={editingBuque.descripcion || ''}
                  onChange={(e) => setEditingBuque({ ...editingBuque, descripcion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                  placeholder="Detalles sobre el periplo, misión del convoy, siniestro marítimo..."
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Fuente de Información Archivística Primaria
                </label>
                <input
                  type="text"
                  value={editingBuque.fuente_informacion || ''}
                  onChange={(e) => setEditingBuque({ ...editingBuque, fuente_informacion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                  placeholder="Ej. AGI, Patronato Real, Legajo 194"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded shadow transition-colors"
                >
                  Guardar en Base de Datos (MySQL)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
