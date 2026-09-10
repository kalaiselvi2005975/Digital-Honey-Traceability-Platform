import { storageService, KEYS } from './storageService';
import { Hive, HiveObservation, HiveHealthStatus } from '../models/Hive';
import { nowISO } from '../utils/dates';
import { generateId } from '../utils/validation';

export const hiveService = {
  getAll(): Hive[] {
    return storageService.get<Hive[]>(KEYS.HIVES) ?? [];
  },

  getById(id: string): Hive | null {
    return this.getAll().find((h) => h.id === id || h.hiveId === id) ?? null;
  },

  create(hive: Omit<Hive, 'id' | 'createdAt' | 'updatedAt'>): Hive {
    const all = this.getAll();
    const existing = all.find((h) => h.hiveId === hive.hiveId);
    if (existing) throw new Error(`Hive ID "${hive.hiveId}" already exists.`);

    const newHive: Hive = {
      ...hive,
      id: generateId('HIVE'),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    all.push(newHive);
    storageService.set(KEYS.HIVES, all);
    return newHive;
  },

  update(id: string, updates: Partial<Hive>): Hive {
    const all = this.getAll();
    const idx = all.findIndex((h) => h.id === id || h.hiveId === id);
    if (idx === -1) throw new Error('Hive not found.');
    all[idx] = { ...all[idx], ...updates, updatedAt: nowISO() };
    storageService.set(KEYS.HIVES, all);
    return all[idx];
  },

  delete(id: string): void {
    const all = this.getAll().filter((h) => h.id !== id && h.hiveId !== id);
    storageService.set(KEYS.HIVES, all);
  },

  // Observations
  getObservations(hiveId: string): HiveObservation[] {
    const all = storageService.get<HiveObservation[]>(KEYS.OBSERVATIONS) ?? [];
    return all
      .filter((o) => o.hiveId === hiveId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addObservation(obs: Omit<HiveObservation, 'id' | 'createdAt'>): HiveObservation {
    const all = storageService.get<HiveObservation[]>(KEYS.OBSERVATIONS) ?? [];
    const newObs: HiveObservation = {
      ...obs,
      id: generateId('OBS'),
      createdAt: nowISO(),
    };
    all.push(newObs);
    storageService.set(KEYS.OBSERVATIONS, all);

    // Update hive health based on latest observation
    this.update(obs.hiveId, { healthStatus: obs.healthStatus, lastInspection: obs.date });
    return newObs;
  },

  computeHealth(hiveId: string): HiveHealthStatus {
    const obs = this.getObservations(hiveId);
    if (obs.length === 0) return 'healthy';
    const recent = obs.slice(0, 3);
    const criticalCount = recent.filter((o) => o.healthStatus === 'critical').length;
    const warningCount = recent.filter((o) => o.healthStatus === 'warning').length;
    if (criticalCount >= 2) return 'critical';
    if (criticalCount >= 1 || warningCount >= 2) return 'warning';
    if (warningCount >= 1) return 'warning';
    return 'healthy';
  },
};
