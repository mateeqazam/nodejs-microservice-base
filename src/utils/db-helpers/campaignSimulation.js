import log from '../log';
import { isEmpty, omit } from '../helpers';
import CampaignSimulationModel from '../../models/campaignSimulation';

import fetchAndProcessRecords from './fetchAndProcessRecords';

export async function updateManyCampaignSimulationStep(queryParams) {
	const { filter, write } = queryParams || {};
	if (!filter || isEmpty(filter)) return { error: 'Missing Filter Params' };
	if (!write || isEmpty(write)) return { error: 'Missing Write Object' };

	try {
		const update = {
			$set: {
				...(write.$set || {}),
				...omit(write, ['$setOnInsert', '$set']),
			},
			$setOnInsert: write?.$setOnInsert,
		};
		const result = await CampaignSimulationModel.updateMany(filter, update);
		return { result };
	} catch (error) {
		const errorMessage = `[updateManyCampaignSimulationStep] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams });
		return { error };
	}
}

export async function getAndProcessCampaignSimulations(queryParams, additionalParams = {}) {
	const { filter } = queryParams || {};
	if (!filter || isEmpty(filter)) return { error: 'Missing Filter Params' };

	try {
		const { processRecords, batchSize = 100 } = additionalParams || {};
		const { error, result } = await fetchAndProcessRecords(queryParams, {
			DBModel: CampaignSimulationModel,
			processRecords,
			batchSize,
		});
		if (error) throw new Error(error);

		return { result };
	} catch (error) {
		const errorMessage = `[getAndProcessCampaignSimulations] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams, params: { additionalParams } });
		return { error };
	}
}
