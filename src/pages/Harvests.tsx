import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Droplets, Search } from 'lucide-react';
import { harvestApi } from '../services/harvestApi';
import { hiveApi } from '../services/hiveApi';
import { Harvest } from '../models/Harvest';
import { Hive } from '../models/Hive';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { formatDate, todayDate } from '../utils/dates';

export default function Harvests() {
  const navigate = useNavigate();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [hives, setHives] = useState<Hive[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    harvestDate: todayDate(), hiveId: '', quantityKg: '', batchId: '', notes: '',
  });

  const nextBatchId = () => `HN${Date.now().toString().slice(-6)}`;

  const load = async () => {
    setLoading(true);
    try {
      const [hv, h] = await Promise.all([harvestApi.getAll(), hiveApi.getAll()]);
      setHarvests([...hv].sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()));
      setHives(h);
      setForm((prev) => ({
        ...prev,
        hiveId: prev.hiveId || h[0]?.hiveId || '',
        batchId: prev.batchId || nextBatchId(),
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load harvests.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = harvests.filter(h =>
    (h.batchId || '').toLowerCase().includes(search.toLowerCase()) ||
    h.hiveId.toLowerCase().includes(search.toLowerCase())
  );

  const totalKg = harvests.reduce((s, h) => s + h.quantityKg, 0);

  const handleSave = async () => {
    setError('');
    if (!form.hiveId) { setError('Please select a hive.'); return; }
    const qty = parseFloat(form.quantityKg);
    if (!qty || qty <= 0) { setError('Quantity must be greater than 0.'); return; }
    if (!form.batchId.trim()) { setError('Batch ID is required.'); return; }

    setSaving(true);
    try {
      const harvest = await harvestApi.create({
        harvestDate: form.harvestDate,
        hiveId: form.hiveId,
        quantityKg: qty,
        batchId: form.batchId.trim().toUpperCase(),
        notes: form.notes,
      });
      setShowForm(false);
      setForm({ harvestDate: todayDate(), hiveId: '', quantityKg: '', batchId: '', notes: '' });
      await load();
      navigate(`/beekeeper/batches/${harvest.batchId || form.batchId.trim().toUpperCase()}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to save harvest. Please check the quantity and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading harvests…" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-warm-900">Harvests</h1>
          <p className="text-warm-500 text-sm">{harvests.length} harvest(s) · {totalKg.toFixed(1)} kg total</p>
        </div>
        <Button icon={<Plus size={16}/>} onClick={() => {
          setError('');
          setForm((prev) => ({
            ...prev,
            hiveId: prev.hiveId || hives[0]?.hiveId || '',
            batchId: prev.batchId || nextBatchId(),
            quantityKg: prev.quantityKg || '12',
          }));
          setShowForm(true);
        }}>Record Harvest</Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
        <input type="search" placeholder="Search by Batch ID or Hive…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none text-sm" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Droplets size={28}/>} title="No harvests found" description="Record your first harvest to create a traceable batch." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-warm-50 border-b border-warm-100">
              <tr>
                <th className="text-left p-3 text-warm-500 font-medium">Batch ID</th>
                <th className="text-left p-3 text-warm-500 font-medium">Hive</th>
                <th className="text-left p-3 text-warm-500 font-medium">Date</th>
                <th className="text-right p-3 text-warm-500 font-medium">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-50">
              {filtered.map(h => (
                <tr key={h.id} className="hover:bg-warm-50 cursor-pointer" onClick={() => h.batchId && navigate(`/beekeeper/batches/${h.batchId}`)}>
                  <td className="p-3 font-semibold text-honey-700">{h.batchId || '—'}</td>
                  <td className="p-3 text-warm-700">{h.hiveId}</td>
                  <td className="p-3 text-warm-600">{formatDate(h.harvestDate)}</td>
                  <td className="p-3 text-right font-bold">{h.quantityKg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Harvest"
        footer={<><Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}>Save Harvest</Button></>}>
        {error && <p className="text-red-600 text-sm mb-3" role="alert">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-warm-700">Hive *</label>
            {hives.length === 0 ? (
              <p className="text-sm text-warm-600 mt-1">
                No hives yet. Go to <button type="button" className="text-honey-700 font-semibold underline" onClick={() => navigate('/beekeeper/hives')}>Hives</button> and click Add Hive, then come back.
              </p>
            ) : (
              <select value={form.hiveId} onChange={e => setForm({...form, hiveId: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm">
                {hives.map(h => <option key={h.id} value={h.hiveId}>{h.hiveId} — {h.name}</option>)}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium text-warm-700">Date *</label>
              <input type="date" value={form.harvestDate} onChange={e => setForm({...form, harvestDate: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm" /></div>
            <div><label className="text-sm font-medium text-warm-700">Quantity (kg) *</label>
              <input type="number" step="0.1" min="0.1" value={form.quantityKg} onChange={e => setForm({...form, quantityKg: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm" /></div>
          </div>
          <div><label className="text-sm font-medium text-warm-700">Batch ID *</label>
            <input value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} placeholder="HN001"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm uppercase" /></div>
          <div><label className="text-sm font-medium text-warm-700">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm resize-none" /></div>
        </div>
      </Modal>
    </div>
  );
}
