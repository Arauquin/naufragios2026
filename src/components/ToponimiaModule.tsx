import React, { useState } from 'react';
import { 
  Toponimia, 
  UbicacionGeografica, 
  EventoNautico, 
  ReferenciaDocumental, 
  AspectoLinguistico, 
  MetadatoToponimia,
  UserRole 
} from '../types/database';
import { 
  Compass, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  BookOpen, 
  Languages, 
  ShieldCheck, 
  Download,
  X 
} from 'lucide-react';

interface ToponimiaModuleProps {
  toponimias: Toponimia[];
  ubicaciones: UbicacionGeografica[];
  eventos: EventoNautico[];
  userRole: UserRole;
  selectedToponimiaId: number | null;
  onSelectToponimia: (id: number | null) => void;
  onSaveToponimia: (data: Partial<Toponimia>) => void;
  onDeleteToponimia: (id: number) => void;
}

export const ToponimiaModule: React.FC<ToponimiaModuleProps> = ({
  toponimias,
  ubicaciones,
  eventos,
  userRole,
  selectedToponimiaId,
  onSelectToponimia,
  onSaveToponimia,
  onDeleteToponimia,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterLengua, setFilterLengua] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Toponimia> | null>(null);

  const canCreate = ['superadmin', 'admin', 'editor'].includes(userRole);
  const canEdit = ['superadmin', 'admin', 'editor'].includes(userRole);
  const canDelete = ['superadmin', 'admin'].includes(userRole);

  const selectedToponimia = toponimias.find((t) => t.id === selectedToponimiaId);
  const currentUbicacion = ubicaciones.find((u) => u.toponimia_id === selectedToponimiaId);
  const currentEventos = eventos.filter((e) => {
    return currentUbicacion && e.ubicacion_geografica_id === currentUbicacion.id;
  });

  const filteredToponimias = toponimias.filter((t) => {
    const matchesSearch = 
      t.nombre_actual.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nombre_historico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tipo_toponimia.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = filterRegion === 'all' || t.region.toLowerCase().includes(filterRegion.toLowerCase());
    const matchesLengua = filterLengua === 'all' || (t.lengua_origen && t.lengua_origen.toLowerCase().includes(filterLengua.toLowerCase()));

    return matchesSearch && matchesRegion && matchesLengua;
  });

  const handleOpenCreate = () => {
    setEditingItem({
      nombre_actual: '',
      nombre_historico: '',
      tipo_toponimia: 'Bahía',
      etimologia: '',
      lengua_origen: 'Español colonial',
      siglo_primer_registro: 16,
      descripcion_historica: '',
      pais: 'Panamá',
      region: 'Colón',
      estado_uso: 'vigente',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.nombre_actual) return;
    onSaveToponimia(editingItem);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-cinzel text-sky-400 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" /> Toponimia Histórica & Costera de Panamá
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Base de datos toponímica, evolución etimológica y cartografía colonial de los Siglos XVI y XVII
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Registrar Topónimo
            </button>
          )}

          <div className="text-xs px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Rol: <span className="font-semibold text-sky-400 capitalize">{userRole}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por topónimo actual o histórico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="all">Todas las regiones</option>
          <option value="Colón">Colón / Costa Arriba</option>
          <option value="Panamá">Golfo / Bahía de Panamá</option>
          <option value="Perlas">Archipiélago de Las Perlas</option>
          <option value="Darién">Darién / Guna Yala</option>
        </select>

        <select
          value={filterLengua}
          onChange={(e) => setFilterLengua(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="all">Todas las lenguas de origen</option>
          <option value="Español">Español colonial</option>
          <option value="Cueva">Cueva (Indígena)</option>
          <option value="Guna">Guna / Chibcha</option>
        </select>
      </div>

      {/* Grid List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Toponym List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Topónimos Registrados ({filteredToponimias.length})
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredToponimias.map((top) => {
              const u = ubicaciones.find((item) => item.toponimia_id === top.id);
              const isSelected = top.id === selectedToponimiaId;

              return (
                <div
                  key={top.id}
                  onClick={() => onSelectToponimia(top.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-cinzel font-bold text-slate-100 text-sm">{top.nombre_actual}</h3>
                      <div className="text-xs text-sky-400 font-medium mt-0.5">
                        {top.tipo_toponimia} &middot; <span className="italic">"{top.nombre_historico}"</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                      Siglo {top.siglo_primer_registro || 'XVI'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {top.etimologia || top.descripcion_historica}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-500">
                    <span>{top.region} ({u?.tipo_costa || 'Litoral'})</span>
                    <span className="text-slate-400 font-medium">{top.lengua_origen || 'Origen léxico'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Toponym Dossier */}
        <div className="lg:col-span-7">
          {selectedToponimia ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="text-[11px] text-sky-400 uppercase tracking-widest font-semibold">
                    Ficha Toponímica &middot; Registro #{selectedToponimia.id}
                  </div>
                  <h1 className="text-xl font-bold font-cinzel text-white mt-0.5">
                    {selectedToponimia.nombre_actual}
                  </h1>
                  <div className="text-xs text-slate-400 mt-1">
                    Designación Colonial: <span className="text-sky-300 italic">"{selectedToponimia.nombre_historico}"</span> &middot; {selectedToponimia.tipo_toponimia}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setEditingItem(selectedToponimia);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                      title="Editar Topónimo"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Confirmar SoftDelete del topónimo "${selectedToponimia.nombre_actual}"?`)) {
                          onDeleteToponimia(selectedToponimia.id);
                        }
                      }}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg border border-red-800/50 transition-colors"
                      title="Eliminación lógica"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Data Cards */}
              <div className="space-y-4 text-xs">
                {/* 1. Linguistics & Etymology */}
                <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold">
                    <Languages className="w-4 h-4" /> Análisis Lingüístico y Etimología
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Lengua de Origen:</span>
                      <span className="font-semibold text-white">{selectedToponimia.lengua_origen || 'No determinada'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Siglo Primer Registro:</span>
                      <span className="font-semibold text-white">Siglo {selectedToponimia.siglo_primer_registro || 'XVI'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Estado de Uso:</span>
                      <span className="font-semibold text-emerald-400 capitalize">{selectedToponimia.estado_uso}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Origen Semántico y Evolución:</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800">
                      {selectedToponimia.etimologia || 'Investigación filológica en proceso.'}
                    </p>
                  </div>
                </div>

                {/* 2. Geographic & Cartographic Info */}
                {currentUbicacion && (
                  <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-sky-400 font-semibold">
                      <MapPin className="w-4 h-4" /> Cartografía Histórica y Coordenadas WGS84
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Vertiente / Costa:</span>
                        <span className="font-semibold text-white">{currentUbicacion.tipo_costa}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Precisión de Coordenadas:</span>
                        <span className="font-semibold text-amber-300">{currentUbicacion.precision_coords}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Año del Mapa Referencia:</span>
                        <span className="font-semibold text-white">{currentUbicacion.anno_referencia_mapa || 'Siglo colonial'}</span>
                      </div>
                    </div>
                    <div className="text-sky-300 font-mono text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800">
                      Coordenadas: {currentUbicacion.latitud}° N, {Math.abs(currentUbicacion.longitud)}° W
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Fuente Cartográfica Colonial:</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {currentUbicacion.fuente_cartografica}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Linked Naval Events */}
                <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Compass className="w-4 h-4" /> Eventos Náuticos Vinculados a este Paraje
                  </div>
                  {currentEventos.length > 0 ? (
                    currentEventos.map((ev) => (
                      <div key={ev.id} className="p-3 bg-slate-900/70 rounded border border-slate-800 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-white">{ev.tipo_evento}</h4>
                          <span className="font-mono text-amber-400 text-[11px]">Año {ev.anno_evento || ev.fecha_evento}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{ev.descripcion}</p>
                        <div className="text-[10px] text-slate-500 pt-1">Fuente: {ev.fuente_referencia}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs italic">
                      No hay eventos náuticos o naufragios catalogados directamente en este punto geográfico.
                    </p>
                  )}
                </div>

                {/* 4. Historical Description */}
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1">Relevancia Histórica Colonial:</h4>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-800/80">
                    {selectedToponimia.descripcion_historica}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
              <Compass className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm font-medium">Seleccione un topónimo de la lista</p>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                Consulte el origen etimológico indígena o colonial, las fuentes cartográficas antiguas y su vinculación con los eventos de naufragio.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create/Edit Toponimia */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-cinzel font-bold text-lg text-sky-400 flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                {editingItem.id ? `Editar Topónimo: ${editingItem.nombre_actual}` : 'Registrar Nuevo Topónimo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nombre Actual *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.nombre_actual || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, nombre_actual: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                    placeholder="Ej. Portobelo"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nombre Histórico Colonial</label>
                  <input
                    type="text"
                    value={editingItem.nombre_historico || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, nombre_historico: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                    placeholder="Ej. San Felipe de Puerto Bello"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Tipo de Accidente Geográfico</label>
                  <input
                    type="text"
                    value={editingItem.tipo_toponimia || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, tipo_toponimia: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                    placeholder="Bahía, Cabo, Isla, Punta, Puerto..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Lengua de Origen</label>
                  <input
                    type="text"
                    value={editingItem.lengua_origen || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, lengua_origen: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                    placeholder="Español colonial, Cueva, Guna, Chibcha..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Región de Panamá</label>
                  <input
                    type="text"
                    value={editingItem.region || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, region: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                    placeholder="Colón, Darién, Las Perlas, Veraguas..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Siglo Primera Mención</label>
                  <input
                    type="number"
                    value={editingItem.siglo_primer_registro || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, siglo_primer_registro: parseInt(e.target.value) || 16 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                    placeholder="16"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Etimología y Significado del Nombre</label>
                <textarea
                  rows={2}
                  value={editingItem.etimologia || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, etimologia: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                  placeholder="Detalles filológicos sobre la raíz y evolución del topónimo..."
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Descripción Histórica</label>
                <textarea
                  rows={3}
                  value={editingItem.descripcion_historica || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, descripcion_historica: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none"
                  placeholder="Importancia estratégica, ferias de galeones, defensas fortificadas..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded shadow transition-colors"
                >
                  Guardar Topónimo (MySQL)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
