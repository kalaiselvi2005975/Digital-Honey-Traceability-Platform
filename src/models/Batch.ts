export type ProcessingStatus = 'pending' | 'verified';
export type PackagingStatus = 'pending' | 'verified';

export interface Batch {
  id: string;
  batchId: string;
  hiveId: string;
  beekeeperId: string;
  productionLocation: string;
  harvestDate: string;
  quantityKg: number;
  notes: string;
  processingStatus: ProcessingStatus;
  packagingStatus: PackagingStatus;
  qrToken: string;
  createdAt: string;
  updatedAt: string;
}
