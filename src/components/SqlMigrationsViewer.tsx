import React, { useState } from 'react';
import { 
  FULL_MYSQL_SCRIPT, 
  LARAVEL_MIGRATIONS, 
  SEEDER_ROLES_PERMISSIONS, 
  SEEDER_SUPER_ADMIN,
  MigrationFile
} from '../data/sqlAndMigrations';
import { 
  Database, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  Terminal,
  FolderGit2
} from 'lucide-react';

export const SqlMigrationsViewer: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'sql' | 'migrations' | 'seeders' | 'model'>('sql');
  const [selectedMigrationIndex, setSelectedMigrationIndex] = useState<number>(0);
  const [selectedSeeder, setSelectedSeeder] = useState<'roles' | 'superadmin'>('roles');
  const [copied, setCopied] = useState<boolean>(false);

  const currentMigration = LARAVEL_MIGRATIONS[selectedMigrationIndex] || LARAVEL_MIGRATIONS[0];

  const getActiveCode = (): { title: string; filename: string; code: string; language: string } => {
    if (activeCategory === 'sql') {
      return {
        title: 'Script SQL Completo (MySQL 8.x / MariaDB 10.5+)',
        filename: 'naufragios_panama_completo.sql',
        code: FULL_MYSQL_SCRIPT,
        language: 'sql',
      };
    } else if (activeCategory === 'migrations') {
      return {
        title: `Migración Laravel #${currentMigration.order}: ${currentMigration.filename}`,
        filename: currentMigration.filename,
        code: currentMigration.code,
        language: 'php',
      };
    } else if (activeCategory === 'seeders') {
      if (selectedSeeder === 'roles') {
        return {
          title: 'Seeder: Roles y Permisos (Spatie Laravel Permission)',
          filename: 'RolesAndPermissionsSeeder.php',
          code: SEEDER_ROLES_PERMISSIONS,
          language: 'php',
        };
      } else {
        return {
          title: 'Seeder: Usuario Superadmin Inicial',
          filename: 'SuperAdminSeeder.php',
          code: SEEDER_SUPER_ADMIN,
          language: 'php',
        };
      }
    } else {
      return {
        title: 'Modelo Eloquent con Auditoría y SoftDeletes: Buque.php',
        filename: 'Buque.php',
        code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;
use OwenIt\\Auditing\\Contracts\\Auditable;

class Buque extends Model implements Auditable
{
    use SoftDeletes;
    use \\OwenIt\\Auditing\\Auditable;

    protected $table = 'buques';

    protected $fillable = [
        'nombre_buque',
        'tipo_embarcacion',
        'nacionalidad',
        'tonelaje',
        'anno_construccion',
        'puerto_origen',
        'puerto_destino',
        'propietario',
        'carga_declarada',
        'numero_tripulantes',
        'descripcion',
        'fuente_informacion',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tonelaje' => 'decimal:2',
        'numero_tripulantes' => 'integer',
        'anno_construccion' => 'integer',
    ];

    // ==========================================
    // RELACIONES 1:N SEGÚN EL ARTÍCULO TÉCNICO
    // ==========================================

    public function hundimientos()
    {
        return $this->hasMany(Hundimiento::class, 'buque_id');
    }

    public function artefactos()
    {
        return $this->hasMany(Artefacto::class, 'buque_id');
    }

    public function capitanes()
    {
        return $this->hasMany(Capitan::class, 'buque_id');
    }

    public function intervenciones()
    {
        return $this->hasMany(Intervencion::class, 'buque_id');
    }

    public function condiciones()
    {
        return $this->hasMany(CondicionAmbiental::class, 'buque_id');
    }

    public function documentacion()
    {
        return $this->hasMany(DocumentacionHistorica::class, 'buque_id');
    }

    public function eventosNauticos()
    {
        return $this->hasMany(EventoNautico::class, 'buque_id');
    }

    // Trazabilidad de creación
    public function creadoPor()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function actualizadoPor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
`,
        language: 'php',
      };
    }
  };

  const activeData = getActiveCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(activeData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeData.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-cinzel text-amber-300 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" /> Esquema MySQL 8.x & Migraciones Laravel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Estructura DDL completa, 16 migraciones estructuradas, integridad referencial con ON DELETE CASCADE/SET NULL e índices FULLTEXT
          </p>
        </div>

        {/* Top category tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveCategory('sql')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeCategory === 'sql' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Script SQL Completo
          </button>
          <button
            onClick={() => setActiveCategory('migrations')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeCategory === 'migrations' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Migraciones ({LARAVEL_MIGRATIONS.length})
          </button>
          <button
            onClick={() => setActiveCategory('seeders')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeCategory === 'seeders' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Seeders
          </button>
          <button
            onClick={() => setActiveCategory('model')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeCategory === 'model' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Modelo Eloquent
          </button>
        </div>
      </div>

      {/* Main Layout: Sub-navigation (if migrations/seeders) + Code Editor Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sub-selector for Migrations or Seeders */}
        {activeCategory === 'migrations' && (
          <div className="lg:col-span-4 space-y-2 max-h-[680px] overflow-y-auto pr-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Orden de Ejecución de Migraciones
            </div>
            {LARAVEL_MIGRATIONS.map((mig, idx) => (
              <button
                key={mig.filename}
                onClick={() => setSelectedMigrationIndex(idx)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start justify-between ${
                  selectedMigrationIndex === idx
                    ? 'bg-slate-800 border-amber-500/80 text-white shadow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div>
                  <div className="font-mono text-[11px] text-amber-300 font-semibold">
                    {mig.order}. {mig.filename.replace('.php', '')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {mig.description}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        )}

        {activeCategory === 'seeders' && (
          <div className="lg:col-span-4 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Seeders de Inicialización
            </div>
            <button
              onClick={() => setSelectedSeeder('roles')}
              className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                selectedSeeder === 'roles'
                  ? 'bg-slate-800 border-amber-500 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <div className="font-mono font-semibold text-amber-300">RolesAndPermissionsSeeder.php</div>
              <div className="text-slate-400 mt-1">Configuración de los 4 roles (superadmin, admin, editor, consultor) y 20 permisos.</div>
            </button>
            <button
              onClick={() => setSelectedSeeder('superadmin')}
              className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                selectedSeeder === 'superadmin'
                  ? 'bg-slate-800 border-amber-500 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <div className="font-mono font-semibold text-amber-300">SuperAdminSeeder.php</div>
              <div className="text-slate-400 mt-1">Usuario administrador inicial con hash bcrypt y cuenta de investigador UP.</div>
            </button>
          </div>
        )}

        {/* Code Display Area */}
        <div className={activeCategory === 'sql' || activeCategory === 'model' ? 'lg:col-span-12' : 'lg:col-span-8'}>
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[680px]">
            {/* Code Viewer Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {activeData.filename}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {activeData.language}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" /> Copiar Código
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Archivo
                </button>
              </div>
            </div>

            {/* Code Display Body with syntax scrolling */}
            <div className="flex-1 p-4 overflow-auto font-mono text-[11px] leading-relaxed text-slate-300 selection:bg-amber-500/20">
              <pre className="whitespace-pre">{activeData.code}</pre>
            </div>

            {/* Code Viewer Footer Status */}
            <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{activeData.title}</span>
              <span className="font-mono text-slate-400">
                {activeData.code.split('\n').length} líneas &middot; UTF-8
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Quick Start Snippet */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 font-mono">
          <Terminal className="w-4 h-4 text-amber-400" /> Comandos de Ejecución en Terminal Laravel
        </div>
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 space-y-1 overflow-x-auto">
          <div><span className="text-slate-500"># 1. Ejecutar las 16 migraciones estructuradas en MySQL</span></div>
          <div>php artisan migrate</div>
          <div className="pt-2"><span className="text-slate-500"># 2. Sembrar los roles, permisos (Spatie) y usuario Superadmin</span></div>
          <div>php artisan db:seed --class=RolesAndPermissionsSeeder</div>
          <div>php artisan db:seed --class=SuperAdminSeeder</div>
          <div className="pt-2"><span className="text-slate-500"># 3. Compilar los assets frontend en tiempo real</span></div>
          <div>npm run build</div>
        </div>
      </div>
    </div>
  );
};
