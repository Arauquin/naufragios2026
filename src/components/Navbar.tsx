import React, { useState } from 'react';
import { UserRole } from '../types/database';
import { 
  Anchor, 
  Map as MapIcon, 
  Compass, 
  Database, 
  History, 
  ShieldCheck, 
  Menu, 
  X, 
  UserCheck, 
  ChevronDown 
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'mapa' | 'buques' | 'toponimia' | 'sql' | 'auditoria' | 'seguridad';
  onSelectTab: (tab: 'mapa' | 'buques' | 'toponimia' | 'sql' | 'auditoria' | 'seguridad') => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onChangeRole,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'mapa', label: 'Mapa Interactivo', icon: MapIcon },
    { id: 'buques', label: 'Naufragios (Buques)', icon: Anchor },
    { id: 'toponimia', label: 'Toponimia', icon: Compass },
    { id: 'sql', label: 'SQL & Migraciones', icon: Database },
    { id: 'auditoria', label: 'Auditoría', icon: History },
    { id: 'seguridad', label: 'Ciberseguridad', icon: ShieldCheck },
  ] as const;

  const rolesList: { id: UserRole; label: string; desc: string }[] = [
    { id: 'superadmin', label: 'Superadmin', desc: 'Control total, auditoría, SoftDeletes y roles' },
    { id: 'admin', label: 'Admin', desc: 'Gestión completa de entidades y usuarios' },
    { id: 'editor', label: 'Editor (Investigador)', desc: 'Crear y editar registros, fotos y PDFs' },
    { id: 'consultor', label: 'Consultor (Público)', desc: 'Solo lectura, consultas y exportación a PDF' },
  ];

  const handleTabClick = (tab: typeof currentTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-[1100] bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabClick('mapa')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 flex items-center justify-center text-slate-950 shadow-md">
              <Anchor className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-sm font-bold font-cinzel text-amber-200 tracking-wide flex items-center gap-2">
                Naufragios &amp; Toponimia
                <span className="text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Panamá S. XVI-XVII
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans tracking-tight">
                UP &middot; UCV &middot; Leal Cuervo, Ortega &amp; Fernández
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Role Switcher (RBAC Simulator) */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Rol:</span>
                <span className="font-semibold text-amber-300 capitalize">{userRole}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-[1200] space-y-1">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Simular Perfil / Permisos (Spatie)
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onChangeRole(r.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                        userRole === r.id ? 'bg-amber-600/20 text-amber-300 font-semibold border border-amber-500/40' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="capitalize">{r.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-4 shadow-xl">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
              Módulos del Sistema
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role selector on Mobile */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Cambiar Rol de Usuario
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {rolesList.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onChangeRole(r.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded text-xs text-center capitalize transition-colors ${
                    userRole === r.id
                      ? 'bg-amber-600 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {r.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
