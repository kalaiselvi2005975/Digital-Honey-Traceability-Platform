import { Harvest } from '../models/Harvest';
import { apiRequest, unwrapList } from './api';

interface ApiHarvest {
  id: number;
  harvest_id: string;
  hive: number;
  hive_id: string;
  harvest_date: string;
  quantity_kg: string;
  batch: number | null;
  batch_id: string | null;
  notes: string;
  beekeeper: number;
  created_at: string;
}

function mapHarvest(h: ApiHarvest): Harvest {
  return {
    id: String(h.id),
    harvestDate: h.harvest_date,
    hiveId: h.hive_id,
    quantityKg: parseFloat(h.quantity_kg),
    batchId: h.batch_id || '',
    notes: h.notes,
    beekeeperId: String(h.beekeeper),
    createdAt: h.created_at,
  };
}

export const harvestApi = {
  async getAll(): Promise<Harvest[]> {
    const data = await apiRequest<ApiHarvest[] | { results: ApiHarvest[] }>('/harvests/');
    return unwrapList(data).map(mapHarvest);
  },

  async getByHive(hiveId: string): Promise<Harvest[]> {
    const all = await this.getAll();
    return all.filter((h) => h.hiveId === hiveId);
  },

  async create(payload: {
    hiveId: string;
    harvestDate: string;
    quantityKg: number;
    batchId?: string;
    notes?: string;
  }): Promise<Harvest> {
    const data = await apiRequest<ApiHarvest>('/harvests/', {
      method: 'POST',
      body: JSON.stringify({
        hive_id: payload.hiveId,
        harvest_date: payload.harvestDate,
        quantity_kg: payload.quantityKg,
        batch_id: payload.batchId,
        notes: payload.notes || '',
      }),
    });
    return mapHarvest(data);
  },
};
