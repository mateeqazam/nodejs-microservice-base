import { pick } from 'lodash';

import logger from '../utils/logger';
import { FLOW_NODE_TYPES } from '../constants/campaign';
import parseJobParams from '../utils/helpers/parseJobParams';
import CampaignSimulationModel from '../models/campaignSimulation';
import { generateCampaignStepJobKey } from '../utils/helpers/generateJobKey';

import campaignGoalStepProcessorQueue from '../queues/campaignGoalStepProcessor';
import campaignEmailStepProcessorQueue from '../queues/campaignEmailStepProcessor';
import campaignDelayStepProcessorQueue from '../queues/campaignDelayStepProcessor';
import campaignTriggerStepProcessorQueue from '../queues/campaignTriggerStepProcessor';

async function simulateCampaignStepJob(job, additionalParams = {}) {
	try {
		const { logUnsuccessfulJob } = additionalParams || {};
		const { campaignId, nodeItemId, senderId, prospectId, stepNode } = job?.data || {};
		if (!campaignId || !nodeItemId || !prospectId) {
			return logUnsuccessfulJob('Missing Required Parameters.');
		}
		if (!stepNode || !stepNode._id || !stepNode.stepType) {
			return logUnsuccessfulJob('Missing or Invalid Campaign Step Node Item.');
		}

		const { stepType, triggerCondition, triggerDelay, waitDelay } = stepNode;
		const stepDetails = stepType === 'trigger' ? { triggerCondition } : {};
		const writeParams = {
			campaign: campaignId,
			campaignFlowNode: nodeItemId,
			prospect: prospectId,
			stepType,
			sender: senderId,
			status: 'active',
			...(Object.keys(stepDetails).length === 0 ? {} : { details: stepDetails }),
		};

		const queryParams = {
			filter: pick(writeParams, ['campaign', 'campaignFlowNode', 'prospect']),
			write: writeParams,
			upsert: true,
		};
		const campaignSimulationStepItem = await CampaignSimulationModel.updateOne(queryParams);
		if (!campaignSimulationStepItem || !campaignSimulationStepItem._id) {
			throw new Error('Unable to Upsert Campaign Step Item.');
		}

		let delay = 0;
		let queueToProcess = null;
		switch (stepType) {
			case FLOW_NODE_TYPES.EMAIL:
				queueToProcess = campaignEmailStepProcessorQueue;
				break;

			case FLOW_NODE_TYPES.TRIGGER:
				delay = triggerDelay || 0;
				queueToProcess = campaignTriggerStepProcessorQueue;
				break;

			case FLOW_NODE_TYPES.DELAY:
				delay = waitDelay || 0;
				queueToProcess = campaignDelayStepProcessorQueue;
				break;

			case FLOW_NODE_TYPES.GOAL:
				queueToProcess = campaignGoalStepProcessorQueue;
				break;

			default:
				throw new Error(`Invalid Step Type: ${stepType}`);
		}
		if (!queueToProcess) throw new Error('Unable to find Campaign Step Queue.');

		const stepItemId = campaignSimulationStepItem._id;
		const jobData = { ...(job.data || {}), stepItemId };
		const jobKey = generateCampaignStepJobKey(`campaign-${stepType}-step`, jobData);
		if (!jobKey) throw new Error('Unable to generate Job Key.');

		await queueToProcess.add(jobKey, jobData);
		if (delay) {
			const updatedSimulationStep = await CampaignSimulationModel.updateOne({
				filter: { _id: stepItemId },
				write: { 'details.scheduledAt': new Date(Date.now() + delay) },
			});
			if (!updatedSimulationStep) throw new Error('Failed to update Campaign Simulation Step.');
		}

		return {
			success: true,
			data: { campaignId, nodeItemId, prospectId, stepItemId, senderId },
		};
	} catch (error) {
		const errorMessage = `[simulateCampaignStepJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job) });
		throw new Error(error || 'Something went wrong');
	}
}

export default simulateCampaignStepJob;
