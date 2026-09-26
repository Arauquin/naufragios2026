import React, { useState } from 'react';
import { Buque, Hundimiento, Artefacto, Capitan, Toponimia, UbicacionGeografica, UserRole } from '../types/database';
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  Anchor, 
  Compass, 
  CheckCircle, 
  BookOpen, 
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

interface PdfExportCenterProps {
  buques: Buque[];
  hundimientos: Hundimiento[];
  artefactos: Artefacto[];
  capitanes: Capitan[];
  toponimias: Toponimia[];
  ubicaciones: UbicacionGeografica[];
  userRole: UserRole;
}

export const PdfExportCenter: React.FC<PdfExportCenterProps> = ({
  buques,
  hundimientos,
  artefactos,
  capitanes,
  toponimias,
  ubicaciones,
  userRole,
}) => {
  const [reportType, setReportType] = useState<'individual_buque' | 'catalogo_general' | 'toponimia'>('individual_buque');
  const [selectedBuqueId, setSelectedBuqueId] = useState<number>(buques[0]?.id || 1);
  const [selectedToponimiaId, setSelectedToponimiaId] = useState<number>(toponimias[0]?.id || 1);
  const [selectedSiglo, setSelectedSiglo] = useState<'all' | 'XVI' | 'XVII'>('all');

  const selectedBuque = buques.find((b) => b.id === selectedBuqueId) || buques[0];
  const selectedHundimiento = hundimientos.find((h) => h.buque_id === selectedBuque?.id);
  const selectedArtefactos = artefactos.filter((a) => a.buque_id === selectedBuque?.id);
  const selectedCapitanes = capitanes.filter((c) => c.buque_id === selectedBuque?.id);

  const selectedTop = toponimias.find((t) => t.id === selectedToponimiaId) || toponimias[0];
  const selectedUbicacion = ubicaciones.find((u) => u.toponimia_id === selectedTop?.id);

  const filteredCatalogBuques = buques.filter((b) => {
    if (selectedSiglo === 'all') return true;
    const h = hundimientos.find((item) => item.buque_id === b.id);
    return h && h.siglo === selectedSiglo;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-cinzel text-amber-300 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> Centro de Exportación de Informes y Documentos PDF
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Disponible para <strong>Consultores (Público)</strong>, <strong>Editores</strong> y <strong>Administradores</strong> según la propuesta técnica UP-UCV
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg active:scale-95 self-start md:self-auto"
        >
          <Printer className="w-4 h-4" /> Imprimir / Descargar en PDF
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Report Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Tipo de Documento:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setReportType('individual_buque')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                reportType === 'individual_buque' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ficha Individual de Buque
            </button>
            <button
              onClick={() => setReportType('catalogo_general')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                reportType === 'catalogo_general' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Catálogo General de Pecios
            </button>
            <button
              onClick={() => setReportType('toponimia')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                reportType === 'toponimia' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ficha de Toponimia
            </button>
          </div>
        </div>

        {/* Entity Selector depending on type */}
        <div className="flex items-center gap-2">
          {reportType === 'individual_buque' && (
            <select
              value={selectedBuqueId}
              onChange={(e) => setSelectedBuqueId(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500"
            >
              {buques.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre_buque} ({b.tipo_embarcacion})
                </option>
              ))}
            </select>
          )}

          {reportType === 'catalogo_general' && (
            <select
              value={selectedSiglo}
              onChange={(e) => setSelectedSiglo(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Siglos (XVI y XVII)</option>
              <option value="XVI">Siglo XVI (1501-1600)</option>
              <option value="XVII">Siglo XVII (1601-1700)</option>
            </select>
          )}

          {reportType === 'toponimia' && (
            <select
              value={selectedToponimiaId}
              onChange={(e) => setSelectedToponimiaId(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-sky-400 font-medium focus:outline-none focus:border-sky-500"
            >
              {toponimias.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre_actual} (Histórico: "{t.nombre_historico}")
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Paper Sheet Preview (Printable Academic Dossier) */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 border border-slate-300 font-serif space-y-6">
        {/* Document Header with Official Academic Seal */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="text-[10px] font-sans font-bold tracking-widest uppercase text-slate-700">
            República de Panamá &bull; Sistema Histórico de Patrimonio Arqueológico Subacuático
          </div>
          <div className="text-xs font-sans text-slate-600">
            Universidad de Panamá (UP) &bull; Universidad Central de Venezuela (UCV)
          </div>
          <div className="text-xs font-sans text-slate-500 italic">
            Proyecto de Investigación: Dra. María Leal Cuervo, Dr. Carlos Ortega &amp; Lic. Tomás Fernández
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-950 pt-2 tracking-wide">
            {reportType === 'individual_buque' && `EXPEDIENTE ARQUEOLÓGICO: ${selectedBuque?.nombre_buque.toUpperCase()}`}
            {reportType === 'catalogo_general' && `CATÁLOGO CONSOLIDADO DE NAUFRAGIOS HISTÓRICOS (SIGLOS XVI - XVII)`}
            {reportType === 'toponimia' && `FICHA TOPONÍMICA Y CARTOGRÁFICA: ${selectedTop?.nombre_actual.toUpperCase()}`}
          </h1>

          <div className="text-[11px] font-sans text-slate-600 pt-1 flex justify-center items-center gap-4">
            <span>Fecha de emisión: {new Date().toLocaleDateString('es-PA')}</span>
            <span>&bull;</span>
            <span>Clasificación: Documento Académico Oficial</span>
          </div>
        </div>

        {/* 1. INDIVIDUAL SHIPWRECK REPORT */}
        {reportType === 'individual_buque' && selectedBuque && (
          <div className="space-y-6 text-xs font-sans">
            {/* General Specs Table */}
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                1. Datos de la Embarcación
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Nombre:</span>
                  <span className="font-bold text-slate-900">{selectedBuque.nombre_buque}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Tipología:</span>
                  <span className="font-semibold text-slate-800">{selectedBuque.tipo_embarcacion}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Nacionalidad:</span>
                  <span className="font-semibold text-slate-800">{selectedBuque.nacionalidad}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Arqueo:</span>
                  <span className="font-semibold text-slate-800">{selectedBuque.tonelaje || '-'} toneladas</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Botadura:</span>
                  <span className="font-semibold text-slate-800">{selectedBuque.anno_construccion || 'Desconocido'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Origen:</span>
                  <span className="font-semibold text-slate-800">{selectedBuque.puerto_origen || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Destino:</span>
                  <span className="font-semibold text-slate-800">{selectedBuque.puerto_destino || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Tripulantes:</span>
                  <span className="font-semibold text-slate-800">{selectedBuque.numero_tripulantes || '-'} marineros</span>
                </div>
              </div>
            </div>

            {/* Sinking Circumstances */}
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                2. Circunstancias del Naufragio y Localización Geográfica (WGS84)
              </h3>
              {selectedHundimiento ? (
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Fecha / Año:</span>
                      <span className="font-bold text-slate-900">
                        {selectedHundimiento.fecha_hundimiento || selectedHundimiento.anno_hundimiento} (Siglo {selectedHundimiento.siglo})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Profundidad:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedHundimiento.profundidad_metros ? `${selectedHundimiento.profundidad_metros} metros` : 'No batimétrica'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Conservación:</span>
                      <span className="font-semibold text-slate-800 capitalize">{selectedHundimiento.estado_conservacion}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Paraje Náutico y Zona:</span>
                    <span className="text-slate-900 font-medium">
                      {selectedHundimiento.ubicacion_descripcion} &middot; {selectedHundimiento.zona_maritima}
                    </span>
                  </div>

                  <div className="p-2 bg-amber-50 rounded border border-amber-200 font-mono text-[11px] text-amber-950 font-bold">
                    Coordenadas Geográficas Oficiales: Latitud {selectedHundimiento.latitud}° N, Longitud {Math.abs(selectedHundimiento.longitud)}° W (WGS84)
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Causa del Siniestro:</span>
                    <p className="text-slate-800 leading-relaxed">{selectedHundimiento.causa_hundimiento}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">Sin datos de hundimiento registrados.</p>
              )}
            </div>

            {/* Cataloged Artifacts */}
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                3. Bienes Muebles y Artefactos Catalogados ({selectedArtefactos.length})
              </h3>
              {selectedArtefactos.length > 0 ? (
                <div className="space-y-2">
                  {selectedArtefactos.map((art) => (
                    <div key={art.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px]">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{art.nombre_artefacto}</span>
                        <span className="font-mono text-slate-600">{art.referencia_catalogo}</span>
                      </div>
                      <div className="text-slate-600 text-[10px]">
                        Material: {art.material} &bull; Tipología: {art.tipo_artefacto} &bull; Custodia: {art.ubicacion_actual}
                      </div>
                      <p className="text-slate-800 mt-1 leading-relaxed">{art.descripcion}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No se registran artefactos recuperados para este pecio.</p>
              )}
            </div>

            {/* Archival Documentation */}
            <div className="pt-2 border-t border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Fuentes Primarias de Archivo:</span>
              <p className="text-slate-800 text-[11px]">
                {selectedBuque.fuente_informacion || 'Archivo General de Indias (AGI), Sevilla / Biblioteca Nacional de España.'}
              </p>
            </div>
          </div>
        )}

        {/* 2. CATALOG REPORT */}
        {reportType === 'catalogo_general' && (
          <div className="space-y-4 text-xs font-sans">
            <p className="text-slate-700 leading-relaxed">
              El presente catálogo consolida el registro sistemático de naufragios coloniales identificados en aguas jurisdiccionales de la República de Panamá para los siglos XVI y XVII, resultado del cruce de cartografía histórica, relaciones de pérdidas de la Flota de Indias y prospecciones arqueológicas subacuáticas.
            </p>

            <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Buque</th>
                  <th className="p-2 border-r border-slate-300">Tipo</th>
                  <th className="p-2 border-r border-slate-300">Año</th>
                  <th className="p-2 border-r border-slate-300">Zona Marítima</th>
                  <th className="p-2 border-r border-slate-300">Coordenadas WGS84</th>
                  <th className="p-2">Causa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCatalogBuques.map((b) => {
                  const h = hundimientos.find((item) => item.buque_id === b.id);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{b.nombre_buque}</td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">{b.tipo_embarcacion}</td>
                      <td className="p-2 border-r border-slate-300 font-mono text-slate-800">{h?.anno_hundimiento || '-'}</td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">{h?.zona_maritima || '-'}</td>
                      <td className="p-2 border-r border-slate-300 font-mono text-[10px] text-slate-700">
                        {h ? `${h.latitud.toFixed(4)}°N, ${Math.abs(h.longitud).toFixed(4)}°W` : '-'}
                      </td>
                      <td className="p-2 text-slate-700 truncate max-w-[150px]">{h?.causa_hundimiento || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. TOPONYMY REPORT */}
        {reportType === 'toponimia' && selectedTop && (
          <div className="space-y-4 text-xs font-sans">
            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">Nombre Actual:</span>
                  <span className="font-bold text-slate-900">{selectedTop.nombre_actual}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Nombre Histórico:</span>
                  <span className="font-bold text-slate-900 italic">"{selectedTop.nombre_historico}"</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Tipo de Accidente:</span>
                  <span className="font-semibold text-slate-800">{selectedTop.tipo_toponimia}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Lengua de Origen:</span>
                  <span className="font-semibold text-slate-800">{selectedTop.lengua_origen}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Siglo Primer Registro:</span>
                  <span className="font-semibold text-slate-800">Siglo {selectedTop.siglo_primer_registro}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Estado de Uso:</span>
                  <span className="font-semibold text-slate-800 capitalize">{selectedTop.estado_uso}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Etimología y Significado del Nombre:</span>
                <p className="text-slate-800 leading-relaxed">{selectedTop.etimologia}</p>
              </div>

              {selectedUbicacion && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Georreferenciación y Fuente Cartográfica:</span>
                  <div className="font-mono text-[11px] font-bold text-slate-900">
                    WGS84: {selectedUbicacion.latitud}° N, {Math.abs(selectedUbicacion.longitud)}° W ({selectedUbicacion.tipo_costa})
                  </div>
                  <p className="text-slate-700 text-[11px] mt-0.5">{selectedUbicacion.fuente_cartografica}</p>
                </div>
              )}
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Importancia Histórica Colonial:</span>
              <p className="text-slate-800 leading-relaxed bg-white p-2 border border-slate-200 rounded">
                {selectedTop.descripcion_historica}
              </p>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="border-t-2 border-slate-900 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-sans text-slate-600 gap-2">
          <div>
            Base de Datos Histórica de Naufragios y Toponimia &bull; República de Panamá
          </div>
          <div className="font-mono">
            HASH FORENSE: SHA256-PAN-{selectedBuque?.id || 'ALL'}-UP-UCV
          </div>
        </div>
      </div>

      {/* Technical Implementation Callout */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
        <h4 className="font-bold text-amber-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Implementación Técnica en Laravel (`barryvdh/laravel-dompdf`)
        </h4>
        <p className="text-slate-300 leading-relaxed">
          En el backend de Laravel, esta funcionalidad se programa instalando el paquete <code className="text-amber-300">barryvdh/laravel-dompdf</code> y creando el método en el controlador correspondiente con la vista Blade vectorizada:
        </p>
        <pre className="p-3 bg-slate-950 rounded font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`// app/Http/Controllers/BuqueController.php
use Barryvdh\\DomPDF\\Facade\\Pdf;

public function exportPdf(Buque $buque)
{
    // Accesible para roles: consultor, editor, admin, superadmin
    $this->authorize('exportar-datos');

    $buque->load(['hundimientos', 'artefactos', 'capitanes', 'documentacion']);
    $pdf = Pdf::loadView('pdf.buque_expediente', compact('buque'))
              ->setPaper('a4', 'portrait');

    return $pdf->download("expediente_naufragio_{$buque->id}.pdf");
}`}
        </pre>
      </div>
    </div>
  );
};
