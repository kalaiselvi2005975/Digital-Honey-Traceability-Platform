import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Clock, ShieldCheck, AlertTriangle,
  MapPin, Calendar, Weight, Hexagon, User as UserIcon, ArrowLeft, Shield
} from 'lucide-react';
import { batchApi, PublicBatchData } from '../services/batchApi';
import { formatDate, formatDateTime } from '../utils/dates';
import { Loading } from '../components/common/Loading';

const ACTION_ICONS: Record<string, string> = {
  FARM_MONITORED: '🏞️',
  HIVE_INSPECTED: '🔍',
  HEALTH_VERIFIED: '❤️',
  HARVEST_RECORDED: '🐝',
  BATCH_CREATED: '📦',
  PROCESSING_VERIFIED: '⚙️',
  PACKAGING_VERIFIED: '📦',
  QR_GENERATED: '🔗',
  BATCH_UPDATED: '✏️',
};

const ACTION_LABELS: Record<string, string> = {
  FARM_MONITORED: 'Apiary Environment Monitored',
  HIVE_INSPECTED: 'Hive Inspected',
  HEALTH_VERIFIED: 'Hive Health Verified',
  HARVEST_RECORDED: 'Harvest Recorded',
  BATCH_CREATED: 'Batch Created',
  PROCESSING_VERIFIED: 'Processing Verified',
  PACKAGING_VERIFIED: 'Packaging Verified',
  QR_GENERATED: 'Blockchain Recorded',
  BATCH_UPDATED: 'Record Updated',
};

