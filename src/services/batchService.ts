import { storageService, KEYS } from './storageService';
import { Batch, ProcessingStatus, PackagingStatus } from '../models/Batch';
import { Harvest } from '../models/Harvest';
import { nowISO } from '../utils/dates';
import { generateId } from '../utils/validation';
import { ledgerService } from './ledgerService';

export const batchService = {
  getAll(): Batch[] {
    return storageService.get<Batch[]>(KEYS.BATCHES) ?? [];
  },

  getById(batchId: string): Batch | null {
    return this.getAll().find((b) => b.batchId === batchId || b.id === batchId) ?? null;
  },

  async create(
    batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt' | 'qrToken' | 'processingStatus' | 'packagingStatus'>
  ): Promise<Batch> {
    const all = this.getAll();
    if (all.find((b) => b.batchId === batch.batchId)) {
      throw new Error(`Batch ID "${batch.batchId}" already exists.`);
    }

    const newBatch: Batch = {
      ...batch,
      id: generateId('BATCH'),
      processingStatus: 'pending',
      packagingStatus: 'pending',
      qrToken: batch.batchId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    all.push(newBatch);
    storageService.set(KEYS.BATCHES, all);

    await ledgerService.append(newBatch.batchId, 'BATCH_CREATED', newBatch.beekeeperId, {
      batchId: newBatch.batchId,
      hiveId: newBatch.hiveId,
      quantityKg: newBatch.quantityKg,
      harvestDate: newBatch.harvestDate,
    });

    return newBatch;
  },

  async updateProcessing(batchId: string, status: ProcessingStatus, userId: string): Promise<Batch> {
    const batch = this.getById(batchId);
    if (!batch) throw new Error('Batch not found.');
    const updated = this.update(batchId, { processingStatus: status });
    await ledgerService.append(batchId, 'PROCESSING_VERIFIED', userId, { processingStatus: status });
    return updated;
  },

  async updatePackaging(batchId: string, status: PackagingStatus, userId: string): Promise<Batch> {
    const batch = this.getById(batchId);
    if (!batch) throw new Error('Batch not found.');
    const updated = this.update(batchId, { packagingStatus: status });
    await ledgerService.append(batchId, 'PACKAGING_VERIFIED', userId, { packagingStatus: status });
    return updated;
  },

  async generateQR(batchId: string, userId: string): Promise<Batch> {
    const batch = this.getById(batchId);
    if (!batch) throw new Error('Batch not found.');
    await ledgerService.append(batchId, 'QR_GENERATED', userId, { qrToken: batch.qrToken });
    return batch;
  },

  update(batchId: string, updates: Partial<Batch>): Batch {
    const all = this.getAll();
    const idx = all.findIndex((b) => b.batchId === batchId || b.id === batchId);
    if (idx === -1) throw new Error('Batch not found.');
    all[idx] = { ...all[idx], ...updates, updatedAt: nowISO() };
    storageService.set(KEYS.BATCHES, all);
    return all[idx];
  },

  delete(batchId: string): void {
    const all = this.getAll().filter((b) => b.batchId !== batchId && b.id !== batchId);
    storageService.set(KEYS.BATCHES, all);
  },
};

export const harvestService = {
  getAll(): Harvest[] {
    return storageService.get<Harvest[]>(KEYS.HARVESTS) ?? [];
  },

  getByHive(hiveId: string): Harvest[] {
    return this.getAll().filter((h) => h.hiveId === hiveId);
  },

  async create(harvest: Omit<Harvest, 'id' | 'createdAt'>): Promise<Harvest> {
    const all = this.getAll();
    if (all.find((h) => h.batchId === harvest.batchId)) {
      throw new Error(`Batch ID "${harvest.batchId}" already has a harvest. Use a unique Batch ID.`);
    }

    const newHarvest: Harvest = {
      ...harvest,
      id: generateId('HARVEST'),
      createdAt: nowISO(),
    };
    all.push(newHarvest);
    storageService.set(KEYS.HARVESTS, all);

    await ledgerService.append(harvest.batchId, 'HARVEST_RECORDED', harvest.beekeeperId, {
      hiveId: harvest.hiveId,
      quantityKg: harvest.quantityKg,
      harvestDate: harvest.harvestDate,
    });

    return newHarvest;
  },
};
