import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Buque, Hundimiento, Toponimia, UbicacionGeografica } from '../types/database';
import { Anchor, Compass, MapPin, Eye, ExternalLink } from 'lucide-react';

interface InteractiveMapProps {
  buques: Buque[];
  hundimientos: Hundimiento[];
  toponimias: Toponimia[];
  ubicaciones: UbicacionGeografica[];
  onSelectBuque: (buqueId: number) => void;
  onSelectToponimia: (toponimiaId: number) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  buques,
  hundimientos,
  toponimias,
  ubicaciones,
  onSelectBuque,
  onSelectToponimia,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [filterType, setFilterType] = React.useState<'all' | 'naufragios' | 'toponimia'>('all');
  const [selectedSiglo, setSelectedSiglo] = React.useState<'all' | 'XVI' | 'XVII'>('all');

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on Panama Isthmus (between Caribbean and Pacific)
    const map = L.map(mapContainerRef.current, {
      center: [9.08, -79.68],
      zoom: 8,
      minZoom: 6,
      maxZoom: 16,
    });

    // Nautical Cartographic Tile Layer (Esri Ocean or OpenStreetMap with maritime mood)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, DeLorme, Maritime Historic Panama',
      maxZoom: 13,
    }).addTo(map);

    // Subtle reference overlay for coastlines and bathymetry
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 13,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when filters or data change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    // Custom Shipwreck Icon
    const shipwreckIcon = L.divIcon({
      className: 'custom-shipwreck-marker',
      html: `
        <div style="background-color: #d97706; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fef3c7; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="5" r="3"></circle>
            <line x1="12" y1="22" x2="12" y2="8"></line>
            <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });

    // Custom Toponymy Icon
    const toponymyIcon = L.divIcon({
      className: 'custom-toponymy-marker',
      html: `
        <div style="background-color: #0284c7; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #bae6fd; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -16],
    });

    // Add Shipwreck Markers
    if (filterType === 'all' || filterType === 'naufragios') {
      hundimientos.forEach((h) => {
        if (selectedSiglo !== 'all' && h.siglo !== selectedSiglo) return;

        const buque = buques.find((b) => b.id === h.buque_id);
        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 text-slate-800 text-xs font-sans max-w-[260px]';
        popupContent.innerHTML = `
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <div style="font-size: 10px; color: #b45309; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Pecio Histórico &middot; Siglo ${h.siglo} (${h.anno_hundimiento})</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Cinzel', serif;">${buque ? buque.nombre_buque : 'Pecio Arqueológico'}</div>
            <div style="font-size: 11px; color: #475569;">${buque?.tipo_embarcacion || 'Embarcación colonial'} &middot; ${buque?.nacionalidad || 'Española'}</div>
          </div>
          <div style="margin-bottom: 6px; line-height: 1.35; color: #334155;">
            <strong>Causa:</strong> ${h.causa_hundimiento}<br/>
            <strong>Profundidad:</strong> ${h.profundidad_metros ? h.profundidad_metros + ' m' : 'No batimétrica'}<br/>
            <strong>Zona:</strong> ${h.zona_maritima}
          </div>
          <div style="background-color: #f8fafc; padding: 4px 6px; border-radius: 4px; font-size: 10px; color: #64748b; font-family: monospace; margin-bottom: 8px;">
            WGS84: ${h.latitud.toFixed(4)}° N, ${Math.abs(h.longitud).toFixed(4)}° W
          </div>
          <button id="btn-buque-${h.buque_id}" style="width: 100%; background-color: #0f172a; color: #f8fafc; padding: 5px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; border: none;">
            Ver Expediente Completo &rarr;
          </button>
        `;

        popupContent.querySelector(`#btn-buque-${h.buque_id}`)?.addEventListener('click', () => {
          onSelectBuque(h.buque_id);
        });

        const marker = L.marker([h.latitud, h.longitud], { icon: shipwreckIcon })
          .bindPopup(popupContent);
        layerGroupRef.current?.addLayer(marker);
      });
    }

    // Add Toponymy Markers
    if (filterType === 'all' || filterType === 'toponimia') {
      ubicaciones.forEach((u) => {
        const top = toponimias.find((t) => t.id === u.toponimia_id);
        if (!top) return;

        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 text-slate-800 text-xs font-sans max-w-[260px]';
        popupContent.innerHTML = `
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <div style="font-size: 10px; color: #0284c7; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Toponimia Histórica &middot; ${top.tipo_toponimia}</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Cinzel', serif;">${top.nombre_actual}</div>
            <div style="font-size: 11px; color: #64748b; font-style: italic;">Antiguo: "${top.nombre_historico}"</div>
          </div>
          <div style="margin-bottom: 6px; line-height: 1.35; color: #334155;">
            <strong>Origen lingüístico:</strong> ${top.lengua_origen || 'No registrado'}<br/>
            <strong>Costa:</strong> ${u.tipo_costa}<br/>
            <strong>Cartografía:</strong> ${u.fuente_cartografica || 'Derrotero colonial'}
          </div>
          <div style="background-color: #f8fafc; padding: 4px 6px; border-radius: 4px; font-size: 10px; color: #64748b; font-family: monospace; margin-bottom: 8px;">
            WGS84: ${u.latitud.toFixed(4)}° N, ${Math.abs(u.longitud).toFixed(4)}° W
          </div>
          <button id="btn-top-${top.id}" style="width: 100%; background-color: #0369a1; color: white; padding: 5px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; border: none;">
            Ver Ficha Toponímica &rarr;
          </button>
        `;

        popupContent.querySelector(`#btn-top-${top.id}`)?.addEventListener('click', () => {
          onSelectToponimia(top.id);
        });

        const marker = L.marker([u.latitud, u.longitud], { icon: toponymyIcon })
          .bindPopup(popupContent);
        layerGroupRef.current?.addLayer(marker);
      });
    }
  }, [buques, hundimientos, toponimias, ubicaciones, filterType, selectedSiglo, onSelectBuque, onSelectToponimia]);

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
      {/* Floating Map Filter Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-2 items-center bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 text-xs shadow-md">
        <span className="text-slate-400 font-medium flex items-center gap-1.5 pr-2 border-r border-slate-800">
          <Compass className="w-3.5 h-3.5 text-amber-400" /> Cartografía Panamá
        </span>

        {/* Filter buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filterType === 'all' ? 'bg-amber-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('naufragios')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              filterType === 'naufragios' ? 'bg-amber-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Naufragios
          </button>
          <button
            onClick={() => setFilterType('toponimia')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              filterType === 'toponimia' ? 'bg-sky-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span> Toponimia
          </button>
        </div>

        {/* Siglo filter */}
        <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
          <span className="text-slate-400">Siglo:</span>
          {(['all', 'XVI', 'XVII'] as const).map((siglo) => (
            <button
              key={siglo}
              onClick={() => setSelectedSiglo(siglo)}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedSiglo === siglo ? 'bg-slate-700 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {siglo === 'all' ? 'Todos' : siglo}
            </button>
          ))}
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 text-xs shadow-md text-slate-300 pointer-events-none">
        <div className="font-semibold text-slate-200 mb-1">Convenciones Náuticas</div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-200 inline-block"></span>
          <span>Pecios / Buques Hundidos (WGS84)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-200 inline-block"></span>
          <span>Topónimos & Puertos Coloniales</span>
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
