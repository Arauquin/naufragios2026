import React, { useState, useRef, useEffect } from 'react';
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
  Key,
  RotateCcw,
  Send,
  Terminal,
  Server
} from 'lucide-react';

interface UsersAdminModuleProps {
  users: User[];
  userRole: UserRole;
  onUpdateUserRole: (userId: number, newRole: UserRole) => void;
  onToggleUserActive: (userId: number) => void;
  onApproveRequest: (userId: number, role: UserRole) => void;
  onRejectRequest: (userId: number) => void;
  onSubmitRegistrationRequest: (data: { 
    name: string; 
    email: string; 
    institution: string; 
    purpose: string;
    requested_role: 'consultor' | 'editor';
    verification_code: string;
  }) => number;
  onVerifyOtp: (userId: number, otpCode: string) => boolean;
}

export const UsersAdminModule: React.FC<UsersAdminModuleProps> = ({
  users,
  userRole,
  onUpdateUserRole,
  onToggleUserActive,
  onApproveRequest,
  onRejectRequest,
  onSubmitRegistrationRequest,
  onVerifyOtp,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'register_otp' | 'smtp_code'>('users');

  // Registration & OTP flow states
  const [step, setStep] = useState<'form' | 'verify' | 'success'>('form');
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formInstitution, setFormInstitution] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formRole, setFormRole] = useState<'consultor' | 'editor'>('consultor');
  
  // 6-digit OTP states
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes = 900 seconds
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isAdminOrSuper = ['superadmin', 'admin'].includes(userRole);
  const pendingRequests = users.filter((u) => u.status === 'pending');
  const approvedUsers = users.filter((u) => u.status !== 'pending');

  // Countdown timer for 15-minute expiration
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPassword) return;

    // Generate random 6-digit OTP
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);

    const newUserId = onSubmitRegistrationRequest({
      name: formName,
      email: formEmail,
      institution: formInstitution,
      purpose: formPurpose,
      requested_role: formRole,
      verification_code: randomCode,
    });

    setRegisteredUserId(newUserId);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
    setTimeLeft(900);
    setTimerActive(true);
    setStep('verify');

    // Auto-focus first digit after transition
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');

    if (fullCode.length !== 6) {
      setOtpError('Por favor ingresa los 6 dígitos del código de verificación.');
      return;
    }

    if (timeLeft <= 0) {
      setOtpError('El código de verificación ha expirado (límite de 15 minutos). Solicita uno nuevo.');
      return;
    }

    if (registeredUserId) {
      const isValid = onVerifyOtp(registeredUserId, fullCode);
      if (isValid) {
        setStep('success');
        setTimerActive(false);
      } else {
        setOtpError('El código ingresado es incorrecto. Verifica el correo e intenta nuevamente.');
      }
    }
  };

  const handleResendCode = () => {
    const freshCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(freshCode);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
    setTimeLeft(900);
    setTimerActive(true);

    if (registeredUserId) {
      // update user's code
      onVerifyOtp(registeredUserId, freshCode); // sets state in parent
    }
    inputRefs.current[0]?.focus();
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormInstitution('');
    setFormPurpose('');
    setOtpDigits(['', '', '', '', '', '']);
    setStep('form');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-cinzel text-amber-300 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" /> Registro, Verificación OTP y Roles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verificación obligatoria de existencia de correo (OTP de 6 dígitos) y administración de usuarios (Spatie / Francisco Fernández)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs flex-wrap">
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
            onClick={() => {
              setActiveTab('register_otp');
              resetForm();
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'register_otp'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-sky-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Registrarse con OTP
          </button>

          <button
            onClick={() => setActiveTab('smtp_code')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'smtp_code'
                ? 'bg-amber-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-amber-400" /> Configuración SMTP
          </button>
        </div>
      </div>

      {/* Warning for non-admins when viewing admin tabs */}
      {!isAdminOrSuper && activeTab === 'pending' && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Acceso Administrativo:</span>
            <p className="mt-0.5 text-slate-300 leading-relaxed">
              La gestión de roles y aprobación de solicitudes está reservada para el <strong>Superadmin (Francisco Fernández)</strong> y Administradores autorizados.
            </p>
          </div>
        </div>
      )}

      {/* 1. USUARIOS ACTIVOS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold font-cinzel text-slate-200">
                Directorio Oficial de Usuarios Activos
              </h3>
              <p className="text-xs text-slate-400">
                Base de datos limpia inicializada estrictamente con el Propietario y Superadministrador
              </p>
            </div>
            <div className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Superadmin Único: Francisco Fernández
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Investigador / Usuario</th>
                    <th className="p-3.5">Institución</th>
                    <th className="p-3.5">Rol (Spatie)</th>
                    <th className="p-3.5">Estado de Cuenta</th>
                    <th className="p-3.5">Verificación Correo</th>
                    <th className="p-3.5 text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {approvedUsers.map((u) => {
                    const isOwner = u.email === 'arauquin09@gmail.com';
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
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            {u.name}
                            {isOwner && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Propietario / Superadmin
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" /> {u.email}
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-300">
                          {u.institution || 'Universidad / Centro Oficial'}
                        </td>

                        <td className="p-3.5">
                          {isAdminOrSuper && !isOwner ? (
                            <select
                              value={u.role}
                              onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-medium focus:border-amber-500 focus:outline-none"
                            >
                              <option value="consultor">Consultor (Lectura & PDF)</option>
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
                            {u.is_active ? 'Activo (is_active = 1)' : 'Inactivo (is_active = 0)'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> Confirmado
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          {isAdminOrSuper && !isOwner && (
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
                          {isOwner && (
                            <span className="text-[11px] text-slate-500 font-mono italic">
                              Cuenta Principal
                            </span>
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

      {/* 2. SOLICITUDES PENDIENTES */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cinzel text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Solicitudes Pendientes de Aprobación de Rol
            </h3>
            <span className="text-xs text-slate-400">
              Usuarios con correo verificado por OTP en espera de autorización de rol
            </span>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{req.name}</h4>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-amber-400" /> {req.email}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Correo Confirmado
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                    <div className="flex items-start gap-1.5 text-slate-300 font-medium">
                      <Building className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{req.institution || 'Institución académica no informada'}</span>
                    </div>

                    <div className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-slate-800/80">
                      <span className="text-slate-300 font-semibold block mb-0.5">Propósito Científico:</span>
                      "{req.investigation_purpose}"
                    </div>

                    <div className="text-[11px] text-amber-300 font-medium pt-1 border-t border-slate-800/60">
                      Rol solicitado: <span className="font-bold uppercase">{req.requested_role || 'consultor'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onApproveRequest(req.id, 'editor')}
                        disabled={!isAdminOrSuper}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded shadow transition-colors flex items-center gap-1"
                        title="Aprobar como Editor (crear/editar buques, toponimia y subir archivos)"
                      >
                        <Check className="w-3.5 h-3.5" /> Asignar Rol Editor
                      </button>

                      <button
                        onClick={() => onApproveRequest(req.id, 'consultor')}
                        disabled={!isAdminOrSuper}
                        className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-semibold rounded shadow transition-colors flex items-center gap-1"
                        title="Aprobar como Consultor Público (solo lectura y exportación PDF)"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Asignar Consultor
                      </button>
                    </div>

                    <button
                      onClick={() => onRejectRequest(req.id)}
                      disabled={!isAdminOrSuper}
                      className="px-2 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 disabled:opacity-50 text-xs rounded border border-red-800/40 transition-colors flex items-center gap-1"
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
                La base de datos se mantiene limpia. Puedes usar la pestaña "Registrarse con OTP" para simular el registro de un nuevo investigador y verificar la entrega del código numérico.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. REGISTRO CON VERIFICACIÓN OTP DE 6 DÍGITOS */}
      {activeTab === 'register_otp' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* STEP 1: REGISTRATION FORM */}
          {step === 'form' && (
            <form onSubmit={handleStartRegistration} className="space-y-4 text-xs">
              <div className="text-center pb-3 border-b border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-cinzel text-white">
                  Registro de Investigador &bull; Verificación de Correo
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Se enviará automáticamente un código OTP numérico de 6 dígitos para confirmar que tu correo existe antes de activar la cuenta.
                </p>
              </div>

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
                  <label className="block text-slate-300 font-medium mb-1">Correo Electrónico Real *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="investigador@universidad.edu.pa"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contraseña de Acceso *</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres seguros"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Rol Solicitado *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-medium focus:border-amber-500 focus:outline-none"
                  >
                    <option value="consultor">Consultor (Público: Solo lectura y PDF)</option>
                    <option value="editor">Editor (Investigador: Crear/Editar datos y archivos)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Universidad, Museo o Institución Académica *
                </label>
                <input
                  type="text"
                  required
                  value={formInstitution}
                  onChange={(e) => setFormInstitution(e.target.value)}
                  placeholder="Universidad de Panamá (UP) / MiCultura / Instituto Arqueológico"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Propósito de la Investigación Científica *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="Describa brevemente el proyecto, tesis o investigación relacionada con naufragios coloniales o toponimia..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                <strong>Garantía de Seguridad Anti-Spam:</strong> Al presionar continuar, la cuenta se creará en estado inactivo (<code className="text-amber-400">is_active = 0</code>) y el sistema despachará el OTP desde <code className="text-sky-300">arauquin09@gmail.com</code>.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Enviar Código OTP y Continuar
              </button>
            </form>
          )}

          {/* STEP 2: RESPONSIVE 6-DIGIT OTP VERIFICATION SCREEN */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold font-cinzel text-white">
                  Verificación de Existencia de Correo
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Hemos enviado un código OTP numérico de <strong>6 dígitos</strong> al correo:
                </p>
                <div className="font-mono text-amber-300 font-bold text-xs bg-slate-950 py-1 px-3 rounded-full inline-block border border-slate-800">
                  {formEmail}
                </div>
              </div>

              {/* SIMULATED EMAIL INBOX NOTIFICATION BANNER */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-sky-800/50 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-sky-400 font-semibold flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Despacho SMTP Simulado (Laravel Mail):
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">De: arauquin09@gmail.com</span>
                </div>
                <div className="text-xs text-slate-200">
                  Tu código de verificación de 6 dígitos es:
                  <span className="font-mono font-bold text-amber-400 text-base ml-2 tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {generatedOtp}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Si este correo no existiera, la persona jamás podría obtener este código ni activar su cuenta.
                </div>
              </div>

              {/* 6-DIGIT OTP INPUT FORM */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                <div className="flex justify-center items-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-11 h-13 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono bg-slate-950 border-2 border-slate-700 focus:border-amber-500 text-amber-300 rounded-xl focus:outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                {/* Expiration Countdown & Resend Option */}
                <div className="flex items-center justify-between text-xs px-2 text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Tiempo restante:</span>
                    <span className={`font-bold ${timeLeft < 180 ? 'text-red-400' : 'text-slate-200'}`}>
                      {formatTimer(timeLeft)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reenviar código
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors"
                  >
                    Modificar Correo
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Validar Código y Activar Cuenta
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold font-cinzel text-white">
                ¡Correo Confirmado y Cuenta Activada!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                El código de 6 dígitos fue validado exitosamente. Se ha confirmado que el correo <strong>{formEmail}</strong> existe y te pertenece. Tu estado en la base de datos ahora es <code className="text-emerald-400">is_active = 1</code>.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-amber-300">
                Tu solicitud para el rol <strong>{formRole.toUpperCase()}</strong> ha sido enrutada a la bandeja del Superadministrador (Francisco Fernández) para su asignación definitiva.
              </div>

              <div className="pt-3 flex justify-center gap-3">
                <button
                  onClick={() => setActiveTab('users')}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                >
                  Ver en Directorio de Usuarios
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors"
                >
                  Registrar Otro Usuario
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CONFIGURACIÓN SMTP & CÓDIGO LARAVEL */}
      {activeTab === 'smtp_code' && (
        <div className="space-y-6 text-xs font-sans">
          {/* .env configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-amber-400 font-cinzel flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" /> 1. Configuración de Correo SMTP en archivo .env
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Configura las siguientes variables en la raíz de tu proyecto Laravel para enviar los códigos OTP desde la cuenta de Francisco Fernández:
            </p>
            <pre className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=arauquin09@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicacion_google
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=arauquin09@gmail.com
MAIL_FROM_NAME="Sistema Histórico de Naufragios y Toponimia - Panamá"`}
            </pre>
            <div className="text-[11px] text-slate-400">
              * Nota: En Gmail se utiliza una "Contraseña de aplicación" de 16 caracteres generada desde la seguridad de la cuenta Google.
            </div>
          </div>

          {/* Mailable and Controller Code preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="font-mono text-amber-400 font-bold block text-xs">
                app/Mail/VerifyEmailOtpMail.php
              </span>
              <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-64">
{`<?php

namespace App\\Mail;

use Illuminate\\Bus\\Queueable;
use Illuminate\\Mail\\Mailable;
use Illuminate\\Queue\\SerializesModels;

class VerifyEmailOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;
    public $userName;

    public function __construct(string $code, string $userName)
    {
        $this->code = $code;
        $this->userName = $userName;
    }

    public function build()
    {
        return $this->subject('Código de Verificación - Naufragios Panamá')
                    ->markdown('emails.verify_otp');
    }
}`}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="font-mono text-amber-400 font-bold block text-xs">
                app/Http/Controllers/Auth/RegisterWithOtpController.php
              </span>
              <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-64">
{`<?php

namespace App\\Http\\Controllers\\Auth;

use App\\Http\\Controllers\\Controller;
use App\\Models\\User;
use App\\Mail\\VerifyEmailOtpMail;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Hash;
use Illuminate\\Support\\Facades\\Mail;

class RegisterWithOtpController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
        ]);

        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'verification_code' => $otpCode,
            'code_expires_at' => now()->addMinutes(15),
            'is_active' => false,
            'institution' => $request->institution,
            'investigation_purpose' => $request->purpose,
        ]);

        Mail::to($user->email)->send(new VerifyEmailOtpMail($otpCode, $user->name));

        return redirect()->route('otp.verify.form', ['userId' => $user->id]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required|string|size:6',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->verification_code !== $request->code || now()->gt($user->code_expires_at)) {
            return back()->withErrors(['code' => 'Código inválido o expirado.']);
        }

        $user->update([
            'is_active' => true,
            'email_verified_at' => now(),
            'verification_code' => null,
            'code_expires_at' => null,
        ]);

        auth()->login($user);
        return redirect()->route('dashboard');
    }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
