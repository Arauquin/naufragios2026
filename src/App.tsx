import React, { useState } from 'react';
import { 
  UserRole, 
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
  AuditLog 
} from './types/database';
import { 
  INITIAL_BUQUES, 
  INITIAL_HUNDIMIENTOS, 
  INITIAL_ARTEFACTOS, 
  INITIAL_CAPITANES, 
  INITIAL_INTERVENCIONES, 
  INITIAL_CONDICIONES, 
  INITIAL_DOCUMENTACION, 
  INITIAL_TOPONIMIA, 
  INITIAL_UBICACIONES, 
  INITIAL_EVENTOS_NAUTICOS, 
  INITIAL_AUDIT_LOGS 
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { InteractiveMap } from './components/InteractiveMap';
import { BuquesModule } from './components/BuquesModule';
import { ToponimiaModule } from './components/ToponimiaModule';
import { SqlMigrationsViewer } from './components/SqlMigrationsViewer';
import { AuditLogsModule } from './components/AuditLogsModule';
import { SecurityGuideModule } from './components/SecurityGuideModule';
import { 
  Anchor, 
  Compass, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Sparkles,
  Database
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'mapa' | 'buques' | 'toponimia' | 'sql' | 'auditoria' | 'seguridad'>('mapa');
  const [userRole, setUserRole] = useState<UserRole>('superadmin');

  // Dynamic state for entities with soft-deletes and auditing
  const [buques, setBuques] = useState<Buque[]>(INITIAL_BUQUES);
  const [hundimientos, setHundimientos] = useState<Hundimiento[]>(INITIAL_HUNDIMIENTOS);
  const [artefactos, setArtefactos] = useState<Artefacto[]>(INITIAL_ARTEFACTOS);
  const [capitanes, setCapitanes] = useState<Capitan[]>(INITIAL_CAPITANES);
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>(INITIAL_INTERVENCIONES);
  const [condiciones, setCondiciones] = useState<CondicionAmbiental[]>(INITIAL_CONDICIONES);
  const [documentacion, setDocumentacion] = useState<DocumentacionHistorica[]>(INITIAL_DOCUMENTACION);
  const [toponimias, setToponimias] = useState<Toponimia[]>(INITIAL_TOPONIMIA);
  const [ubicaciones, setUbicaciones] = useState<UbicacionGeografica[]>(INITIAL_UBICACIONES);
  const [eventos, setEventos] = useState<EventoNautico[]>(INITIAL_EVENTOS_NAUTICOS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Selected entities for dossier display
  const [selectedBuqueId, setSelectedBuqueId] = useState<number | null>(1);
  const [selectedToponimiaId, setSelectedToponimiaId] = useState<number | null>(1);

  // PDF Export Modal State
  const [pdfModalBuque, setPdfModalBuque] = useState<Buque | null>(null);

  // Handler to record audit log on mutations (mimicking owen-it/laravel-auditing)
  const recordAudit = (
    event: 'created' | 'updated' | 'deleted',
    auditable_type: string,
    auditable_id: number,
    old_values: Record<string, any> | null,
    new_values: Record<string, any> | null
  ) => {
    const roleNames: Record<UserRole, string> = {
      superadmin: 'Dr. Carlos Ortega (Superadmin)',
      admin: 'Administrador General (Admin)',
      editor: 'Dra. María Leal Cuervo (Editor/UP)',
      consultor: 'Usuario Consultor (Público)'
    };

    const newLog: AuditLog = {
      id: auditLogs.length + 1,
      user_id: userRole === 'superadmin' ? 1 : userRole === 'editor' ? 2 : 4,
      user_name: roleNames[userRole],
      event,
      auditable_type,
      auditable_id,
      old_values,
      new_values,
      url: window.location.href,
      ip_address: '190.140.22.81',
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Buque create / update handler
  const handleSaveBuque = (buqueData: Partial<Buque>) => {
    if (buqueData.id) {
      // Update
      const oldBuque = buques.find((b) => b.id === buqueData.id);
      setBuques((prev) =>
        prev.map((b) =>
          b.id === buqueData.id
            ? { ...b, ...buqueData, updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) }
            : b
        )
      );
      recordAudit('updated', 'App\\Models\\Buque', buqueData.id, oldBuque || null, buqueData);
    } else {
      // Create
      const newId = buques.length > 0 ? Math.max(...buques.map((b) => b.id)) + 1 : 1;
      const created: Buque = {
        id: newId,
        nombre_buque: buqueData.nombre_buque || 'Nuevo Buque Colonial',
        tipo_embarcacion: buqueData.tipo_embarcacion || 'Galeón',
        nacionalidad: buqueData.nacionalidad || 'Española',
        tonelaje: buqueData.tonelaje,
        anno_construccion: buqueData.anno_construccion,
        puerto_origen: buqueData.puerto_origen,
        puerto_destino: buqueData.puerto_destino,
        propietario: buqueData.propietario,
        carga_declarada: buqueData.carga_declarada,
        numero_tripulantes: buqueData.numero_tripulantes,
        descripcion: buqueData.descripcion,
        fuente_informacion: buqueData.fuente_informacion,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setBuques((prev) => [created, ...prev]);
      setSelectedBuqueId(newId);
      recordAudit('created', 'App\\Models\\Buque', newId, null, created);
    }
  };

  // Buque SoftDelete handler
  const handleDeleteBuque = (id: number) => {
    const toDelete = buques.find((b) => b.id === id);
    setBuques((prev) => prev.filter((b) => b.id !== id));
    if (selectedBuqueId === id) {
      setSelectedBuqueId(null);
    }
    recordAudit('deleted', 'App\\Models\\Buque', id, toDelete || null, null);
  };

  // Toponimia create / update handler
  const handleSaveToponimia = (topData: Partial<Toponimia>) => {
    if (topData.id) {
      const oldTop = toponimias.find((t) => t.id === topData.id);
      setToponimias((prev) =>
        prev.map((t) =>
          t.id === topData.id
            ? { ...t, ...topData }
            : t
        )
      );
      recordAudit('updated', 'App\\Models\\Toponimia', topData.id, oldTop || null, topData);
    } else {
      const newId = toponimias.length > 0 ? Math.max(...toponimias.map((t) => t.id)) + 1 : 1;
      const created: Toponimia = {
        id: newId,
        nombre_actual: topData.nombre_actual || 'Nuevo Topónimo',
        nombre_historico: topData.nombre_historico || '',
        tipo_toponimia: topData.tipo_toponimia || 'Bahía',
        etimologia: topData.etimologia,
        lengua_origen: topData.lengua_origen,
        siglo_primer_registro: topData.siglo_primer_registro,
        descripcion_historica: topData.descripcion_historica || '',
        pais: 'Panamá',
        region: topData.region || 'Colón',
        estado_uso: topData.estado_uso || 'vigente',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setToponimias((prev) => [created, ...prev]);
      setSelectedToponimiaId(newId);
      recordAudit('created', 'App\\Models\\Toponimia', newId, null, created);
    }
  };

  // Toponimia SoftDelete handler
  const handleDeleteToponimia = (id: number) => {
    const toDelete = toponimias.find((t) => t.id === id);
    setToponimias((prev) => prev.filter((t) => t.id !== id));
    if (selectedToponimiaId === id) {
      setSelectedToponimiaId(null);
    }
    recordAudit('deleted', 'App\\Models\\Toponimia', id, toDelete || null, null);
  };

  // Navigation helpers from map markers
  const handleSelectBuqueFromMap = (buqueId: number) => {
    setSelectedBuqueId(buqueId);
    setCurrentTab('buques');
  };

  const handleSelectToponimiaFromMap = (toponimiaId: number) => {
    setSelectedToponimiaId(toponimiaId);
    setCurrentTab('toponimia');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onChangeRole={setUserRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'mapa' && (
          <div className="space-y-6">
            {/* Hero / Context Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                  Cartografía Náutica &bull; Siglos XVI y XVII
                </div>
                <h1 className="text-2xl font-extrabold font-cinzel text-white mt-1">
                  Pecios Coloniales y Toponimia en Aguas de Panamá
                </h1>
                <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                  Visualización geográfica interactiva basada en el relevamiento de la Universidad de Panamá (UP) y la Universidad Central de Venezuela (UCV). Haga clic en los marcadores para consultar la ficha histórica, batimetría y fuentes documentales del AGI.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start md:self-auto">
                <button
                  onClick={() => setCurrentTab('sql')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-md"
                >
                  <Database className="w-3.5 h-3.5" /> Ver SQL & Migraciones
                </button>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <InteractiveMap
              buques={buques}
              hundimientos={hundimientos}
              toponimias={toponimias}
              ubicaciones={ubicaciones}
              onSelectBuque={handleSelectBuqueFromMap}
              onSelectToponimia={handleSelectToponimiaFromMap}
            />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
                <div className="text-[11px] text-slate-400 font-medium">Buques Catalogados</div>
                <div className="text-2xl font-bold font-cinzel text-amber-300 mt-1">{buques.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Galeones, Naos y Carabelas</div>
              </div>

              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
                <div className="text-[11px] text-slate-400 font-medium">Topónimos Costeros</div>
                <div className="text-2xl font-bold font-cinzel text-sky-400 mt-1">{toponimias.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Bahías, cabos y puertos</div>
              </div>

              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
                <div className="text-[11px] text-slate-400 font-medium">Artefactos Recuperados</div>
                <div className="text-2xl font-bold font-cinzel text-amber-200 mt-1">{artefactos.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Cañones, anclas y vajillas</div>
              </div>

              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
                <div className="text-[11px] text-slate-400 font-medium">Eventos de Auditoría</div>
                <div className="text-2xl font-bold font-cinzel text-emerald-400 mt-1">{auditLogs.length}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Trazabilidad forense activa</div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'buques' && (
          <BuquesModule
            buques={buques}
            hundimientos={hundimientos}
            artefactos={artefactos}
            capitanes={capitanes}
            intervenciones={intervenciones}
            condiciones={condiciones}
            documentacion={documentacion}
            userRole={userRole}
            selectedBuqueId={selectedBuqueId}
            onSelectBuque={setSelectedBuqueId}
            onSaveBuque={handleSaveBuque}
            onDeleteBuque={handleDeleteBuque}
            onExportPdf={(buque) => setPdfModalBuque(buque)}
          />
        )}

        {currentTab === 'toponimia' && (
          <ToponimiaModule
            toponimias={toponimias}
            ubicaciones={ubicaciones}
            eventos={eventos}
            userRole={userRole}
            selectedToponimiaId={selectedToponimiaId}
            onSelectToponimia={setSelectedToponimiaId}
            onSaveToponimia={handleSaveToponimia}
            onDeleteToponimia={handleDeleteToponimia}
          />
        )}

        {currentTab === 'sql' && <SqlMigrationsViewer />}

        {currentTab === 'auditoria' && (
          <AuditLogsModule logs={auditLogs} userRole={userRole} />
        )}

        {currentTab === 'seguridad' && <SecurityGuideModule />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Sistema Web de Gestión: Base de Datos Histórica de Naufragios y Toponimia &bull; República de Panamá
          </div>
          <div className="text-[11px] text-slate-400">
            Arquitectura: Laravel 10/11 + MySQL 8.x + Spatie Permission + OwenIt Auditing + Leaflet.js
          </div>
        </div>
      </footer>

      {/* Modal: PDF Export Simulation (Requirement #2: Consultor/Public can export to PDF) */}
      {pdfModalBuque && (
        <div className="fixed inset-0 z-[1300] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel font-bold text-lg text-white">
                  Vista Previa de Exportación &middot; Expediente Arqueológico (PDF)
                </h3>
              </div>
              <button
                onClick={() => setPdfModalBuque(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Sheet Preview */}
            <div className="bg-white text-slate-900 p-8 rounded-xl shadow-inner font-serif text-xs space-y-4 border border-slate-200">
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <div className="text-[10px] uppercase font-sans tracking-widest text-slate-600 font-bold">
                  República de Panamá &bull; Patrimonio Histórico Sumergido &bull; UP / UCV
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900 mt-1">
                  FICHA TÉCNICA DE PECIO HISTÓRICO: {pdfModalBuque.nombre_buque.toUpperCase()}
                </h2>
                <div className="text-[11px] text-slate-600 font-sans mt-0.5">
                  ID Catálogo: #{pdfModalBuque.id} &middot; Siglo:{' '}
                  {hundimientos.find((h) => h.buque_id === pdfModalBuque.id)?.siglo || 'XVII'} &middot; Fecha de Emisión:{' '}
                  {new Date().toLocaleDateString('es-PA')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                <div className="space-y-1">
                  <div><strong>Embarcación:</strong> {pdfModalBuque.nombre_buque}</div>
                  <div><strong>Tipología:</strong> {pdfModalBuque.tipo_embarcacion}</div>
                  <div><strong>Nacionalidad:</strong> {pdfModalBuque.nacionalidad}</div>
                  <div><strong>Arqueo:</strong> {pdfModalBuque.tonelaje || '-'} toneladas</div>
                </div>
                <div className="space-y-1">
                  <div><strong>Año Botadura:</strong> {pdfModalBuque.anno_construccion || 'Desconocido'}</div>
                  <div><strong>Origen / Destino:</strong> {pdfModalBuque.puerto_origen} &rarr; {pdfModalBuque.puerto_destino}</div>
                  <div><strong>Propietario / Armador:</strong> {pdfModalBuque.propietario}</div>
                  <div><strong>Tripulación:</strong> {pdfModalBuque.numero_tripulantes || '-'} marinos</div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <h4 className="font-bold text-xs uppercase font-sans text-slate-800 mb-1">
                  Circunstancias del Naufragio:
                </h4>
                {(() => {
                  const h = hundimientos.find((item) => item.buque_id === pdfModalBuque.id);
                  return h ? (
                    <div className="space-y-1 text-slate-700 text-[11px] font-sans">
                      <div><strong>Fecha o Año:</strong> {h.fecha_hundimiento || h.anno_hundimiento}</div>
                      <div><strong>Paraje:</strong> {h.ubicacion_descripcion} ({h.zona_maritima})</div>
                      <div><strong>Coordenadas WGS84:</strong> {h.latitud}° N, {h.longitud}° W</div>
                      <div><strong>Causa:</strong> {h.causa_hundimiento}</div>
                      <div><strong>Profundidad:</strong> {h.profundidad_metros ? `${h.profundidad_metros} m` : 'No batimétrica'}</div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Sin datos de hundimiento registrados.</p>
                  );
                })()}
              </div>

              <div className="border-t border-slate-200 pt-2">
                <h4 className="font-bold text-xs uppercase font-sans text-slate-800 mb-1">
                  Carga Declarada y Bienes Catalogados:
                </h4>
                <p className="text-slate-700 text-[11px] font-sans leading-relaxed">
                  {pdfModalBuque.carga_declarada || 'Sin desglose de alijo en autos del proceso.'}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <h4 className="font-bold text-xs uppercase font-sans text-slate-800 mb-1">
                  Fuentes de Archivo Primarias:
                </h4>
                <p className="text-slate-700 text-[11px] font-sans">
                  {pdfModalBuque.fuente_informacion || 'Archivo General de Indias (AGI), Sevilla.'}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 font-sans pt-3 border-t border-slate-200 flex justify-between items-center">
                <span>Documento oficial de consulta pública con fines de investigación científica y salvaguardia patrimonial.</span>
                <span className="font-mono">UP-UCV-PAN-DOC</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setPdfModalBuque(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded shadow transition-colors"
              >
                <Printer className="w-4 h-4" /> Imprimir / Guardar como PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
