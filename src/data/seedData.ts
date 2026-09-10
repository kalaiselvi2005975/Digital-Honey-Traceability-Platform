import { storageService, KEYS } from '../services/storageService';
import { User } from '../models/User';
import { Hive, HiveObservation } from '../models/Hive';
import { Harvest } from '../models/Harvest';
import { Batch } from '../models/Batch';
import { LedgerEntry } from '../models/LedgerEntry';
import { sha256 } from '../utils/hash';

const BK_ID = 'USER-BK-001';
const BK2_ID = 'USER-BK-002';

const USERS: User[] = [
  {
    id: BK_ID,
    email: 'beekeeper@demo.com',
    name: 'Arjun Krishnamurthy',
    role: 'beekeeper',
    apiaryName: 'Madurai Honey Farm',
    location: 'Madurai, Tamil Nadu',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: BK2_ID,
    email: 'customer@demo.com',
    name: 'Priya Nair',
    role: 'customer',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const HIVES: Hive[] = [
  {
    id: 'h1', hiveId: 'H-001', name: 'North Field Alpha',
    location: 'North Field, Madurai', installationDate: '2025-03-15',
    queenStatus: 'active', healthStatus: 'healthy', lastInspection: '2026-08-24',
    notes: 'High-performing hive. Consistent yield.', beekeeperId: BK_ID,
    createdAt: '2025-03-15T00:00:00Z', updatedAt: '2026-08-24T00:00:00Z',
  },
  {
    id: 'h2', hiveId: 'H-002', name: 'South Grove Beta',
    location: 'South Grove, Madurai', installationDate: '2025-04-10',
    queenStatus: 'active', healthStatus: 'healthy', lastInspection: '2026-08-22',
    notes: 'Excellent honey production near jasmine grove.', beekeeperId: BK_ID,
    createdAt: '2025-04-10T00:00:00Z', updatedAt: '2026-08-22T00:00:00Z',
  },
  {
    id: 'h3', hiveId: 'H-003', name: 'East Meadow Gamma',
    location: 'East Meadow, Madurai', installationDate: '2025-05-01',
    queenStatus: 'active', healthStatus: 'healthy', lastInspection: '2026-08-20',
    notes: 'Stable colony near sunflower fields.', beekeeperId: BK_ID,
    createdAt: '2025-05-01T00:00:00Z', updatedAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'h4', hiveId: 'H-004', name: 'West Garden Delta',
    location: 'West Garden, Madurai', installationDate: '2025-06-15',
    queenStatus: 'active', healthStatus: 'healthy', lastInspection: '2026-08-18',
    notes: 'Young colony showing good signs.', beekeeperId: BK_ID,
    createdAt: '2025-06-15T00:00:00Z', updatedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'h5', hiveId: 'H-005', name: 'Central Orchard Epsilon',
    location: 'Central Orchard, Madurai', installationDate: '2025-02-20',
    queenStatus: 'active', healthStatus: 'healthy', lastInspection: '2026-08-25',
    notes: 'Oldest hive. Very productive.', beekeeperId: BK_ID,
    createdAt: '2025-02-20T00:00:00Z', updatedAt: '2026-08-25T00:00:00Z',
  },
  {
    id: 'h6', hiveId: 'H-006', name: 'River Bank Zeta',
    location: 'River Bank, Dindigul', installationDate: '2025-07-01',
    queenStatus: 'weak', healthStatus: 'warning', lastInspection: '2026-08-23',
    notes: 'Queen showing signs of weakness.', beekeeperId: BK_ID,
    createdAt: '2025-07-01T00:00:00Z', updatedAt: '2026-08-23T00:00:00Z',
  },
  {
    id: 'h7', hiveId: 'H-007', name: 'Hilltop Eta',
    location: 'Hilltop Farm, Theni', installationDate: '2025-08-01',
    queenStatus: 'unknown', healthStatus: 'critical', lastInspection: '2026-08-21',
    notes: 'Reduced bee activity. Requires urgent inspection.', beekeeperId: BK_ID,
    createdAt: '2025-08-01T00:00:00Z', updatedAt: '2026-08-21T00:00:00Z',
  },
  {
    id: 'h8', hiveId: 'H-008', name: 'Coconut Grove Theta',
    location: 'Coconut Grove, Virudhunagar', installationDate: '2025-09-10',
    queenStatus: 'active', healthStatus: 'healthy', lastInspection: '2026-08-20',
    notes: 'New hive in coconut grove. Promising start.', beekeeperId: BK_ID,
    createdAt: '2025-09-10T00:00:00Z', updatedAt: '2026-08-20T00:00:00Z',
  },
];

const OBSERVATIONS: HiveObservation[] = [
  {
    id: 'obs1', hiveId: 'H-001', date: '2026-08-24',
    observation: 'Normal activity. Bees very active. Good honey stores visible.',
    healthStatus: 'healthy', problemDetected: false,
    notes: 'Morning inspection. All frames healthy.', createdBy: BK_ID, createdAt: '2026-08-24T09:00:00Z',
  },
  {
    id: 'obs2', hiveId: 'H-006', date: '2026-08-23',
    observation: 'Queen activity reduced. Fewer eggs visible in lower frames.',
    healthStatus: 'warning', problemDetected: true,
    problemDescription: 'Queen laying rate reduced', notes: 'Plan follow-up inspection in 5 days.',
    createdBy: BK_ID, createdAt: '2026-08-23T10:00:00Z',
  },
  {
    id: 'obs3', hiveId: 'H-007', date: '2026-08-21',
    observation: 'Very low bee activity. Only about 30% of normal population visible.',
    healthStatus: 'critical', problemDetected: true,
    problemDescription: 'Severely reduced bee activity — possible colony collapse or disease',
    notes: 'Urgent: Need pesticide and mite inspection.', createdBy: BK_ID, createdAt: '2026-08-21T08:00:00Z',
  },
  {
    id: 'obs4', hiveId: 'H-007', date: '2026-08-15',
    observation: 'Reduced activity noticed. Some mite presence on bottom board.',
    healthStatus: 'warning', problemDetected: true,
    problemDescription: 'Varroa mite presence detected', notes: 'Applied oxalic acid treatment.',
    createdBy: BK_ID, createdAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'obs5', hiveId: 'H-002', date: '2026-08-22',
    observation: 'Excellent activity. Nectar flow from jasmine very high.',
    healthStatus: 'healthy', problemDetected: false,
    notes: 'Plan harvest in next 2 weeks.', createdBy: BK_ID, createdAt: '2026-08-22T09:30:00Z',
  },
];

const HARVESTS: Harvest[] = [
  {
    id: 'hv1', harvestDate: '2026-08-25', hiveId: 'H-001', quantityKg: 18.5,
    batchId: 'HB-2026-001', notes: 'Premium quality. Light amber color. Jasmine fragrance.', beekeeperId: BK_ID, createdAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'hv2', harvestDate: '2026-08-20', hiveId: 'H-002', quantityKg: 22.0,
    batchId: 'HB-2026-002', notes: 'Excellent batch from jasmine grove. Very sweet.', beekeeperId: BK_ID, createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'hv3', harvestDate: '2026-08-15', hiveId: 'H-003', quantityKg: 16.5,
    batchId: 'HB-2026-003', notes: 'Sunflower honey. Bright yellow color.', beekeeperId: BK_ID, createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'hv4', harvestDate: '2026-08-10', hiveId: 'H-005', quantityKg: 25.0,
    batchId: 'HB-2026-004', notes: 'Best batch of the season. Rich dark amber.', beekeeperId: BK_ID, createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'hv5', harvestDate: '2026-07-25', hiveId: 'H-001', quantityKg: 15.0,
    batchId: 'HB-2026-005', notes: 'Mango blossom honey. Unique flavor.', beekeeperId: BK_ID, createdAt: '2026-07-25T10:00:00Z',
  },
  {
    id: 'hv6', harvestDate: '2026-07-10', hiveId: 'H-002', quantityKg: 19.5,
    batchId: 'HB-2026-006', notes: 'Mixed wildflower. Good quality.', beekeeperId: BK_ID, createdAt: '2026-07-10T10:00:00Z',
  },
  {
    id: 'hv7', harvestDate: '2026-06-20', hiveId: 'H-003', quantityKg: 14.0,
    batchId: 'HB-2026-007', notes: 'Early season harvest.', beekeeperId: BK_ID, createdAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 'hv8', harvestDate: '2026-06-05', hiveId: 'H-005', quantityKg: 20.0,
    batchId: 'HB-2026-008', notes: 'Strong colony. Consistent producer.', beekeeperId: BK_ID, createdAt: '2026-06-05T10:00:00Z',
  },
  {
    id: 'hv9', harvestDate: '2026-05-15', hiveId: 'H-001', quantityKg: 12.5,
    batchId: 'HB-2026-009', notes: 'Spring harvest. Light floral notes.', beekeeperId: BK_ID, createdAt: '2026-05-15T10:00:00Z',
  },
  {
    id: 'hv10', harvestDate: '2026-04-20', hiveId: 'H-004', quantityKg: 10.0,
    batchId: 'HB-2026-010', notes: 'New hive first harvest. Good yield.', beekeeperId: BK_ID, createdAt: '2026-04-20T10:00:00Z',
  },
];

const BATCHES: Batch[] = [
  {
    id: 'b1', batchId: 'HB-2026-001', hiveId: 'H-001', beekeeperId: BK_ID,
    productionLocation: 'Madurai, Tamil Nadu', harvestDate: '2026-08-25',
    quantityKg: 18.5, notes: 'Premium quality jasmine honey. Light amber.',
    processingStatus: 'verified', packagingStatus: 'verified',
    qrToken: 'HB-2026-001', createdAt: '2026-08-25T10:00:00Z', updatedAt: '2026-08-27T10:00:00Z',
  },
  {
    id: 'b2', batchId: 'HB-2026-002', hiveId: 'H-002', beekeeperId: BK_ID,
    productionLocation: 'Madurai, Tamil Nadu', harvestDate: '2026-08-20',
    quantityKg: 22.0, notes: 'Jasmine grove harvest.',
    processingStatus: 'verified', packagingStatus: 'pending',
    qrToken: 'HB-2026-002', createdAt: '2026-08-20T10:00:00Z', updatedAt: '2026-08-26T10:00:00Z',
  },
  {
    id: 'b3', batchId: 'HB-2026-003', hiveId: 'H-003', beekeeperId: BK_ID,
    productionLocation: 'Madurai, Tamil Nadu', harvestDate: '2026-08-15',
    quantityKg: 16.5, notes: 'Sunflower honey.',
    processingStatus: 'pending', packagingStatus: 'pending',
    qrToken: 'HB-2026-003', createdAt: '2026-08-15T10:00:00Z', updatedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'b4', batchId: 'HB-2026-004', hiveId: 'H-005', beekeeperId: BK_ID,
    productionLocation: 'Madurai, Tamil Nadu', harvestDate: '2026-08-10',
    quantityKg: 25.0, notes: 'Best batch of the season.',
    processingStatus: 'verified', packagingStatus: 'verified',
    qrToken: 'HB-2026-004', createdAt: '2026-08-10T10:00:00Z', updatedAt: '2026-08-12T10:00:00Z',
  },
  {
    id: 'b5', batchId: 'HB-2026-005', hiveId: 'H-001', beekeeperId: BK_ID,
    productionLocation: 'Madurai, Tamil Nadu', harvestDate: '2026-07-25',
    quantityKg: 15.0, notes: 'Mango blossom honey.',
    processingStatus: 'verified', packagingStatus: 'verified',
    qrToken: 'HB-2026-005', createdAt: '2026-07-25T10:00:00Z', updatedAt: '2026-07-28T10:00:00Z',
  },
];

async function buildLedgerHash(prev: string, batchId: string, timestamp: string, action: string, userId: string, data: Record<string, unknown>): Promise<string> {
  const payload = [prev, batchId, timestamp, action, userId, JSON.stringify(data)].join('|');
  return sha256(payload);
}

export async function seedData(): Promise<void> {
  const alreadySeeded = storageService.get<boolean>(KEYS.SEEDED);
  if (alreadySeeded) return;

  storageService.set(KEYS.USERS, USERS);
  storageService.set(KEYS.HIVES, HIVES);
  storageService.set(KEYS.OBSERVATIONS, OBSERVATIONS);
  storageService.set(KEYS.HARVESTS, HARVESTS);
  storageService.set(KEYS.BATCHES, BATCHES);

  // Build ledger for batch HB-2026-001 (complete chain)
  const ledger: LedgerEntry[] = [];

  const batch1Entries: Array<{ action: string; ts: string; data: Record<string, unknown> }> = [
    { action: 'HARVEST_RECORDED', ts: '2026-08-25T10:00:00Z', data: { hiveId: 'H-001', quantityKg: 18.5, harvestDate: '2026-08-25' } },
    { action: 'BATCH_CREATED', ts: '2026-08-25T10:05:00Z', data: { batchId: 'HB-2026-001', hiveId: 'H-001', quantityKg: 18.5 } },
    { action: 'PROCESSING_VERIFIED', ts: '2026-08-26T09:00:00Z', data: { processingStatus: 'verified' } },
    { action: 'PACKAGING_VERIFIED', ts: '2026-08-27T09:00:00Z', data: { packagingStatus: 'verified' } },
    { action: 'QR_GENERATED', ts: '2026-08-27T09:30:00Z', data: { qrToken: 'HB-2026-001' } },
  ];

  let prevHash = 'GENESIS';
  for (let i = 0; i < batch1Entries.length; i++) {
    const e = batch1Entries[i];
    const hash = await buildLedgerHash(prevHash, 'HB-2026-001', e.ts, e.action, BK_ID, e.data);
    ledger.push({
      entryId: `LEDGER-001-${i + 1}`,
      batchId: 'HB-2026-001',
      timestamp: e.ts,
      action: e.action as LedgerEntry['action'],
      userId: BK_ID,
      data: e.data,
      previousHash: prevHash,
      hash,
    });
    prevHash = hash;
  }

  // Batch HB-2026-002 ledger
  const batch2Entries: Array<{ action: string; ts: string; data: Record<string, unknown> }> = [
    { action: 'HARVEST_RECORDED', ts: '2026-08-20T10:00:00Z', data: { hiveId: 'H-002', quantityKg: 22.0 } },
    { action: 'BATCH_CREATED', ts: '2026-08-20T10:05:00Z', data: { batchId: 'HB-2026-002' } },
    { action: 'PROCESSING_VERIFIED', ts: '2026-08-21T09:00:00Z', data: { processingStatus: 'verified' } },
  ];
  prevHash = 'GENESIS';
  for (let i = 0; i < batch2Entries.length; i++) {
    const e = batch2Entries[i];
    const hash = await buildLedgerHash(prevHash, 'HB-2026-002', e.ts, e.action, BK_ID, e.data);
    ledger.push({
      entryId: `LEDGER-002-${i + 1}`,
      batchId: 'HB-2026-002',
      timestamp: e.ts,
      action: e.action as LedgerEntry['action'],
      userId: BK_ID,
      data: e.data,
      previousHash: prevHash,
      hash,
    });
    prevHash = hash;
  }

  // Batch HB-2026-004 ledger
  const batch4Entries: Array<{ action: string; ts: string; data: Record<string, unknown> }> = [
    { action: 'HARVEST_RECORDED', ts: '2026-08-10T10:00:00Z', data: { hiveId: 'H-005', quantityKg: 25.0 } },
    { action: 'BATCH_CREATED', ts: '2026-08-10T10:05:00Z', data: { batchId: 'HB-2026-004' } },
    { action: 'PROCESSING_VERIFIED', ts: '2026-08-11T09:00:00Z', data: { processingStatus: 'verified' } },
    { action: 'PACKAGING_VERIFIED', ts: '2026-08-12T09:00:00Z', data: { packagingStatus: 'verified' } },
    { action: 'QR_GENERATED', ts: '2026-08-12T10:00:00Z', data: { qrToken: 'HB-2026-004' } },
  ];
  prevHash = 'GENESIS';
  for (let i = 0; i < batch4Entries.length; i++) {
    const e = batch4Entries[i];
    const hash = await buildLedgerHash(prevHash, 'HB-2026-004', e.ts, e.action, BK_ID, e.data);
    ledger.push({
      entryId: `LEDGER-004-${i + 1}`,
      batchId: 'HB-2026-004',
      timestamp: e.ts,
      action: e.action as LedgerEntry['action'],
      userId: BK_ID,
      data: e.data,
      previousHash: prevHash,
      hash,
    });
    prevHash = hash;
  }

  storageService.set(KEYS.LEDGER, ledger);
  storageService.set(KEYS.SEEDED, true);
}
