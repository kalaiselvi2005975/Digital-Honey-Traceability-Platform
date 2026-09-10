import { harvestService } from './batchService';

export interface ForecastResult {
  hiveId: string;
  predictedKg: number;
  confidence: 'low' | 'moderate' | 'high';
  basedOnHarvests: number;
  note: string;
}

export const forecastService = {
  predict(hiveId: string): ForecastResult {
    const harvests = harvestService.getByHive(hiveId);
    const quantities = harvests.map((h) => h.quantityKg).sort(
      (a, b) => new Date(harvests.find(h => h.quantityKg === b)?.harvestDate ?? '').getTime()
               - new Date(harvests.find(h => h.quantityKg === a)?.harvestDate ?? '').getTime()
    );

    if (quantities.length === 0) {
      return {
        hiveId,
        predictedKg: 0,
        confidence: 'low',
        basedOnHarvests: 0,
        note: 'No harvest data available for this hive.',
      };
    }

    // Use last 3 harvests sorted by date for moving average
    const sorted = [...harvests]
      .sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime())
      .slice(0, 3);
    const recentQty = sorted.map((h) => h.quantityKg);
    const avg = recentQty.reduce((sum, q) => sum + q, 0) / recentQty.length;

    // Simple trend: compare most recent to oldest of the window
    const trend = recentQty.length > 1 ? recentQty[0] - recentQty[recentQty.length - 1] : 0;
    const predicted = Math.max(0, parseFloat((avg + trend * 0.3).toFixed(1)));

    const confidence =
      harvests.length >= 5 ? 'high' : harvests.length >= 3 ? 'moderate' : 'low';

    return {
      hiveId,
      predictedKg: predicted,
      confidence,
      basedOnHarvests: harvests.length,
      note: `Prototype forecast based on ${harvests.length} harvest record(s). Not a scientific prediction.`,
    };
  },

  predictAll(hiveIds: string[]): ForecastResult[] {
    return hiveIds.map((id) => this.predict(id));
  },
};
