import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, Hexagon } from 'lucide-react';
import { hiveApi } from '../services/hiveApi';
import { Hive } from '../models/Hive';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Loading } from '../components/common/Loading';
import { ConfirmModal } from '../components/common/Modal';
import { formatDate } from '../utils/dates';
import HiveFormModal from '../components/beekeeper/HiveForm';

export default function Hives() {
  const navigate = useNavigate();
  const [hives, setHives] = useState<Hive[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editHive, setEditHive] = useState<Hive | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hive | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setHives(await hiveApi.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load hives.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = hives.filter(
    (h) =>
      h.hiveId.toLowerCase().includes(search.toLowerCase()) ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await hiveApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to delete hive.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-warm-900">Hives</h1>
          <p className="text-warm-500 text-sm">{hives.length} hive(s) registered</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setEditHive(null); setShowForm(true); }}>
          Add Hive
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
        <input
          type="search"
          placeholder="Search by Hive ID, name, or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 focus:border-honey-400 focus:ring-2 focus:ring-honey-100 outline-none text-sm"
        />
      </div>

      {loading ? (
        <Loading message="Loading hives…" />
      ) : error ? (
        <div className="card p-6 text-center text-red-600">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Hexagon size={28} />}
          title={search ? 'No hives match your search' : 'No hives yet'}
          description={search ? 'Try different keywords.' : 'Add your first hive to get started.'}
          action={!search && <Button icon={<Plus size={16} />} onClick={() => setShowForm(true)}>Add First Hive</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((hive) => (
            <div key={hive.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-bold text-honey-700">{hive.hiveId}</span>
                    <Badge
                      label={hive.healthStatus.charAt(0).toUpperCase() + hive.healthStatus.slice(1)}
                      variant={hive.healthStatus}
                    />
                  </div>
                  <p className="font-semibold text-warm-900 text-sm">{hive.name}</p>
                </div>
                <div className="w-10 h-10 bg-honey-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Hexagon size={20} className="text-honey-700" />
                </div>
              </div>

              <div className="space-y-1 text-sm text-warm-600">
                <p>📍 {hive.location}</p>
                <p>👑 Queen: <span className="font-medium capitalize">{hive.queenStatus}</span></p>
                <p>🔍 Last Inspection: <span className="font-medium">{formatDate(hive.lastInspection)}</span></p>
              </div>

              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => navigate(`/beekeeper/hives/${hive.id}`)}>
                  View
                </Button>
                <Button size="sm" variant="outline" icon={<Edit2 size={14} />} onClick={() => { setEditHive(hive); setShowForm(true); }}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => setDeleteTarget(hive)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <HiveFormModal
        open={showForm}
        hive={editHive}
        onClose={() => setShowForm(false)}
        onSaved={() => { setShowForm(false); load(); }}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Hive"
        message={`Are you sure you want to delete hive "${deleteTarget?.hiveId} — ${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}
