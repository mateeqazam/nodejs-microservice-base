import { omit } from 'lodash';

import logger from '../utils/logger';
import parseJobParams from '../utils/helpers/parseJobParams';
import enqueueCampaignStep from '../utils/campaign-simulation/enqueueCampaignStep';
import { markCampaignSimulationStepAsCompleted } from '../utils/db-helpers/campaignSimulation';

async function processCampaignDelayStepJob(job, additionalParams = {}) {
	try {
		const { stepItemId, nodeItemId } = job?.data || {};
		const { logUnsuccessfulJob } = additionalParams || {};
		if (!stepItemId) return logUnsuccessfulJob('Missing Required Parameters');

		const updatedCampaignSimulationStep = await markCampaignSimulationStepAsCompleted(stepItemId);
		if (!updatedCampaignSimulationStep) {
			throw new Error('Failed to update Campaign Simulation Step.');
		}

		await enqueueCampaignStep({
			...omit(job?.data, ['stepItemId', 'stepNode', 'nodeItemId']),
			parentNodeId: nodeItemId,
		});

		return { success: true, data: omit(job?.data, ['stepNode']) };
	} catch (error) {
		const errorMessage = `[processCampaignDelayStepJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job) });
		throw new Error(error || 'Something went wrong');
	}
}

export default processCampaignDelayStepJob;
