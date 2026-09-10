import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  title?: string;
  showBack?: boolean;
}

export function Navbar({ title, showBack }: NavbarProps) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-warm-200 px-4 lg:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-warm-100 text-warm-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        {title && <h2 className="font-bold text-warm-900">{title}</h2>}
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-warm-900">{user.name}</p>
            <p className="text-xs text-warm-500 capitalize">{user.role}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-lg hover:bg-red-50 text-warm-500 hover:text-red-600 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
