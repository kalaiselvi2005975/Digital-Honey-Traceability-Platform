import { Hive, HiveObservation } from '../models/Hive';
import { apiRequest, unwrapList } from './api';

interface ApiHive {
  id: number;
  hive_id: string;
  name: string;
  location: string;
  installation_date: string;
  queen_status: string;
  health_status: string;
  notes: string;
  beekeeper: number;
  last_inspection?: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiObservation {
  id: number;
  hive: number;
  hive_id: string;
  date: string;
  observation: string;
  health_status: string;
  problem_detected: boolean;
  problem_description?: string;
  notes: string;
  created_by: number;
  created_at: string;
}

function mapHive(h: ApiHive): Hive {
  return {
    id: String(h.id),
    hiveId: h.hive_id,
    name: h.name,
    location: h.location,
    installationDate: h.installation_date,
    queenStatus: h.queen_status as Hive['queenStatus'],
    healthStatus: h.health_status as Hive['healthStatus'],
    lastInspection: h.last_inspection || h.updated_at.split('T')[0],
    notes: h.notes,
    beekeeperId: String(h.beekeeper),
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  };
}

function mapObservation(o: ApiObservation): HiveObservation {
  return {
    id: String(o.id),
    hiveId: o.hive_id,
    date: o.date,
    observation: o.observation,
    healthStatus: o.health_status as HiveObservation['healthStatus'],
    problemDetected: o.problem_detected,
    problemDescription: o.problem_description,
    notes: o.notes,
    createdBy: String(o.created_by),
    createdAt: o.created_at,
  };
}

export const hiveApi = {
  async getAll(): Promise<Hive[]> {
    const data = await apiRequest<ApiHive[] | { results: ApiHive[] }>('/hives/');
    return unwrapList(data).map(mapHive);
  },

  async getById(id: string): Promise<Hive | null> {
    try {
      const data = await apiRequest<ApiHive>(`/hives/${id}/`);
      return mapHive(data);
    } catch {
      const all = await this.getAll();
      return all.find((h) => h.hiveId === id) ?? null;
    }
  },

  async create(hive: Omit<Hive, 'id' | 'createdAt' | 'updatedAt' | 'lastInspection' | 'beekeeperId'>): Promise<Hive> {
    const data = await apiRequest<ApiHive>('/hives/', {
      method: 'POST',
      body: JSON.stringify({
        hive_id: hive.hiveId,
        name: hive.name,
        location: hive.location,
        installation_date: hive.installationDate,
        queen_status: hive.queenStatus,
        health_status: hive.healthStatus,
        notes: hive.notes,
      }),
    });
    return mapHive(data);
  },

  async update(id: string, updates: Partial<Hive>): Promise<Hive> {
    const body: Record<string, unknown> = {};
    if (updates.name) body.name = updates.name;
    if (updates.location) body.location = updates.location;
    if (updates.installationDate) body.installation_date = updates.installationDate;
    if (updates.queenStatus) body.queen_status = updates.queenStatus;
    if (updates.healthStatus) body.health_status = updates.healthStatus;
    if (updates.notes !== undefined) body.notes = updates.notes;
    const data = await apiRequest<ApiHive>(`/hives/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return mapHive(data);
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/hives/${id}/`, { method: 'DELETE' });
  },

  async getObservations(hiveId: string): Promise<HiveObservation[]> {
    const hive = await this.getById(hiveId);
    if (!hive) return [];
    const data = await apiRequest<ApiObservation[]>(`/hives/${hive.id}/observations/`);
    return data.map(mapObservation);
  },

  async addObservation(
    hivePk: string,
    obs: Omit<HiveObservation, 'id' | 'createdAt' | 'hiveId' | 'createdBy'>,
  ): Promise<HiveObservation> {
    const data = await apiRequest<ApiObservation>(`/hives/${hivePk}/observations/`, {
      method: 'POST',
      body: JSON.stringify({
        date: obs.date,
        observation: obs.observation,
        health_status: obs.healthStatus,
        problem_detected: obs.problemDetected,
        problem_description: obs.problemDescription || '',
        notes: obs.notes,
      }),
    });
    return mapObservation(data);
  },

  async getHealth(hivePk: string) {
    return apiRequest<{
      status: string;
      confidence: number;
      reason: string;
      model: string;
      disclaimer: string;
    }>(`/hives/${hivePk}/health/`);
  },

  async getForecast(hivePk: string) {
    return apiRequest<{
      hive_id: string;
      predicted_kg: number;
      confidence: string;
      based_on_harvests: number;
      model: string;
      note: string;
      disclaimer: string;
    }>(`/hives/${hivePk}/forecast/`);
  },
};
