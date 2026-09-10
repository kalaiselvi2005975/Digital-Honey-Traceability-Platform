import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<'BEEKEEPER' | 'CUSTOMER'>('BEEKEEPER');
  const [apiaryName, setApiaryName] = useState('');
  const [location, setLocation] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await register({
      email,
      password,
      password_confirm: passwordConfirm,
      name,
      role,
      apiary_name: role === 'BEEKEEPER' ? apiaryName : '',
      location: role === 'BEEKEEPER' ? location : '',
    });
    setLoading(false);
    if (result.success) {
      navigate(result.user?.role === 'beekeeper' ? '/beekeeper' : '/customer');
    } else {
      setError(result.error ?? 'Unable to create account.');
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none transition text-sm';

  return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 via-white to-forest-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-honey-400 to-honey-600 rounded-3xl shadow-lg mb-4">
            <span className="text-4xl">🍯</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-warm-900">Create Account</h1>
          <p className="text-warm-500 mt-1 text-sm">Join HoneyTrace to record or verify honey.</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-warm-700 mb-1">Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-warm-700 mb-1">Email</label>
              <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-warm-700 mb-1">I am a</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'BEEKEEPER' | 'CUSTOMER')} className={inputClass}>
                <option value="BEEKEEPER">Beekeeper</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
            {role === 'BEEKEEPER' && (
              <>
                <div>
                  <label htmlFor="apiary" className="block text-sm font-medium text-warm-700 mb-1">Apiary name</label>
                  <input id="apiary" value={apiaryName} onChange={(e) => setApiaryName(e.target.value)} placeholder="Madurai Honey Farm" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-warm-700 mb-1">Location</label>
                  <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Madurai, Tamil Nadu" className={inputClass} />
                </div>
              </>
            )}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-warm-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className={`${inputClass} pr-10`}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400" aria-label="Toggle password">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-password2" className="block text-sm font-medium text-warm-700 mb-1">Confirm password</label>
              <input id="reg-password2" type={showPw ? 'text' : 'password'} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required className={inputClass} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading} size="lg">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-warm-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-honey-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
