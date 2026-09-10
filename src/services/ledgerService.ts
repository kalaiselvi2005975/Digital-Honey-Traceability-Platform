import { storageService, KEYS } from './storageService';
import { LedgerEntry, LedgerAction } from '../models/LedgerEntry';
import { sha256 } from '../utils/hash';
import { nowISO } from '../utils/dates';
import { generateId } from '../utils/validation';

function buildPayload(entry: Omit<LedgerEntry, 'hash'>): string {
  return [
    entry.previousHash,
    entry.batchId,
    entry.timestamp,
    entry.action,
    entry.userId,
    JSON.stringify(entry.data),
  ].join('|');
}

export const ledgerService = {
  async append(
    batchId: string,
    action: LedgerAction,
    userId: string,
    data: Record<string, unknown>
  ): Promise<LedgerEntry> {
    const all = storageService.get<LedgerEntry[]>(KEYS.LEDGER) ?? [];
    const batchEntries = all.filter((e) => e.batchId === batchId);
    const previousHash =
      batchEntries.length > 0
        ? batchEntries[batchEntries.length - 1].hash
        : 'GENESIS';

    const entry: Omit<LedgerEntry, 'hash'> = {
      entryId: generateId('LEDGER'),
      batchId,
      timestamp: nowISO(),
      action,
      userId,
      data,
      previousHash,
    };

    const hash = await sha256(buildPayload(entry));
    const fullEntry: LedgerEntry = { ...entry, hash };
    all.push(fullEntry);
    storageService.set(KEYS.LEDGER, all);
    return fullEntry;
  },

  getBatchHistory(batchId: string): LedgerEntry[] {
    const all = storageService.get<LedgerEntry[]>(KEYS.LEDGER) ?? [];
    return all.filter((e) => e.batchId === batchId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },

  async verifyChain(batchId: string): Promise<{ valid: boolean; failedAt?: string }> {
    const entries = this.getBatchHistory(batchId);
    if (entries.length === 0) return { valid: true };

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const expectedPrevHash = i === 0 ? 'GENESIS' : entries[i - 1].hash;

      if (entry.previousHash !== expectedPrevHash) {
        return { valid: false, failedAt: entry.entryId };
      }

      const recomputed = await sha256(buildPayload(entry));
      if (recomputed !== entry.hash) {
        return { valid: false, failedAt: entry.entryId };
      }
    }
    return { valid: true };
  },

  getAll(): LedgerEntry[] {
    return storageService.get<LedgerEntry[]>(KEYS.LEDGER) ?? [];
  },
};