export default function PublicBatch() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicBatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showLedger, setShowLedger] = useState(true);

  const load = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      const result = await batchApi.getPublic(batchId);
      setData(result);
      setNotFound(false);
    } catch {
      setNotFound(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 via-white to-forest-50 flex items-center justify-center">
      <Loading message="Loading batch information…" />
    </div>
  );

  if (notFound || !data) return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 via-white to-forest-50 flex flex-col items-center justify-center p-6 gap-4">
      <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center">
        <XCircle size={40} className="text-red-500" />
      </div>
      <h1 className="font-display font-bold text-2xl text-warm-900">Batch Not Found</h1>
      <p className="text-warm-500 text-center max-w-xs">
        We couldn't find batch <strong className="text-warm-800 font-mono">{batchId}</strong>. Please check the QR code or Batch ID on your honey bottle.
      </p>
      <button onClick={() => navigate('/customer/scan')}
        className="mt-2 bg-honey-500 hover:bg-honey-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
        Try Again
      </button>
    </div>
  );

  const verification = data.verification;
  const processingVerified = data.processing_status === 'verified';
  const packagingVerified = data.packaging_status === 'verified';
  const blockchainPending = verification.blockchain_status === 'pending';
  const blockchainVerified = verification.valid && verification.blockchain_valid && !blockchainPending;
  const blockchainFailed = verification.blockchain_status === 'failed' || (!verification.valid && !blockchainPending);

  const verifications = [
    { label: 'Harvest Recorded', done: data.timeline.some(t => t.event_type === 'HARVEST_RECORDED') },
    { label: 'Processing Verified', done: processingVerified },
    { label: 'Packaging Verified', done: packagingVerified },
    { label: 'Blockchain Verified', done: blockchainVerified, pending: blockchainPending },
  ];

  const latestTx = data.blockchain_transactions[data.blockchain_transactions.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-honey-50 via-white to-forest-50">
      <nav className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-warm-100">
        <button onClick={() => navigate('/customer/scan')} className="p-2 rounded-xl hover:bg-warm-100 text-warm-600" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">🍯</span>
          <span className="font-display font-bold text-warm-900">HoneyTrace</span>
        </div>
        <span className="text-xs font-mono bg-honey-100 text-honey-700 px-2 py-1 rounded-lg">{data.batch_id}</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-honey-500 to-honey-700 p-6 text-center">
            <div className="text-5xl mb-2">🍯</div>
            <h1 className="font-display font-bold text-2xl text-white">PURE HONEY</h1>
            <p className="text-honey-100 text-sm mt-1">Batch {data.batch_id}</p>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <div className="bg-warm-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-warm-400 text-xs mb-1"><MapPin size={11} /> Location</div>
              <p className="font-semibold text-warm-900 text-sm">{data.production_location}</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-warm-400 text-xs mb-1"><Calendar size={11} /> Harvest Date</div>
              <p className="font-semibold text-warm-900 text-sm">{formatDate(data.harvest_date)}</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-warm-400 text-xs mb-1"><Hexagon size={11} /> Hive</div>
              <p className="font-semibold text-warm-900 text-sm">{data.hive_id}</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-warm-400 text-xs mb-1"><Weight size={11} /> Quantity</div>
              <p className="font-semibold text-warm-900 text-sm">{data.quantity_kg} kg</p>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="flex items-center gap-3 bg-warm-50 rounded-xl p-3">
              <div className="w-9 h-9 bg-honey-200 rounded-full flex items-center justify-center">
                <UserIcon size={16} className="text-honey-800" />
              </div>
              <div>
                <p className="text-xs text-warm-400">Produced by</p>
                <p className="font-semibold text-warm-900 text-sm">{data.apiary_name || data.beekeeper_name}</p>
                <p className="text-xs text-warm-500">{data.beekeeper_name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-honey-600" />
            <h2 className="font-bold text-warm-900">Verification Status</h2>
          </div>
          {verifications.map(({ label, done, pending }) => (
            <div key={label} className={`flex items-center gap-3 p-3 rounded-xl ${done ? 'bg-green-50' : pending ? 'bg-yellow-50' : 'bg-warm-50'}`}>
              {done
                ? <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                : pending
                ? <Clock size={20} className="text-yellow-600 flex-shrink-0" />
                : <Clock size={20} className="text-warm-300 flex-shrink-0" />}
              <div className="flex-1">
                <p className={`text-sm font-semibold ${done ? 'text-green-800' : pending ? 'text-yellow-800' : 'text-warm-400'}`}>{label}</p>
              </div>
              {done && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">✓</span>}
              {pending && <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">⏳</span>}
            </div>
          ))}

          <div className={`p-4 rounded-xl border-2 mt-2 text-center ${
            blockchainVerified ? 'bg-green-50 border-green-300' : blockchainPending ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-200'
          }`}>
            {blockchainVerified ? (
              <>
                <ShieldCheck size={28} className="text-green-600 mx-auto mb-1" />
                <p className="font-bold text-green-800">✓ Authentic traceability record</p>
                <p className="text-xs text-green-600 mt-0.5">Database chain and blockchain proofs verified</p>
              </>
            ) : blockchainPending ? (
              <>
                <Clock size={28} className="text-yellow-600 mx-auto mb-1" />
                <p className="font-bold text-yellow-800">⏳ Blockchain confirmation pending</p>
              </>
            ) : (
              <>
                <AlertTriangle size={28} className="text-red-600 mx-auto mb-1" />
                <p className="font-bold text-red-800">⚠ Verification failed</p>
              </>
            )}
          </div>

          {latestTx?.tx_hash && (
            <div className="bg-warm-50 rounded-xl p-3 text-xs font-mono">
              <p className="text-warm-500 mb-1">Blockchain transaction</p>
              <p className="text-warm-800 break-all">{latestTx.tx_hash.slice(0, 20)}…{latestTx.tx_hash.slice(-8)}</p>
              {latestTx.network && <p className="text-warm-400 mt-1">Network: {latestTx.network}</p>}
            </div>
          )}
        </div>

        <div className="card p-5">
          <button className="w-full flex items-center justify-between mb-3" onClick={() => setShowLedger(!showLedger)}>
            <h2 className="font-bold text-warm-900">Production Timeline</h2>
            <span className="text-xs text-honey-600 font-semibold">{showLedger ? 'Hide' : `Show ${data.timeline.length} events`}</span>
          </button>

          {showLedger && (
            <div className="space-y-1">
              {data.timeline.map((entry, i) => (
                <div key={i} className="relative pl-10 pb-4 timeline-item">
                  <div className="absolute left-0 top-0 w-8 h-8 bg-honey-100 rounded-full flex items-center justify-center text-base">
                    {ACTION_ICONS[entry.event_type] ?? '📋'}
                  </div>
                  <div>
                    <p className="font-semibold text-warm-800 text-sm">{ACTION_LABELS[entry.event_type] ?? entry.event_type}</p>
                    <p className="text-xs text-warm-400">{formatDateTime(entry.timestamp)}</p>
                    {entry.blockchain_tx_hash && (
                      <p className="text-xs font-mono text-green-600 mt-1">TX: {entry.blockchain_tx_hash.slice(0, 16)}…</p>
                    )}
                    {entry.event_data?.image && typeof entry.event_data.image === 'string' && (
                      <div className="mt-2 rounded-xl overflow-hidden border-2 border-warm-100 max-w-sm">
                        <img src={entry.event_data.image} alt={ACTION_LABELS[entry.event_type]} className="w-full h-auto object-contain bg-black/5" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-warm-400">Powered by <span className="font-semibold text-honey-600">HoneyTrace</span></p>
          <p className="text-xs text-warm-300">From Hive to Bottle. Verified.</p>
        </div>
      </div>
    </div>
  );
}
