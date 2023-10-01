import { omit } from 'lodash';

import logger from '../utils/logger';
import enqueueCampaignStep from '../utils/campaignSimulation/enqueueCampaignStep';
import { markCampaignSimulationStepAsCompleted } from '../utils/dbHelpers/campaignSimulation';

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
		logger.error(errorMessage, { error, jobParams: job?.data });
		throw new Error(error || 'Something went wrong');
	}
}

export default processCampaignDelayStepJob;
