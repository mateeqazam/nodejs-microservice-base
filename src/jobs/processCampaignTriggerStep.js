import { omit } from 'lodash';

import logger from '../utils/logger';
import parseJobParams from '../utils/helpers/parseJobParams';
import { TRIGGER_NODE_VARIANTS } from '../constants/campaign';
import enqueueCampaignStep from '../utils/campaignSimulation/enqueueCampaignStep';
import { markCampaignSimulationStepAsCompleted } from '../utils/dbHelpers/campaignSimulation';

async function processCampaignTriggerStepJob(job, additionalParams = {}) {
	const variant = TRIGGER_NODE_VARIANTS.NO;

	try {
		const { stepItemId, nodeItemId } = job?.data || {};
		const { logUnsuccessfulJob } = additionalParams || {};
		if (!stepItemId) return logUnsuccessfulJob('Missing Required Parameters');

		const updatedCampaignSimulationStep = await markCampaignSimulationStepAsCompleted(stepItemId, {
			write: { 'details.triggerNodeVariant': variant },
		});
		if (!updatedCampaignSimulationStep) {
			throw new Error('Failed to update Campaign Simulation Step.');
		}

		await enqueueCampaignStep(
			{
				...omit(job?.data, ['stepItemId', 'stepNode', 'nodeItemId']),
				parentNodeId: nodeItemId,
			},
			{ variant }
		);

		return { success: true, data: omit(job?.data, ['stepNode']) };
	} catch (error) {
		const errorMessage = `[processCampaignTriggerStepJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job), data: { variant } });
		throw new Error(error || 'Something went wrong');
	}
}

export default processCampaignTriggerStepJob;
