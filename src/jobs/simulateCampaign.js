import { isArray, map } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../utils/logger';
import { isNonEmptyArray } from '../utils/helpers';
import { FLOW_NODE_TYPES } from '../constants/campaign';
import parseJobParams from '../utils/helpers/parseJobParams';
import getActiveSenders from '../utils/dbHelpers/getActiveSenders';
import getValidProspects from '../utils/dbHelpers/getValidProspects';
import { getCampaignFlowNode } from '../utils/dbHelpers/campaignFlow';
import getActiveCampaignById from '../utils/dbHelpers/getActiveCampaignById';
import enqueueCampaignStep from '../utils/campaignSimulation/enqueueCampaignStep';
import divideProspectsBySenders from '../utils/campaignSimulation/divideProspectsBySenders';

async function simulateCampaignJob(job, additionalParams = {}) {
	try {
		const { campaignId } = job?.data || {};
		const { logUnsuccessfulJob } = additionalParams || {};
		if (!campaignId) return logUnsuccessfulJob('Missing Campaign Id.');

		logger.info(`[simulateTheCampaignJob] Simulating Campaign: ${campaignId}`);
		const campaign = await getActiveCampaignById(campaignId);
		if (!campaign) return logUnsuccessfulJob('Campaign Not Found.');

		const hasExcludeProspects = isArray(campaign?.excludeProspects)
			? !!campaign.excludeProspects.length
			: !!campaign.excludeProspects;
		const [senders, prospects, excludeProspects, startNode] = await Promise.all([
			getActiveSenders(campaign.sender),
			getValidProspects(campaign.prospects),
			hasExcludeProspects ? getValidProspects(campaign?.excludeProspects) : [],
			getCampaignFlowNode({ campaign: campaignId, stepType: FLOW_NODE_TYPES.START }),
		]);

		if (!startNode) return logUnsuccessfulJob('Missing Campaign Start Node.');
		if (!isNonEmptyArray(prospects)) return logUnsuccessfulJob('No Prospect Found.');
		if (!isNonEmptyArray(senders)) return logUnsuccessfulJob('No Active Sender Available.');

		const stepNode = await getCampaignFlowNode({
			campaign: campaignId,
			parentStep: startNode?._id,
		});
		if (!stepNode) return logUnsuccessfulJob('No Node Found To Proceed');

		const prospectsWithSender = await divideProspectsBySenders({
			campaign,
			senders,
			prospects,
			excludeProspects,
		});
		if (!isNonEmptyArray(prospectsWithSender)) {
			return logUnsuccessfulJob('No Prospect Found To Enqueue');
		}

		const pLimit = promiseLimit(50);
		await Promise.all(
			map(prospectsWithSender, (prospectWithSender, index) =>
				pLimit(() =>
					enqueueCampaignStep({ ...(prospectWithSender || {}), campaignId, stepNode, index })
				)
			)
		);

		logger.info(`[simulateCampaignJob] Campaign Simulated ${campaignId}`, {
			senders: senders?.length,
			prospects: prospectsWithSender?.length,
		});

		return { success: true, data: { campaignId } };
	} catch (error) {
		const errorMessage = `[simulateCampaignJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job) });
		throw new Error(error || 'Something went wrong');
	}
}

export default simulateCampaignJob;
