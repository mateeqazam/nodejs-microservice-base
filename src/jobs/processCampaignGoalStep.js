import { omit } from 'lodash';

import logger from '../utils/logger';
import { markCampaignSimulationStepAsCompleted } from '../utils/dbHelpers/campaignSimulation';

async function processCampaignGoalStepJob(job, additionalParams = {}) {
	try {
		const { stepItemId } = job?.data || {};
		const { logUnsuccessfulJob } = additionalParams || {};
		if (!stepItemId) return logUnsuccessfulJob('Missing Required Parameters');

		const updatedCampaignSimulationStep = await markCampaignSimulationStepAsCompleted(stepItemId);
		if (!updatedCampaignSimulationStep) {
			throw new Error('Failed to update Campaign Simulation Step.');
		}

		return { success: true, data: omit(job?.data, ['stepNode']) };
	} catch (error) {
		const errorMessage = `[processCampaignGoalStepJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: job?.data });
		throw new Error(error || 'Something went wrong');
	}
}

export default processCampaignGoalStepJob;
