import { useNavigate } from 'react-router-dom';
import { QrCode, Search, ShieldCheck, Hexagon, Package } from 'lucide-react';
import { Button } from '../components/common/Button';

export default function CustomerHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 via-white to-forest-50">
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-warm-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-honey-400 to-honey-600 rounded-lg flex items-center justify-center">
            <span className="text-base">🍯</span>
          </div>
          <span className="font-display font-bold text-warm-900">HoneyTrace</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>Beekeeper Login</Button>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-honey-100 text-honey-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <ShieldCheck size={13} /> Tamper-evident honey traceability
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-warm-900 leading-tight mb-4">
          Verify Your<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-honey-500 to-honey-700">Pure Honey</span>
        </h1>
        <p className="text-warm-600 text-lg mb-10 max-w-xl mx-auto">
          Scan the QR code on your honey bottle to discover exactly where it came from, who produced it, and verify its complete history.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" icon={<QrCode size={20}/>} onClick={() => navigate('/customer/scan')}>
            Scan QR Code
          </Button>
          <Button size="lg" variant="outline" icon={<Search size={20}/>} onClick={() => navigate('/customer/scan')}>
            Enter Batch ID
          </Button>
        </div>
      </div>

      {/* Trust features */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: <Hexagon size={24} className="text-honey-600" />, title: 'Hive-to-Bottle', desc: 'Track every batch from the specific hive it came from to the bottle in your hand.' },
            { icon: <ShieldCheck size={24} className="text-forest-600" />, title: 'Ledger Verified', desc: 'Every step — harvest, processing, packaging — is recorded in a tamper-evident ledger.' },
            { icon: <Package size={24} className="text-blue-600" />, title: 'Full Transparency', desc: 'View the complete chain of custody including dates, quantities, and beekeeper details.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card p-6 text-center">
              <div className="w-12 h-12 bg-warm-100 rounded-2xl flex items-center justify-center mx-auto mb-3">{icon}</div>
              <h3 className="font-bold text-warm-900 mb-1">{title}</h3>
              <p className="text-warm-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-warm-400 mt-6">
          SIH 2026 · Problem Statement 26021 · Honey Traceability Platform
        </p>
      </div>
    </div>
  );
}
