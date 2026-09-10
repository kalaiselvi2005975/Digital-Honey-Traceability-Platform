export type HiveHealthStatus = 'healthy' | 'warning' | 'critical';
export type QueenStatus = 'active' | 'weak' | 'unknown';

export interface Hive {
  id: string;
  hiveId: string;
  name: string;
  location: string;
  installationDate: string;
  queenStatus: QueenStatus;
  healthStatus: HiveHealthStatus;
  lastInspection: string;
  notes: string;
  beekeeperId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HiveObservation {
  id: string;
  hiveId: string;
  date: string;
  observation: string;
  healthStatus: HiveHealthStatus;
  problemDetected: boolean;
  problemDescription?: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}
