import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Harvest } from '../../models/Harvest';
import { harvestApi } from '../../services/harvestApi';

interface Props { hiveFilter?: string; harvests?: Harvest[] }

function buildMonthlyData(all: Harvest[]) {
  const grouped: Record<string, number> = {};
  all.forEach((h) => {
    const d = new Date(h.harvestDate);
    const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    grouped[key] = (grouped[key] ?? 0) + h.quantityKg;
  });
  return Object.entries(grouped)
    .map(([month, qty]) => ({ month, qty: parseFloat(qty.toFixed(1)) }))
    .slice(-8);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number}>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-warm-200 rounded-xl shadow-lg px-4 py-3">
        <p className="font-semibold text-warm-800 text-sm">{label}</p>
        <p className="text-honey-600 font-bold">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export function ProductionChart({ hiveFilter, harvests: harvestsProp }: Props) {
  const [harvests, setHarvests] = useState<Harvest[]>(harvestsProp || []);

  useEffect(() => {
    if (harvestsProp) {
      setHarvests(harvestsProp);
      return;
    }
    harvestApi.getAll().then(setHarvests).catch(() => setHarvests([]));
  }, [harvestsProp]);

  const data = useMemo(() => {
    const filtered = hiveFilter ? harvests.filter((h) => h.hiveId === hiveFilter) : harvests;
    return buildMonthlyData(filtered);
  }, [harvests, hiveFilter]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-warm-400 text-sm">
        No harvest data to display.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} unit=" kg" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="qty" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Harvest" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HiveTrendChart({ hiveId, harvests: harvestsProp }: { hiveId: string; harvests?: Harvest[] }) {
  const [harvests, setHarvests] = useState<Harvest[]>(harvestsProp || []);

  useEffect(() => {
    if (harvestsProp) {
      setHarvests(harvestsProp);
      return;
    }
    harvestApi.getByHive(hiveId).then(setHarvests).catch(() => setHarvests([]));
  }, [hiveId, harvestsProp]);

  const all = harvests
    .sort((a, b) => new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime())
    .map((h, i) => ({ harvest: `#${i + 1}`, qty: h.quantityKg }));

  if (all.length < 2) return <p className="text-warm-400 text-sm text-center py-4">Not enough harvest data for trend.</p>;

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={all}>
        <XAxis dataKey="harvest" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} unit=" kg" />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="qty" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
