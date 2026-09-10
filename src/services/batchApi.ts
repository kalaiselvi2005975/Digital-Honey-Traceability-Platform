import { Batch } from '../models/Batch';
import { LedgerEntry, LedgerAction } from '../models/LedgerEntry';
import { apiRequest, unwrapList } from './api';

interface ApiBatch {
  id: number;
  batch_id: string;
  hive: number;
  hive_id: string;
  beekeeper: number;
  beekeeper_name: string;
  apiary_name: string;
  production_location: string;
  harvest_date: string;
  quantity_kg: string;
  notes: string;
  processing_status: string;
  packaging_status: string;
  qr_token: string;
  created_at: string;
  updated_at: string;
}

interface ApiTraceEvent {
  id: number;
  batch: number;
  event_type: string;
  actor: number | null;
  actor_name?: string;
  timestamp: string;
  event_data: Record<string, unknown>;
  previous_hash: string;
  event_hash: string;
  blockchain_tx_hash: string;
  blockchain_network: string;
  blockchain_status: string;
  created_at: string;
}

export interface PublicBatchData {
  batch_id: string;
  beekeeper_name: string;
  apiary_name: string;
  production_location: string;
  hive_id: string;
  harvest_date: string;
  quantity_kg: number;
  processing_status: string;
  packaging_status: string;
  timeline: Array<{
    event_type: string;
    timestamp: string;
    blockchain_status: string;
    blockchain_tx_hash: string | null;
    event_hash: string;
    event_data: Record<string, unknown>;
  }>;
  verification: {
    valid: boolean;
    batch_id: string;
    database_chain_valid: boolean;
    blockchain_valid: boolean;
    events_verified: number;
    blockchain_status: string;
    failed_at?: string;
  };
  blockchain_transactions: Array<{
    event_type: string;
    tx_hash: string;
    network: string;
    status: string;
  }>;
}

function mapBatch(b: ApiBatch): Batch {
  return {
    id: String(b.id),
    batchId: b.batch_id,
    hiveId: b.hive_id,
    beekeeperId: String(b.beekeeper),
    productionLocation: b.production_location,
    harvestDate: b.harvest_date,
    quantityKg: parseFloat(b.quantity_kg),
    notes: b.notes,
    processingStatus: b.processing_status as Batch['processingStatus'],
    packagingStatus: b.packaging_status as Batch['packagingStatus'],
    qrToken: b.batch_id,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

function mapLedgerEvent(e: ApiTraceEvent): LedgerEntry {
  return {
    entryId: String(e.id),
    batchId: '',
    timestamp: e.timestamp,
    action: e.event_type as LedgerAction,
    userId: e.actor ? String(e.actor) : '',
    data: e.event_data,
    previousHash: e.previous_hash,
    hash: e.event_hash,
    blockchainTxHash: e.blockchain_tx_hash || undefined,
    blockchainNetwork: e.blockchain_network || undefined,
    blockchainStatus: e.blockchain_status || undefined,
  };
}

export const batchApi = {
  async getAll(): Promise<Batch[]> {
    const data = await apiRequest<ApiBatch[] | { results: ApiBatch[] }>('/batches/');
    return unwrapList(data).map(mapBatch);
  },

  async getById(batchId: string): Promise<Batch | null> {
    try {
      const data = await apiRequest<ApiBatch>(`/batches/${batchId}/`);
      return mapBatch(data);
    } catch {
      return null;
    }
  },

  async create(batch: {
    batchId: string;
    hiveId: string;
    productionLocation: string;
    harvestDate: string;
    quantityKg: number;
    notes?: string;
  }): Promise<Batch> {
    const data = await apiRequest<ApiBatch>('/batches/', {
      method: 'POST',
      body: JSON.stringify({
        batch_id: batch.batchId,
        hive_id: batch.hiveId,
        production_location: batch.productionLocation,
        harvest_date: batch.harvestDate,
        quantity_kg: batch.quantityKg,
        notes: batch.notes || '',
      }),
    });
    return mapBatch(data);
  },

  async verifyProcessing(batchId: string): Promise<Batch> {
    const data = await apiRequest<ApiBatch>(`/batches/${batchId}/processing/`, { method: 'POST' });
    return mapBatch(data);
  },

  async verifyPackaging(batchId: string): Promise<Batch> {
    const data = await apiRequest<ApiBatch>(`/batches/${batchId}/packaging/`, { method: 'POST' });
    return mapBatch(data);
  },

  async generateQR(batchId: string): Promise<{ batch: Batch; publicUrl: string }> {
    const data = await apiRequest<{ batch: ApiBatch; public_url: string }>(
      `/batches/${batchId}/qr/`,
      { method: 'POST' },
    );
    return { batch: mapBatch(data.batch), publicUrl: data.public_url };
  },

  async getHistory(batchId: string): Promise<LedgerEntry[]> {
    const data = await apiRequest<ApiTraceEvent[]>(`/batches/${batchId}/history/`);
    return data.map((e) => ({ ...mapLedgerEvent(e), batchId }));
  },

  async verify(batchId: string) {
    return apiRequest<PublicBatchData['verification']>(`/batches/${batchId}/verify/`);
  },

  async getPublic(batchId: string): Promise<PublicBatchData> {
    return apiRequest<PublicBatchData>(`/public/batches/${batchId}/`);
  },
};

export const ledgerApi = {
  getBatchHistory: (batchId: string) => batchApi.getHistory(batchId),
  verifyChain: async (batchId: string) => {
    const result = await batchApi.verify(batchId);
    return {
      valid: result.valid,
      failedAt: result.failed_at,
      databaseChainValid: result.database_chain_valid,
      blockchainValid: result.blockchain_valid,
      blockchainStatus: result.blockchain_status,
      eventsVerified: result.events_verified,
    };
  },
};
