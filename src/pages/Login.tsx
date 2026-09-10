import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Eye, EyeOff, Hexagon, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.user?.role === 'beekeeper' ? '/beekeeper' : '/customer');
    } else {
      setError(result.error ?? 'Login failed');
    }
  };

  const quickLogin = async (role: 'beekeeper' | 'customer') => {
    setLoading(true);
    const creds = role === 'beekeeper'
      ? { email: 'beekeeper@demo.com', password: 'beekeeper123' }
      : { email: 'customer@demo.com', password: 'customer123' };
    setEmail(creds.email);
    setPassword(creds.password);
    const result = await login(creds.email, creds.password);
    setLoading(false);
    if (result.success) navigate(role === 'beekeeper' ? '/beekeeper' : '/customer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 via-white to-forest-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-honey-400 to-honey-600 rounded-3xl shadow-lg mb-4 animate-pulse-glow">
            <span className="text-4xl">🍯</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-warm-900">HoneyTrace</h1>
          <p className="text-warm-500 mt-1 text-sm">From Hive to Bottle. Verified.</p>
        </div>

        {/* Demo quick-access cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => quickLogin('beekeeper')}
            disabled={loading}
            className="bg-white rounded-2xl p-4 border-2 border-honey-200 hover:border-honey-400 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 bg-honey-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-honey-200 transition-colors">
              <Hexagon size={20} className="text-honey-700" />
            </div>
            <p className="font-bold text-sm text-warm-900">Beekeeper</p>
            <p className="text-xs text-warm-500">Manage hives & batches</p>
          </button>
          <button
            onClick={() => quickLogin('customer')}
            disabled={loading}
            className="bg-white rounded-2xl p-4 border-2 border-forest-200 hover:border-forest-400 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-forest-200 transition-colors">
              <ShieldCheck size={20} className="text-forest-700" />
            </div>
            <p className="font-bold text-sm text-warm-900">Customer</p>
            <p className="text-xs text-warm-500">Verify honey origin</p>
          </button>
        </div>

        {/* Login form */}
        <div className="card p-6">
          <h2 className="font-bold text-lg text-warm-900 mb-4">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-warm-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beekeeper@demo.com"
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none transition text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none transition text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-warm-600 mt-4">
            New to HoneyTrace?{' '}
            <Link to="/register" className="text-honey-700 font-semibold hover:underline">Create an account</Link>
          </p>

          <div className="mt-4 p-3 bg-honey-50 rounded-xl text-xs text-warm-600">
            <p className="font-semibold text-warm-700 mb-1">Demo Credentials:</p>
            <p>🐝 Beekeeper: <code>beekeeper@demo.com</code> / <code>beekeeper123</code></p>
            <p>👤 Customer: <code>customer@demo.com</code> / <code>customer123</code></p>
          </div>
        </div>

        <p className="text-center text-xs text-warm-400 mt-4">
          SIH 2026 — Problem Statement 26021
        </p>
      </div>
    </div>
  );
}
