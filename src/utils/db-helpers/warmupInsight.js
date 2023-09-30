import log from '../log';
import { isNonEmptyArray } from '../helpers';
import WarmupInsightModel from '../../models/warmupInsight';

// eslint-disable-next-line import/prefer-default-export
export async function bulkWriteWarmupInsights(operations, options) {
	if (!isNonEmptyArray(operations)) return { error: 'Missing Opertaions' };

	try {
		const writeOps = options || { ordered: false };
		const result = await WarmupInsightModel.bulkWrite(operations, writeOps);
		return { result };
	} catch (error) {
		const errorMessage = `[bulkWriteWarmupInsights] Error: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams: { operations } });
		return { error };
	}
}
