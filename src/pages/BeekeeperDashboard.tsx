import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, Droplets, Package, TrendingUp, AlertTriangle, Plus, QrCode } from 'lucide-react';
import { hiveApi } from '../services/hiveApi';
import { harvestApi } from '../services/harvestApi';
import { batchApi } from '../services/batchApi';
import { Hive } from '../models/Hive';
import { Harvest } from '../models/Harvest';
import { Batch } from '../models/Batch';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { ProductionChart } from '../components/charts/ProductionChart';
import { formatDate } from '../utils/dates';
import { useApp } from '../context/AppContext';

function StatCard({ title, value, sub, icon, color }: {
  title: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-warm-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-warm-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-warm-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function BeekeeperDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [hives, setHives] = useState<Hive[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [h, hv, b] = await Promise.all([
          hiveApi.getAll(),
          harvestApi.getAll(),
          batchApi.getAll(),
        ]);
        setHives(h);
        setHarvests(hv);
        setBatches(b);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const healthy = hives.filter((h) => h.healthStatus === 'healthy').length;
  const warning = hives.filter((h) => h.healthStatus === 'warning').length;
  const critical = hives.filter((h) => h.healthStatus === 'critical').length;
  const totalKg = harvests.reduce((s, h) => s + h.quantityKg, 0);
  const activeBatches = batches.filter(b => b.processingStatus === 'verified' || b.packagingStatus === 'verified').length;
  const recentHarvests = [...harvests].sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()).slice(0, 5);

  if (loading) return <Loading message="Loading dashboard…" />;
  if (error) return (
    <div className="card p-8 text-center">
      <p className="text-red-600 font-medium">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-warm-900">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-warm-500 text-sm mt-1">{user?.apiaryName} · {formatDate(new Date().toISOString())}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" icon={<Plus size={15} />} onClick={() => navigate('/beekeeper/hives')}>
            Add Hive
          </Button>
          <Button size="sm" variant="secondary" icon={<Droplets size={15} />} onClick={() => navigate('/beekeeper/harvests')}>
            Record Harvest
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Hives" value={hives.length}
          sub={`${healthy} healthy · ${warning} warning · ${critical} critical`}
          icon={<Hexagon size={22} className="text-honey-700" />}
          color="bg-honey-100"
        />
        <StatCard
          title="Healthy Hives" value={healthy}
          sub={`${warning} warning, ${critical} critical`}
          icon={<span className="text-2xl">🟢</span>}
          color="bg-green-100"
        />
        <StatCard
          title="Total Harvested" value={`${totalKg.toFixed(1)} kg`}
          sub={`${harvests.length} harvests recorded`}
          icon={<Droplets size={22} className="text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Active Batches" value={batches.length}
          sub={`${activeBatches} in progress`}
          icon={<Package size={22} className="text-forest-700" />}
          color="bg-forest-100"
        />
      </div>

      {/* Hive Health Row */}
      {(warning > 0 || critical > 0) && (
        <div className="card p-4 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Hive Attention Required</p>
              <p className="text-yellow-700 text-sm mt-0.5">
                {critical > 0 && `${critical} hive(s) in critical condition. `}
                {warning > 0 && `${warning} hive(s) showing warning signs.`}
              </p>
              <button onClick={() => navigate('/beekeeper/hives')} className="text-yellow-800 font-semibold text-sm underline mt-1">
                View hives →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Production Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-warm-900">Production Overview</h2>
              <p className="text-xs text-warm-400">Monthly harvest in kg</p>
            </div>
            <TrendingUp size={18} className="text-honey-500" />
          </div>
          <ProductionChart harvests={harvests} />
        </div>

        {/* Hive Health Summary */}
        <div className="card p-6">
          <h2 className="font-bold text-warm-900 mb-4">Hive Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
                <span className="text-sm text-warm-700">Healthy</span>
              </div>
              <span className="font-bold text-warm-900">{healthy}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500" aria-hidden="true" />
                <span className="text-sm text-warm-700">Warning</span>
              </div>
              <span className="font-bold text-warm-900">{warning}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
                <span className="text-sm text-warm-700">Critical</span>
              </div>
              <span className="font-bold text-warm-900">{critical}</span>
            </div>
            <div className="pt-2 border-t border-warm-100">
              {hives.filter(h => h.healthStatus !== 'healthy').map(h => (
                <div key={h.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-warm-800">{h.hiveId}</p>
                    <p className="text-xs text-warm-500">{h.name}</p>
                  </div>
                  <Badge
                    label={h.healthStatus.charAt(0).toUpperCase() + h.healthStatus.slice(1)}
                    variant={h.healthStatus}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Harvests */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-warm-900">Recent Harvests</h2>
          <button onClick={() => navigate('/beekeeper/harvests')} className="text-honey-600 text-sm font-semibold hover:text-honey-700">
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-100">
                <th className="text-left py-2 text-warm-500 font-medium">Batch ID</th>
                <th className="text-left py-2 text-warm-500 font-medium">Hive</th>
                <th className="text-left py-2 text-warm-500 font-medium">Date</th>
                <th className="text-right py-2 text-warm-500 font-medium">Quantity</th>
                <th className="text-right py-2 text-warm-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-50">
              {recentHarvests.map((h) => {
                const batch = batches.find(b => b.batchId === h.batchId);
                return (
                  <tr key={h.id} className="hover:bg-warm-50 transition-colors">
                    <td className="py-2.5 font-semibold text-honey-700">{h.batchId}</td>
                    <td className="py-2.5 text-warm-700">{h.hiveId}</td>
                    <td className="py-2.5 text-warm-600">{formatDate(h.harvestDate)}</td>
                    <td className="py-2.5 text-right font-bold text-warm-900">{h.quantityKg} kg</td>
                    <td className="py-2.5 text-right">
                      {batch && (
                        <button
                          onClick={() => navigate(`/beekeeper/batches/${batch.batchId}`)}
                          className="text-xs text-honey-600 font-semibold hover:text-honey-700 flex items-center gap-1 ml-auto"
                        >
                          <QrCode size={12} /> View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {recentHarvests.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-warm-400">No harvests recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
