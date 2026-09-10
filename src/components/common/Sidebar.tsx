import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Box, Droplets, Package, LogOut,
  Hexagon, Menu, X, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';

const BK_NAV = [
  { to: '/beekeeper', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/beekeeper/hives', label: 'Hives', icon: Hexagon },
  { to: '/beekeeper/harvests', label: 'Harvests', icon: Droplets },
  { to: '/beekeeper/batches', label: 'Batches', icon: Package },
];

export function Sidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavItems = () => (
    <>
      {BK_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => setMobileOpen(false)}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
          <ChevronRight size={14} className="ml-auto opacity-40" aria-hidden="true" />
        </NavLink>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-warm-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-honey-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">🍯</span>
          </div>
          <span className="font-display font-bold text-warm-900">HoneyTrace</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-warm-100 text-warm-700"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-warm-200 z-35 flex flex-col
        transition-transform duration-300 lg:translate-x-0 lg:z-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-warm-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-honey-400 to-honey-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-xl">🍯</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-warm-900 leading-tight">HoneyTrace</h1>
              <p className="text-xs text-warm-500">From Hive to Bottle</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-warm-100">
          <div className="bg-honey-50 rounded-xl p-3">
            <p className="text-xs text-warm-500 font-medium uppercase tracking-wide">Beekeeper</p>
            <p className="font-semibold text-warm-900 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-warm-500 truncate">{user?.apiaryName}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
          <NavItems />
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-warm-100 space-y-2">
          <NavLink to="/customer" className="sidebar-link text-warm-500">
            <Box size={18} />
            <span>Customer View</span>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-700">
            <LogOut size={18} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
