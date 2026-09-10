export type LedgerAction =
  | 'HARVEST_RECORDED'
  | 'BATCH_CREATED'
  | 'PROCESSING_VERIFIED'
  | 'PACKAGING_VERIFIED'
  | 'QR_GENERATED'
  | 'BATCH_UPDATED';

export interface LedgerEntry {
  entryId: string;
  batchId: string;
  timestamp: string;
  action: LedgerAction;
  userId: string;
  data: Record<string, unknown>;
  previousHash: string;
  hash: string;
  blockchainTxHash?: string;
  blockchainNetwork?: string;
  blockchainStatus?: string;
}
