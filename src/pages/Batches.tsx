import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, QrCode, CheckCircle, Clock } from 'lucide-react';
import { batchApi } from '../services/batchApi';
import { hiveApi } from '../services/hiveApi';
import { Batch } from '../models/Batch';
import { Hive } from '../models/Hive';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Loading } from '../components/common/Loading';
import { formatDate } from '../utils/dates';

export default function Batches() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [hives, setHives] = useState<Hive[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'complete'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [b, h] = await Promise.all([batchApi.getAll(), hiveApi.getAll()]);
      setBatches([...b].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setHives(h);
      setLoading(false);
    };
    load();
  }, []);

  const getHiveName = (hiveId: string) => hives.find(h => h.hiveId === hiveId)?.name ?? hiveId;

  const filtered = batches.filter(b => {
    const matchSearch = b.batchId.toLowerCase().includes(search.toLowerCase()) || b.hiveId.toLowerCase().includes(search.toLowerCase());
    const isComplete = b.processingStatus === 'verified' && b.packagingStatus === 'verified';
    const matchFilter = filter === 'all' ? true : filter === 'complete' ? isComplete : !isComplete;
    return matchSearch && matchFilter;
  });

  if (loading) return <Loading message="Loading batches…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-warm-900">Batches</h1>
          <p className="text-warm-500 text-sm">{batches.length} batch(es) created</p>
        </div>
        <Button icon={<Package size={16}/>} onClick={() => navigate('/beekeeper/harvests')}>New Harvest + Batch</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input type="search" placeholder="Search by Batch ID or Hive…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none text-sm" />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-warm-200">
          {(['all', 'pending', 'complete'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-honey-500 text-white' : 'bg-white text-warm-600 hover:bg-honey-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Package size={28}/>} title="No batches found" description="Record a harvest to create your first batch." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(batch => {
            const isComplete = batch.processingStatus === 'verified' && batch.packagingStatus === 'verified';
            return (
              <div key={batch.id} className="card p-5 space-y-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/beekeeper/batches/${batch.batchId}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display font-bold text-lg text-honey-700">{batch.batchId}</p>
                    <p className="text-xs text-warm-500">{getHiveName(batch.hiveId)}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    {isComplete ? <CheckCircle size={20} className="text-green-600" /> : <Clock size={20} className="text-yellow-600" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-warm-400 text-xs">Harvest Date</p><p className="font-semibold text-warm-800">{formatDate(batch.harvestDate)}</p></div>
                  <div><p className="text-warm-400 text-xs">Quantity</p><p className="font-semibold text-warm-800">{batch.quantityKg} kg</p></div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge label={`Processing: ${batch.processingStatus}`} variant={batch.processingStatus} />
                  <Badge label={`Packaging: ${batch.packagingStatus}`} variant={batch.packagingStatus} />
                </div>
                <button onClick={e => { e.stopPropagation(); navigate(`/beekeeper/batches/${batch.batchId}`); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-honey-600 hover:text-honey-700 transition-colors">
                  <QrCode size={13} /> View Batch & QR
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
