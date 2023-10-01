import { pick, omit } from 'lodash';

import logger from '../utils/logger';
import parseJobParams from '../utils/helpers/parseJobParams';
import CampaignSimulationModel from '../models/campaignSimulation';
import EmailsToBeScheduledModel from '../models/emailsToBeScheduled';

async function processCampaignEmailStepJob(job, additionalParams = {}) {
	try {
		const { logUnsuccessfulJob } = additionalParams || {};
		const { stepItemId, campaignId, nodeItemId, prospectId, senderId } = job?.data || {};
		if (!stepItemId || !campaignId || !nodeItemId || !prospectId) {
			return logUnsuccessfulJob('Missing Required Parameters.');
		}

		const formattedRecord = {
			campaignSimulationStep: stepItemId,
			campaign: campaignId,
			campaignFlowNode: nodeItemId,
			prospect: prospectId,
			sender: senderId,
		};

		const filter = pick(formattedRecord, [
			'campaignSimulationStep',
			'campaign',
			'campaignFlowNode',
			'prospect',
		]);
		const emailSchedulingItem = await EmailsToBeScheduledModel.updateOne({
			filter,
			formattedRecord,
			upsert: true,
		});
		if (!emailSchedulingItem || !emailSchedulingItem._id) {
			throw new Error('Unable to upsert Email Scheduling Item.');
		}

		// TODO: Is there a potential benefit in storing the queueItemId within the campaign simulation steps collection?
		// Are there any notable advantages to making this update?
		const updatedCampaignSimulationStep = await CampaignSimulationModel.updateOne({
			filter: { _id: stepItemId },
			write: { 'details.scheduledEmailQueueItemID': emailSchedulingItem._id },
		});
		if (!updatedCampaignSimulationStep)
			throw new Error('Failed to update Campaign Simulation Step.');

		return { success: true, data: omit(job?.data, ['stepNode']) };
	} catch (error) {
		const errorMessage = `[processCampaignEmailStepJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job) });
		throw new Error(error || 'Something went wrong');
	}
}

export default processCampaignEmailStepJob;
