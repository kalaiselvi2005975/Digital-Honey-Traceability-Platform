import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, AlertTriangle, CheckCircle, Edit2 } from 'lucide-react';
import { hiveApi } from '../services/hiveApi';
import { harvestApi } from '../services/harvestApi';
import { Hive, HiveObservation } from '../models/Hive';
import { Harvest } from '../models/Harvest';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { formatDate, formatDateTime, todayDate } from '../utils/dates';
import { HiveTrendChart } from '../components/charts/ProductionChart';
import HiveFormModal from '../components/beekeeper/HiveForm';

export default function HiveDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hive, setHive] = useState<Hive | null>(null);
  const [observations, setObservations] = useState<HiveObservation[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showObsForm, setShowObsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<{ predicted_kg: number; confidence: string; note: string } | null>(null);
  const [health, setHealth] = useState<{ status: string; reason: string; confidence: number } | null>(null);
  const [obsForm, setObsForm] = useState({ date: todayDate(), observation: '', healthStatus: 'healthy' as HiveObservation['healthStatus'], problemDetected: false, problemDescription: '', notes: '' });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const h = await hiveApi.getById(id);
      setHive(h);
      if (h) {
        const [obs, hv, fc, hl] = await Promise.all([
          hiveApi.getObservations(h.id),
          harvestApi.getByHive(h.hiveId),
          hiveApi.getForecast(h.id),
          hiveApi.getHealth(h.id),
        ]);
        setObservations(obs);
        setHarvests(hv);
        setForecast(fc);
        setHealth(hl);
      }
    } catch {
      setHive(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAddObs = async () => {
    if (!hive) return;
    await hiveApi.addObservation(hive.id, obsForm);
    setShowObsForm(false);
    setObsForm({ date: todayDate(), observation: '', healthStatus: 'healthy', problemDetected: false, problemDescription: '', notes: '' });
    load();
  };

  if (loading) return <Loading message="Loading hive…" />;

  if (!hive) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertTriangle size={40} className="text-yellow-500" />
      <p className="text-warm-600 font-semibold">Hive not found</p>
      <Button variant="ghost" icon={<ArrowLeft size={16}/>} onClick={() => navigate('/beekeeper/hives')}>Back to Hives</Button>
    </div>
  );

  const inputClass = "w-full px-3 py-2 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none text-sm";
  const totalKg = harvests.reduce((s, h) => s + h.quantityKg, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/beekeeper/hives')} className="p-2 rounded-xl hover:bg-warm-100 text-warm-600" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-2xl text-warm-900">{hive.hiveId}</h1>
            <Badge label={hive.healthStatus.charAt(0).toUpperCase() + hive.healthStatus.slice(1)} variant={hive.healthStatus} />
          </div>
          <p className="text-warm-500 text-sm">{hive.name} · {hive.location}</p>
        </div>
        <Button size="sm" variant="outline" icon={<Edit2 size={14}/>} onClick={() => setShowEdit(true)}>Edit</Button>
      </div>

      {health && (
        <div className={`card p-4 border-l-4 ${health.status === 'critical' ? 'border-red-400 bg-red-50' : health.status === 'warning' ? 'border-yellow-400 bg-yellow-50' : 'border-green-400 bg-green-50'}`}>
          <p className="font-semibold text-sm">AI Hive Health (baseline): <span className="capitalize">{health.status}</span></p>
          <p className="text-xs mt-1 opacity-80">{health.reason}</p>
          <p className="text-xs mt-1 opacity-60">Confidence: {(health.confidence * 100).toFixed(0)}% · Prototype model</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-warm-900 mb-4">Harvest Trend</h2>
            <HiveTrendChart hiveId={hive.hiveId} harvests={harvests} />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-warm-900">Observations</h2>
              <Button size="sm" icon={<Plus size={14}/>} onClick={() => setShowObsForm(true)}>Add</Button>
            </div>
            {observations.length === 0 ? (
              <p className="text-warm-400 text-sm text-center py-4">No observations yet.</p>
            ) : observations.map(obs => (
              <div key={obs.id} className="p-4 bg-warm-50 rounded-xl mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-warm-800">{formatDate(obs.date)}</span>
                  <Badge label={obs.healthStatus} variant={obs.healthStatus} />
                </div>
                <p className="text-sm text-warm-700">{obs.observation}</p>
                {obs.problemDetected && obs.problemDescription && (
                  <p className="text-xs text-red-600 mt-1">⚠ {obs.problemDescription}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 space-y-3">
            <h2 className="font-bold text-warm-900">Hive Details</h2>
            {[
              { label: 'Queen Status', value: hive.queenStatus },
              { label: 'Health', value: hive.healthStatus },
              { label: 'Installed', value: formatDate(hive.installationDate) },
              { label: 'Last Inspection', value: formatDate(hive.lastInspection) },
              { label: 'Total Harvested', value: `${totalKg.toFixed(1)} kg` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-warm-500">{label}</span>
                <span className="font-semibold text-warm-800 capitalize">{value}</span>
              </div>
            ))}
          </div>

          {forecast && (
            <div className="card p-6">
              <h2 className="font-bold text-warm-900 mb-2">Production Forecast</h2>
              <p className="text-3xl font-bold text-honey-600">{forecast.predicted_kg} kg</p>
              <p className="text-xs text-warm-500 mt-1">Confidence: {forecast.confidence}</p>
              <p className="text-xs text-warm-400 mt-2">{forecast.note}</p>
              <p className="text-xs text-warm-300 mt-1">Baseline prototype — not scientific accuracy</p>
            </div>
          )}
        </div>
      </div>

      <HiveFormModal open={showEdit} hive={hive} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />

      <Modal open={showObsForm} onClose={() => setShowObsForm(false)} title="Add Observation"
        footer={<><Button variant="ghost" onClick={() => setShowObsForm(false)}>Cancel</Button><Button onClick={handleAddObs}>Save</Button></>}>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-warm-700">Date</label>
            <input type="date" value={obsForm.date} onChange={e => setObsForm({...obsForm, date: e.target.value})} className={inputClass} /></div>
          <div><label className="text-sm font-medium text-warm-700">Observation</label>
            <textarea value={obsForm.observation} onChange={e => setObsForm({...obsForm, observation: e.target.value})} rows={3} className={inputClass} /></div>
          <div><label className="text-sm font-medium text-warm-700">Health Status</label>
            <select value={obsForm.healthStatus} onChange={e => setObsForm({...obsForm, healthStatus: e.target.value as HiveObservation['healthStatus']})} className={inputClass}>
              <option value="healthy">Healthy</option><option value="warning">Warning</option><option value="critical">Critical</option>
            </select></div>
        </div>
      </Modal>
    </div>
  );
}
