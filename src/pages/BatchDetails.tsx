import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Clock, QrCode, Shield, ShieldCheck, Package,
  Droplets, AlertTriangle, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { batchApi } from '../services/batchApi';
import { hiveApi } from '../services/hiveApi';
import { ledgerApi } from '../services/ledgerApi';
import { Batch } from '../models/Batch';
import { Hive } from '../models/Hive';
import { LedgerEntry } from '../models/LedgerEntry';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { QRGenerator } from '../components/qr/QRGenerator';
import { formatDate, formatDateTime } from '../utils/dates';
import { useApp } from '../context/AppContext';

const ACTION_LABELS: Record<string, string> = {
  FARM_MONITORED: '🏞️ Farm Monitored',
  HIVE_INSPECTED: '🔍 Hive Inspected',
  HEALTH_VERIFIED: '❤️ Health Verified',
  HARVEST_RECORDED: '🍯 Harvest Recorded',
  BATCH_CREATED: '📦 Batch Created',
  PROCESSING_VERIFIED: '⚙️ Processing Verified',
  PACKAGING_VERIFIED: '📫 Packaging Verified',
  QR_GENERATED: '🔗 QR Generated',
  BATCH_UPDATED: '✏️ Batch Updated',
};

export default function BatchDetails() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [hive, setHive] = useState<Hive | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean; failedAt?: string; blockchainStatus?: string;
    blockchainValid?: boolean; databaseChainValid?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showLedger, setShowLedger] = useState(true);
  const [processingLoading, setProcessingLoading] = useState(false);
  const [packagingLoading, setPackagingLoading] = useState(false);
  const [qrGenLoading, setQrGenLoading] = useState(false);

  const load = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      const b = await batchApi.getById(batchId);
      setBatch(b);
      if (b) {
        const [h, hist, ver] = await Promise.all([
          hiveApi.getById(b.hiveId),
          ledgerApi.getBatchHistory(batchId),
          ledgerApi.verifyChain(batchId),
        ]);
        setHive(h);
        setLedger(hist);
        setVerifyResult(ver);
        if (hist.some(e => e.action === 'QR_GENERATED')) setShowQR(true);
      }
    } catch {
      setBatch(null);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => { load(); }, [load]);

  const handleVerifyProcessing = async () => {
    if (!batch) return;
    setProcessingLoading(true);
    try {
      await batchApi.verifyProcessing(batch.batchId);
      await load();
    } catch { /* handled by API */ }
    setProcessingLoading(false);
  };

  const handleVerifyPackaging = async () => {
    if (!batch) return;
    setPackagingLoading(true);
    try {
      await batchApi.verifyPackaging(batch.batchId);
      await load();
    } catch { /* handled by API */ }
    setPackagingLoading(false);
  };

  const handleGenerateQR = async () => {
    if (!batch) return;
    setQrGenLoading(true);
    try {
      await batchApi.generateQR(batch.batchId);
      setShowQR(true);
      await load();
    } catch { /* handled by API */ }
    setQrGenLoading(false);
  };

  const handleVerifyChain = async () => {
    if (!batch) return;
    setVerifying(true);
    const result = await ledgerApi.verifyChain(batch.batchId);
    setVerifyResult(result);
    setVerifying(false);
  };

  if (loading) return <Loading message="Loading batch…" />;

  if (!batch) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertTriangle size={40} className="text-yellow-500" />
      <p className="text-warm-600 font-semibold">Batch not found</p>
      <Button variant="ghost" icon={<ArrowLeft size={16}/>} onClick={() => navigate('/beekeeper/batches')}>Back to Batches</Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/beekeeper/batches')} className="p-2 rounded-xl hover:bg-warm-100 text-warm-600" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-2xl text-warm-900">{batch.batchId}</h1>
            {batch.processingStatus === 'verified' && batch.packagingStatus === 'verified'
              ? <Badge label="Complete" variant="verified" />
              : <Badge label="In Progress" variant="warning" />}
          </div>
          <p className="text-warm-500 text-sm">{hive?.name ?? batch.hiveId} · {batch.productionLocation}</p>
        </div>
        <Button size="sm" variant="ghost" icon={<ExternalLink size={14}/>}
          onClick={() => window.open(`/batch/${batch.batchId}`, '_blank')}>
          Customer View
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Batch Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-warm-900">Batch Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Produced by', value: user?.name ?? batch.beekeeperId },
                { label: 'Location', value: batch.productionLocation },
                { label: 'Hive', value: batch.hiveId },
                { label: 'Harvest Date', value: formatDate(batch.harvestDate) },
                { label: 'Quantity', value: `${batch.quantityKg} kg` },
                { label: 'Created', value: formatDate(batch.createdAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-warm-400 font-medium">{label}</p>
                  <p className="font-semibold text-warm-800 text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {batch.notes && (
              <div className="pt-3 border-t border-warm-100">
                <p className="text-xs text-warm-400 font-medium mb-1">Notes</p>
                <p className="text-sm text-warm-700">{batch.notes}</p>
              </div>
            )}
          </div>

          {/* Status & Actions */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-warm-900">Verification Status</h2>
            <div className="space-y-3">
              {/* Processing */}
              <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {batch.processingStatus === 'verified'
                    ? <CheckCircle size={20} className="text-green-600" />
                    : <Clock size={20} className="text-warm-400" />}
                  <div>
                    <p className="font-semibold text-warm-800 text-sm">Processing</p>
                    <p className="text-xs text-warm-400">Honey extraction and filtration</p>
                  </div>
                </div>
                {batch.processingStatus === 'pending' ? (
                  <Button size="sm" icon={<Droplets size={14}/>} loading={processingLoading} onClick={handleVerifyProcessing}>
                    Verify
                  </Button>
                ) : (
                  <Badge label="Verified" variant="verified" />
                )}
              </div>

              {/* Packaging */}
              <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {batch.packagingStatus === 'verified'
                    ? <CheckCircle size={20} className="text-green-600" />
                    : <Clock size={20} className="text-warm-400" />}
                  <div>
                    <p className="font-semibold text-warm-800 text-sm">Packaging</p>
                    <p className="text-xs text-warm-400">Bottling and labeling</p>
                  </div>
                </div>
                {batch.packagingStatus === 'pending' ? (
                  <Button size="sm" icon={<Package size={14}/>} loading={packagingLoading} onClick={handleVerifyPackaging}>
                    Verify
                  </Button>
                ) : (
                  <Badge label="Verified" variant="verified" />
                )}
              </div>
            </div>
          </div>

          {/* Ledger */}
          <div className="card p-6">
            <button className="w-full flex items-center justify-between" onClick={() => setShowLedger(!showLedger)}>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-honey-600" />
                <h2 className="font-bold text-warm-900">Verification History Chain</h2>
                <span className="bg-honey-100 text-honey-700 text-xs font-bold px-2 py-0.5 rounded-full">{ledger.length}</span>
              </div>
              {showLedger ? <ChevronUp size={16} className="text-warm-400" /> : <ChevronDown size={16} className="text-warm-400" />}
            </button>

            {showLedger && (
              <div className="mt-4 space-y-3">
                {/* Verify button */}
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" icon={<ShieldCheck size={14}/>} loading={verifying} onClick={handleVerifyChain}>
                    Verify Chain Integrity
                  </Button>
                  {verifyResult && (
                    <span className={`text-sm font-semibold flex items-center gap-1.5 ${verifyResult.valid ? 'text-green-700' : verifyResult.blockchainStatus === 'pending' ? 'text-yellow-700' : 'text-red-600'}`}>
                      {verifyResult.valid
                        ? <><CheckCircle size={14}/> Chain & Blockchain Verified</>
                        : verifyResult.blockchainStatus === 'pending'
                        ? <><Clock size={14}/> Blockchain confirmation pending</>
                        : <><AlertTriangle size={14}/> Verification failed{verifyResult.failedAt ? ` at ${verifyResult.failedAt}` : ''}</>}
                    </span>
                  )}
                </div>

                {/* Ledger entries */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {ledger.length === 0 ? (
                    <p className="text-warm-400 text-sm text-center py-4">No ledger entries yet.</p>
                  ) : ledger.map((entry, i) => (
                    <div key={entry.entryId} className={`p-4 rounded-xl border text-sm ${
                      verifyResult?.failedAt === entry.entryId ? 'border-red-300 bg-red-50' : 'border-warm-100 bg-warm-50'
                    }`}>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-warm-800">{ACTION_LABELS[entry.action] ?? entry.action}</p>
                          <p className="text-xs text-warm-400 mt-0.5">{formatDateTime(entry.timestamp)}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          verifyResult ? (verifyResult.valid ? 'bg-green-100 text-green-700' : (verifyResult.failedAt === entry.entryId ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')) : 'bg-honey-100 text-honey-700'
                        }`}>{i + 1}</div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-1 font-mono text-xs text-warm-500">
                        <p className="truncate">Hash: {entry.hash.slice(0, 24)}…</p>
                        {entry.blockchainTxHash && (
                          <p className="truncate text-green-700">TX: {entry.blockchainTxHash.slice(0, 20)}…</p>
                        )}
                        {entry.blockchainStatus && (
                          <p className={`truncate ${entry.blockchainStatus === 'CONFIRMED' ? 'text-green-600' : entry.blockchainStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}`}>
                            Blockchain: {entry.blockchainStatus}
                          </p>
                        )}
                        {entry.data?.image && typeof entry.data.image === 'string' && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-warm-200">
                            <img src={entry.data.image} alt={entry.action} className="w-full h-auto object-contain bg-black/5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-warm-400">
                  SHA-256 hash chain in PostgreSQL with optional EVM blockchain proof per event.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel — QR */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-warm-900 mb-4">QR Code</h2>
            {showQR ? (
              <QRGenerator batch={batch} />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 bg-warm-100 rounded-2xl flex items-center justify-center">
                  <QrCode size={48} className="text-warm-300" />
                </div>
                <Button icon={<QrCode size={16}/>} loading={qrGenLoading} onClick={handleGenerateQR} className="w-full">
                  Generate QR Code
                </Button>
                <p className="text-xs text-warm-400 text-center">Generate a QR code to allow customers to verify this batch.</p>
              </div>
            )}
          </div>

          {/* Trust Summary */}
          <div className="card p-6 space-y-3">
            <h2 className="font-bold text-warm-900">Trust Summary</h2>
            {[
              { label: 'Origin Verified', done: true },
              { label: 'Processing Verified', done: batch.processingStatus === 'verified' },
              { label: 'Packaging Verified', done: batch.packagingStatus === 'verified' },
              { label: 'Blockchain Verified', done: verifyResult?.blockchainValid === true && verifyResult?.blockchainStatus !== 'pending' },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                {done
                  ? <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                  : <Clock size={18} className="text-warm-300 flex-shrink-0" />}
                <span className={`text-sm font-medium ${done ? 'text-warm-800' : 'text-warm-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
