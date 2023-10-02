import { filter, map } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../../logger';
import getActiveCampaignsWithSchedule from '../../db-helpers/getActiveCampaignsWithSchedule';

import validateCampaign from './validateCampaign';

async function validateCampaignsBatch(campaigns) {
	const pLimit = promiseLimit(10);
	const validatedCampaigns = await Promise.all(
		map(campaigns, (campaign) => pLimit(() => validateCampaign(campaign)))
	);
	return filter(validatedCampaigns, (campaign) => campaign && campaign._id);
}

async function getValidCampaigns() {
	try {
		const activeCampaigns = await getActiveCampaignsWithSchedule();
		const validatedCampaigns = await validateCampaignsBatch(activeCampaigns);
		return validatedCampaigns;
	} catch (error) {
		const errorMessage = `[getValidCampaigns] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
		return null;
	}
}

export default getValidCampaigns;
