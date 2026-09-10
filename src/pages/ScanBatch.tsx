import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, ArrowLeft, Camera, CameraOff } from 'lucide-react';
import { Button } from '../components/common/Button';
import { batchApi } from '../services/batchApi';
import { qrService } from '../services/qrService';

export default function ScanBatch() {
  const navigate = useNavigate();
  const [batchId, setBatchId] = useState('');
  const [error, setError] = useState('');
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [searching, setSearching] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstance = useRef<{ clear: () => Promise<void> } | null>(null);

  const handleManualSearch = async () => {
    const id = batchId.trim().toUpperCase();
    if (!id) { setError('Please enter a Batch ID.'); return; }
    setSearching(true);
    setError('');
    try {
      const batch = await batchApi.getPublic(id);
      if (!batch) { setError(`Batch "${id}" not found. Please check the ID and try again.`); return; }
      navigate(`/batch/${id}`);
    } catch {
      setError(`Batch "${id}" not found. Please check the ID and try again.`);
    } finally {
      setSearching(false);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setCameraMode(true);
  };

  useEffect(() => {
    if (!cameraMode || !scannerRef.current) return;

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(
          (decodedText: string) => {
            const parsed = qrService.parseBatchId(decodedText);
            if (parsed) {
              navigate(`/batch/${parsed}`);
            } else {
              setCameraError('QR code not recognized. Try manual entry.');
            }
          },
          () => { /* ignore scan errors */ }
        );
        scannerInstance.current = scanner;
      } catch {
        setCameraError('Camera not available. Please use manual entry below.');
        setCameraMode(false);
      }
    };

    initScanner();

    return () => {
      scannerInstance.current?.clear().catch(() => {});
      scannerInstance.current = null;
    };
  }, [cameraMode, navigate]);

  const DEMO_BATCHES = ['HN001', 'HN002', 'HN003', 'HN004', 'HN005', 'HN006', 'HN007', 'HN008', 'HN009', 'HN010'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 via-white to-forest-50">
      <nav className="px-6 py-4 flex items-center gap-3 bg-white/80 backdrop-blur-md border-b border-warm-100">
        <button onClick={() => navigate('/customer')} className="p-2 rounded-xl hover:bg-warm-100 text-warm-600" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🍯</span>
          <span className="font-display font-bold text-warm-900">Verify Honey</span>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-warm-900 mb-1">Scan or Enter Batch ID</h1>
          <p className="text-warm-500 text-sm">Use camera or type the batch ID from your honey bottle</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setCameraMode(false); setCameraError(''); }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${!cameraMode ? 'bg-honey-500 text-white shadow-sm' : 'bg-white border border-warm-200 text-warm-600 hover:bg-honey-50'}`}
          >
            <Search size={16} /> Manual Entry
          </button>
          <button
            onClick={startCamera}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${cameraMode ? 'bg-honey-500 text-white shadow-sm' : 'bg-white border border-warm-200 text-warm-600 hover:bg-honey-50'}`}
          >
            <Camera size={16} /> Camera Scan
          </button>
        </div>

        {cameraMode && (
          <div className="card p-4">
            <div id="qr-reader" ref={scannerRef} className="w-full" />
            {cameraError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
                <CameraOff size={16} /> {cameraError}
              </div>
            )}
          </div>
        )}

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <QrCode size={18} className="text-honey-600" />
            <h2 className="font-bold text-warm-900">Enter Batch ID</h2>
          </div>
          <div>
            <input
              id="batch-id-input"
              type="text"
              value={batchId}
              onChange={e => { setBatchId(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
              placeholder="e.g. HN001"
              className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none text-sm font-mono text-center text-lg tracking-widest"
              aria-label="Batch ID"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm" role="alert">{error}</div>
          )}
          <Button className="w-full" size="lg" icon={<Search size={18}/>} loading={searching} onClick={handleManualSearch}>
            Verify Batch
          </Button>
        </div>

        <div className="card p-5">
          <p className="text-xs text-warm-500 font-semibold uppercase tracking-wide mb-3">
            Demo Batch IDs (click to verify)
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_BATCHES.map(id => (
              <button
                key={id}
                onClick={() => navigate(`/batch/${id}`)}
                className="px-3 py-1.5 bg-honey-50 hover:bg-honey-100 border border-honey-200 text-honey-700 text-xs font-bold rounded-lg transition-colors font-mono"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-warm-400">
          Find the Batch ID printed on your honey bottle label or scan the QR code.
        </p>
      </div>
    </div>
  );
}
