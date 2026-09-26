import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Database, 
  Server, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle,
  HardDriveDownload,
  Terminal
} from 'lucide-react';

export const SecurityGuideModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'auth' | 'csrf' | 'xss' | 'sqli' | 'sessions' | 'backups'>('auth');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-cinzel text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> Arquitectura de Ciberseguridad & Buenas Prácticas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Directrices técnicas de endurecimiento para Laravel 10/11 + MySQL 8.x según el documento de UP-UCV
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> OWASP Top 10 Compliant
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'auth', label: '1. Bcrypt & Hashing', icon: Key },
          { id: 'csrf', label: '2. Protección CSRF', icon: Lock },
          { id: 'xss', label: '3. Prevención XSS', icon: FileCode },
          { id: 'sqli', label: '4. SQL Injection & PDO', icon: Database },
          { id: 'sessions', label: '5. Seguridad de Sesiones', icon: Server },
          { id: 'backups', label: '6. Política de Respaldos', icon: HardDriveDownload },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeSection === tab.id
                  ? 'bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
        {/* 1. Bcrypt & Hashing */}
        {activeSection === 'auth' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-cinzel text-amber-300">
              1. Hash Seguro de Contraseñas con Bcrypt (Coste 12)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Las contraseñas de los investigadores y administradores nunca se almacenan en texto plano. Se implementa el algoritmo adaptativo <strong>bcrypt</strong> con un factor de trabajo de 12 rondas mínimas, resistente a ataques de diccionario y fuerza bruta por GPUs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-semibold block">config/hashing.php</span>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-900/80 rounded">
{`'driver' => 'bcrypt',

'bcrypt' => [
    'rounds' => env('BCRYPT_ROUNDS', 12),
],`}
                </pre>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-semibold block">app/Models/User.php</span>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-900/80 rounded">
{`// Laravel 10/11 auto-hashing cast:
protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed', // Invoca bcrypt internamente
    'is_active' => 'boolean',
];`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 2. CSRF */}
        {activeSection === 'csrf' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-cinzel text-amber-300">
              2. Protección Automática contra Ataques Cross-Site Request Forgery (CSRF)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Todo formulario Blade que altere el estado de la base de datos (creación de pecios, edición de coordenadas, subida de documentos) debe incorporar la directiva <code className="text-amber-400">@csrf</code>. El middleware <code className="text-amber-300">VerifyCsrfToken</code> valida criptográficamente el token en peticiones POST, PUT, PATCH y DELETE.
            </p>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <span className="font-mono text-amber-400 font-semibold block">Vistas Blade (Ejemplo de Formulario Seguro)</span>
              <pre className="font-mono text-[11px] text-emerald-400 overflow-x-auto p-3 bg-slate-900/80 rounded">
{`{{-- Formulario de creación con token CSRF --}}
<form method="POST" action="{{ route('buques.store') }}">
    @csrf
    <input type="text" name="nombre_buque" required>
    <button type="submit">Guardar Buque</button>
</form>

{{-- Formulario para actualización PUT/PATCH --}}
<form method="POST" action="{{ route('buques.update', $buque) }}">
    @csrf
    @method('PUT')
    <input type="text" name="nombre_buque" value="{{ $buque->nombre_buque }}">
    <button type="submit">Actualizar</button>
</form>`}
              </pre>
            </div>
          </div>
        )}

        {/* 3. XSS */}
        {activeSection === 'xss' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-cinzel text-amber-300">
              3. Protección contra Cross-Site Scripting (XSS)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Las vistas Blade utilizan la sintaxis de escape automático <code className="text-amber-400">{"{{ }}"}</code>, convirtiendo caracteres como <code className="text-amber-300">&lt;script&gt;</code> en entidades HTML seguras (<code className="text-amber-300">&amp;lt;script&amp;gt;</code>). Se prohíbe el uso de <code className="text-red-400">{"{!! !!"}</code> en entradas suministradas por usuarios o investigadores sin sanitización previa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-lg space-y-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Correcto (Escapado Automático)
                </span>
                <pre className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded">
{`<td>{{ $buque->nombre_buque }}</td>
<td>{{ $buque->descripcion }}</td>`}
                </pre>
              </div>

              <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg space-y-2">
                <span className="text-red-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Incorrecto / Vulnerable
                </span>
                <pre className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded">
{`{{-- NUNCA hacer esto con entradas de usuario: --}}
<td>{!! $buque->descripcion !!}</td>`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 4. SQL Injection */}
        {activeSection === 'sqli' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-cinzel text-amber-300">
              4. Inmunidad a SQL Injection mediante Parámetros Preparados (PDO)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Laravel Eloquent ORM y el Query Builder emplean <strong>PHP Data Objects (PDO)</strong> con consultas parametrizadas de manera obligatoria. Los valores ingresados por el usuario jamás se concatenan como cadenas dentro del SQL.
            </p>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-[11px]">
              <div>
                <span className="text-emerald-400 font-semibold block mb-1">
                  // Seguro: Eloquent con enlace de parámetros
                </span>
                <div className="p-2.5 bg-slate-900 rounded text-slate-300">
                  $buques = Buque::where('nombre_buque', 'like', '%' . $request-&gt;search . '%')-&gt;get();
                </div>
              </div>

              <div>
                <span className="text-emerald-400 font-semibold block mb-1">
                  // Seguro: Query Builder nativo con binding posicional
                </span>
                <div className="p-2.5 bg-slate-900 rounded text-slate-300">
                  $buques = DB::select('SELECT * FROM buques WHERE nombre_buque LIKE ?', ['%' . $term . '%']);
                </div>
              </div>

              <div>
                <span className="text-red-400 font-semibold block mb-1">
                  // Prohibido: Concatenación directa insegura
                </span>
                <div className="p-2.5 bg-red-950/30 border border-red-900/50 rounded text-red-300">
                  DB::select('SELECT * FROM buques WHERE nombre_buque = ' . $nombre); // VULNERABLE
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Sessions */}
        {activeSection === 'sessions' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-cinzel text-amber-300">
              5. Control y Endurecimiento de Sesiones en Base de Datos
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Para garantizar que los administradores puedan revocar sesiones activas de inmediato en caso de sospecha de compromiso, se configura el driver de sesiones en la base de datos MySQL en lugar de archivos temporales en disco.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-semibold block">Variables de Entorno .env</span>
                <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded">
{`SESSION_DRIVER=database
SESSION_LIFETIME=120 # Expira tras 2 horas de inactividad
SESSION_SECURE_COOKIE=true # Obligatorio: Solo HTTPS en producción`}
                </pre>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-semibold block">config/session.php</span>
                <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded">
{`'http_only' => true, // La cookie no es accesible por JavaScript (mitiga XSS)
'same_site' => 'lax', // Mitigación adicional de CSRF
'encrypt'   => false,`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 6. Backups */}
        {activeSection === 'backups' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-cinzel text-amber-300">
              6. Estrategia y Política de Respaldos (`spatie/laravel-backup`)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Dado el valor patrimonial inestimable de los datos de naufragios coloniales de Panamá, se establece un esquema de respaldo automatizado 3-2-1 con copias de seguridad de la base de datos y los archivos del <code className="text-amber-400">storage/</code>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-amber-400 text-sm">Respaldo Diario</div>
                <div className="text-slate-300 mt-1">Base de datos + archivos adjuntos. Se conservan durante <strong>7 días</strong>.</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-amber-400 text-sm">Respaldo Semanal</div>
                <div className="text-slate-300 mt-1">Copia consolidada semanal. Se conservan durante <strong>4 semanas</strong>.</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-amber-400 text-sm">Respaldo Mensual</div>
                <div className="text-slate-300 mt-1">Archivo histórico de largo plazo. Se conservan durante <strong>12 meses</strong>.</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <span className="font-mono text-amber-400 font-semibold block">Configuración de Cron en Servidor Linux (cPanel / Crontab)</span>
              <pre className="font-mono text-[11px] text-emerald-400 bg-slate-900 p-2.5 rounded">
{`# Ejecutar respaldo integral diario a las 02:00 AM hora de Panamá
0 2 * * * cd /var/www/naufragios-app && php artisan backup:run >> /dev/null 2>&1`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Linux Directory Permissions Callout */}
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 text-xs">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" /> Permisos Obligatorios de Directorios en Linux / Servidor Web
        </h4>
        <div className="p-3 bg-slate-950 rounded-lg font-mono text-emerald-400 text-xs space-y-1">
          <div>chmod -R 755 storage/</div>
          <div>chmod -R 755 bootstrap/cache/</div>
          <div>chown -R www-data:www-data storage/ bootstrap/cache/</div>
        </div>
      </div>
    </div>
  );
};
