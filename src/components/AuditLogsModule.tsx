import React, { useState } from 'react';
import { AuditLog, UserRole } from '../types/database';
import { ShieldAlert, Search, Filter, History, UserCheck, Clock, ArrowRight, Lock } from 'lucide-react';

interface AuditLogsModuleProps {
  logs: AuditLog[];
  userRole: UserRole;
}

export const AuditLogsModule: React.FC<AuditLogsModuleProps> = ({ logs, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedLogId, setSelectedLogId] = useState<number | null>(logs[0]?.id || null);

  // If user is not superadmin, show permission restriction (Policy / Gate)
  if (userRole !== 'superadmin') {
    return (
      <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold font-cinzel text-slate-100">
          Acceso Restringido &middot; Middleware `role:superadmin`
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          El módulo de trazabilidad forense y auditoría (<code className="text-amber-400">audit_logs</code>) está estrictamente limitado al perfil <strong>Superadmin</strong> para garantizar la cadena de custodia probatoria y la integridad científica del sistema.
        </p>
        <div className="text-[11px] text-slate-500 pt-2">
          Cambie el rol a <strong>Superadmin</strong> en la barra superior para inspeccionar este módulo.
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.auditable_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm);

    const matchesEvent = selectedEvent === 'all' || log.event === selectedEvent;

    return matchesSearch && matchesEvent;
  });

  const activeLog = logs.find((l) => l.id === selectedLogId) || logs[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-cinzel text-amber-400 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" /> Registro de Auditoría Forense (`audit_logs`)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Trazabilidad automática impulsada por <code className="text-amber-300">owen-it/laravel-auditing</code>. Cada inserción, edición y SoftDelete se registra con IP, agente y JSON diffs.
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400" /> Auditoría Activa &middot; 100% Inmutable
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por investigador, IP o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="all">Todos los eventos (Created, Updated, Deleted)</option>
          <option value="created">Evento: CREATED</option>
          <option value="updated">Evento: UPDATED</option>
          <option value="deleted">Evento: DELETED (SoftDelete)</option>
        </select>
      </div>

      {/* Audit Log Table & JSON Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Log list */}
        <div className="lg:col-span-6 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => {
            const isSelected = log.id === activeLog?.id;
            const badgeColor = 
              log.event === 'created'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : log.event === 'updated'
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-red-950 text-red-300 border-red-800';

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLogId(log.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                      {log.event}
                    </span>
                    <span className="font-mono text-slate-300 font-semibold">
                      {log.auditable_type.split('\\').pop()} #{log.auditable_id}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{log.created_at}</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-medium text-slate-300 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" /> {log.user_name}
                  </span>
                  <span className="font-mono text-slate-500">{log.ip_address}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed JSON Inspector */}
        <div className="lg:col-span-6">
          {activeLog ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Evento de Auditoría #{activeLog.id}</div>
                  <h3 className="font-bold text-slate-200 text-sm mt-0.5 font-mono">
                    {activeLog.auditable_type} &middot; ID {activeLog.auditable_id}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 font-medium">{activeLog.user_name}</div>
                  <div className="text-[11px] font-mono text-amber-400">{activeLog.created_at}</div>
                </div>
              </div>

              {/* Forensic Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Dirección IP:</span>
                  <span className="text-slate-300">{activeLog.ip_address}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Ruta Web URL:</span>
                  <span className="text-slate-300 truncate block">{activeLog.url}</span>
                </div>
              </div>

              {/* JSON Differences (old_values vs new_values) */}
              <div className="space-y-3">
                {activeLog.old_values && (
                  <div>
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block mb-1">
                      Valores Anteriores (`old_values`):
                    </span>
                    <pre className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-red-300 font-mono text-[11px] overflow-auto max-h-40">
                      {JSON.stringify(activeLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                    Nuevos Valores Registrados (`new_values`):
                  </span>
                  <pre className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-emerald-300 font-mono text-[11px] overflow-auto max-h-48">
                    {JSON.stringify(activeLog.new_values, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 font-mono border-t border-slate-800 truncate">
                User Agent: {activeLog.user_agent}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Seleccione un evento de auditoría para ver el análisis diferencial JSON.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
