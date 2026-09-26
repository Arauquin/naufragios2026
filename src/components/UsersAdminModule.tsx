import React, { useState } from 'react';
import { User, UserRole } from '../types/database';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Building, 
  FileText, 
  AlertCircle, 
  Mail, 
  Clock, 
  Check, 
  X,
  Key
} from 'lucide-react';

interface UsersAdminModuleProps {
  users: User[];
  userRole: UserRole;
  onUpdateUserRole: (userId: number, newRole: UserRole) => void;
  onToggleUserActive: (userId: number) => void;
  onApproveRequest: (userId: number, role: UserRole) => void;
  onRejectRequest: (userId: number) => void;
  onSubmitRegistrationRequest: (data: { name: string; email: string; institution: string; purpose: string }) => void;
}

export const UsersAdminModule: React.FC<UsersAdminModuleProps> = ({
  users,
  userRole,
  onUpdateUserRole,
  onToggleUserActive,
  onApproveRequest,
  onRejectRequest,
  onSubmitRegistrationRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'request_form'>('pending');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formInstitution, setFormInstitution] = useState('');
  const [formPurpose, setFormPurpose] = useState('');

  const isAdminOrSuper = ['superadmin', 'admin'].includes(userRole);
  const pendingRequests = users.filter((u) => u.status === 'pending');
  const approvedUsers = users.filter((u) => u.status !== 'pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    onSubmitRegistrationRequest({
      name: formName,
      email: formEmail,
      institution: formInstitution,
      purpose: formPurpose,
    });

    setFormName('');
    setFormEmail('');
    setFormInstitution('');
    setFormPurpose('');
    setRequestSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-cinzel text-amber-300 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" /> Registro de Investigadores &amp; Gestión de Roles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Flujo oficial de inscripción académica: Los usuarios solicitan acceso y el Administrador evalúa la justificación para asignar los roles (Consultor, Editor, Admin)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Solicitudes Pendientes</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-amber-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Usuarios Activos ({approvedUsers.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('request_form');
              setRequestSubmitted(false);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'request_form'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-sky-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Solicitar Inscripción
          </button>
        </div>
      </div>

      {/* Warning if current role is not admin when viewing admin tabs */}
      {!isAdminOrSuper && activeTab !== 'request_form' && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Vista de Demostración para Rol {userRole}:</span>
            <p className="mt-0.5 text-slate-300 leading-relaxed">
              En Laravel, esta ruta (`/users` y `/users/{'{user}'}/roles`) está protegida por el middleware <code className="text-amber-400">role:superadmin|admin</code>. Actualmente estás visualizando la interfaz de administración. Para probar la aprobación y cambio de roles, asegúrate de mantener el rol en <strong>Superadmin</strong> o <strong>Admin</strong> desde la barra superior.
            </p>
          </div>
        </div>
      )}

      {/* 1. Solicitudes de Inscripción Pendientes */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cinzel text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Solicitudes de Registro en Espera de Aprobación
            </h3>
            <span className="text-xs text-slate-400">
              El administrador debe verificar la institución y asignar el rol correspondiente
            </span>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-bl">
                    PENDIENTE DE ROL
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{req.name}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" /> {req.email}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-start gap-1.5 text-slate-300 font-medium">
                      <Building className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{req.institution || 'Institución académica no informada'}</span>
                    </div>

                    <div className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-slate-800/80">
                      <span className="text-slate-300 font-semibold block mb-0.5">Propósito de la Investigación:</span>
                      "{req.investigation_purpose}"
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">
                    Fecha de solicitud: {req.created_at || 'Reciente'}
                  </div>

                  {/* Admin Actions */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onApproveRequest(req.id, 'editor')}
                        disabled={!isAdminOrSuper}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded shadow transition-colors flex items-center gap-1"
                        title="Asignar rol de Investigador (Crear/Editar registros y subir fotos/PDFs)"
                      >
                        <Check className="w-3.5 h-3.5" /> Aprobar como Editor
                      </button>

                      <button
                        onClick={() => onApproveRequest(req.id, 'consultor')}
                        disabled={!isAdminOrSuper}
                        className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-semibold rounded shadow transition-colors flex items-center gap-1"
                        title="Asignar rol de Consultor Público (Solo lectura y exportación a PDF)"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Aprobar Consultor
                      </button>
                    </div>

                    <button
                      onClick={() => onRejectRequest(req.id)}
                      disabled={!isAdminOrSuper}
                      className="px-2 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 disabled:opacity-50 text-xs rounded border border-red-800/40 transition-colors flex items-center gap-1"
                      title="Rechazar solicitud"
                    >
                      <X className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs space-y-2">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500" />
              <div className="font-semibold text-slate-300">No hay solicitudes pendientes en este momento</div>
              <p className="text-slate-500 max-w-sm mx-auto">
                Todos los investigadores que han solicitado acceso ya tienen su rol asignado. Puedes usar la pestaña "Solicitar Inscripción" para simular una nueva petición.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. Tabla de Usuarios Activos y Asignación de Roles */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cinzel text-slate-200">
              Investigadores y Usuarios Registrados en la Base de Datos
            </h3>
            <span className="text-xs text-slate-400">
              Control granular de permisos con Spatie Laravel Permission
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Usuario / Investigador</th>
                    <th className="p-3.5">Institución</th>
                    <th className="p-3.5">Rol Asignado (Spatie)</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5">Último Acceso</th>
                    <th className="p-3.5 text-right">Acciones Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {approvedUsers.map((u) => {
                    const roleBadgeColor = 
                      u.role === 'superadmin'
                        ? 'bg-amber-950 text-amber-300 border-amber-700 font-bold'
                        : u.role === 'admin'
                        ? 'bg-purple-950 text-purple-300 border-purple-700'
                        : u.role === 'editor'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-sky-950 text-sky-300 border-sky-700';

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-100">{u.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                        </td>

                        <td className="p-3.5 text-slate-300 max-w-[200px] truncate">
                          {u.institution || 'Universidad de Panamá / UCV'}
                        </td>

                        <td className="p-3.5">
                          {isAdminOrSuper && u.role !== 'superadmin' ? (
                            <select
                              value={u.role}
                              onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-medium focus:border-amber-500 focus:outline-none"
                            >
                              <option value="consultor">Consultor (Solo lectura)</option>
                              <option value="editor">Editor (Investigador)</option>
                              <option value="admin">Administrador</option>
                            </select>
                          ) : (
                            <span className={`text-[11px] px-2 py-0.5 rounded border capitalize ${roleBadgeColor}`}>
                              {u.role}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.is_active
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950/60 text-red-400 border border-red-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                            {u.is_active ? 'Activo' : 'Suspendido'}
                          </span>
                        </td>

                        <td className="p-3.5 text-[11px] font-mono text-slate-400">
                          {u.last_login_at || 'Sin registros'}
                          {u.last_login_ip && (
                            <div className="text-[10px] text-slate-500">{u.last_login_ip}</div>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          {isAdminOrSuper && u.role !== 'superadmin' && (
                            <button
                              onClick={() => onToggleUserActive(u.id)}
                              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                                u.is_active
                                  ? 'bg-red-950/40 text-red-300 hover:bg-red-900 border border-red-800/40'
                                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/40'
                              }`}
                            >
                              {u.is_active ? 'Suspender' : 'Reactivar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Formulario Público de Solicitud de Inscripción */}
      {activeTab === 'request_form' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="text-center pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center mx-auto mb-2">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-cinzel text-white">
              Solicitud de Inscripción para Acceso al Sistema
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Debido al valor histórico y patrimonial de los naufragios en Panamá, toda cuenta debe ser autorizada por el <strong>Administrador General</strong> antes de activarse.
            </p>
          </div>

          {requestSubmitted ? (
            <div className="p-6 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-slate-100 text-sm">
                ¡Solicitud Registrada Exitosamente!
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Tu solicitud ha sido remitida a la bandeja del Administrador. Una vez verificada tu afiliación académica, se te asignará el rol correspondiente (<strong>Consultor</strong> o <strong>Editor</strong>).
              </p>
              <button
                onClick={() => setActiveTab('pending')}
                className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                Ver Solicitud en la Bandeja del Administrador
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Dra. Carmen Navarro"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Correo Electrónico Institucional *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="cnavarro@up.ac.pa"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Universidad, Museo o Institución de Afiliación *
                </label>
                <input
                  type="text"
                  required
                  value={formInstitution}
                  onChange={(e) => setFormInstitution(e.target.value)}
                  placeholder="Universidad de Panamá / MiCultura / Patronato Panamá Viejo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Propósito de la Investigación o Proyecto Académico *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="Describa el objetivo de su investigación (tesis, prospección arqueológica, consulta documental paleográfica)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <strong>Nota de Seguridad:</strong> La contraseña provisional será enviada por correo electrónico una vez que el Administrador apruebe la solicitud y asigne los permisos en <code className="text-amber-300">model_has_roles</code>.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg shadow-md transition-colors"
                >
                  Enviar Solicitud al Administrador
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
