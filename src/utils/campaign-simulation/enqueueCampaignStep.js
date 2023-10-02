import logger from '../logger';
import { getCampaignFlowNode } from '../db-helpers/campaignFlow';
import campaignStepSimulatorQueue from '../../queues/campaignStepSimulator';
import { generateCampaignStepSimulatorJobKey } from '../helpers/generateJobKey';

async function enqueueCampaignStep(stepParams) {
	try {
		const { campaignId, stepNode, variant, nodeId, parentNodeId } = stepParams || {};
		if (!campaignId) throw new Error('Missing Required Campaign Id');

		let stepNodeItem = stepNode;
		if (!stepNodeItem || !stepNodeItem._id) {
			const variantFilter = variant ? { parentStepType: variant } : {};
			const queryFilter = nodeId ? { _id: nodeId } : { parentStep: parentNodeId };
			stepNodeItem = await getCampaignFlowNode({
				campaign: campaignId,
				...queryFilter,
				...variantFilter,
			});
		}
		if (!stepNodeItem || !stepNodeItem._id) throw new Error('Missing or Invalid Step Node');

		const nextStepParams = { ...stepParams, nodeItemId: stepNodeItem._id, stepNode: stepNodeItem };
		const jobKey = generateCampaignStepSimulatorJobKey(nextStepParams);
		if (!jobKey) throw new Error('Unable to generate Job Key');

		await campaignStepSimulatorQueue.add(jobKey, nextStepParams);
		return { success: true, params: stepParams };
	} catch (error) {
		const errorMessage = `[enqueueCampaignStep] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: stepParams });
		return { success: false, params: stepParams };
	}
}

export default enqueueCampaignStep;
