import { filter, flatMap, isNil, map } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../logger';
import { isNonEmptyArray } from '../helpers';
import calculateTimeRange from '../helpers/calaculateTimeRange';

import getValidSenders from './get-valid-senders';
import getValidCampaigns from './get-valid-campaigns';
import getEmailsVariants from './get-emails-variants';
import scheduleSenderEmails from './schedule-sender-emails';
import CampaignVariantCounter from './CampaignVariantCounter';

async function scheduleEmails() {
	let timeRangeToSchedule = null;

	try {
		timeRangeToSchedule = calculateTimeRange(new Date());
		if (!timeRangeToSchedule) throw new Error('Unable to calculate Time Range.');

		const validCampaigns = await getValidCampaigns();
		const [validSenders, campaignEmailVariants] = await Promise.all([
			getValidSenders(flatMap(validCampaigns || [], (campaign) => campaign.sender || [])),
			getEmailsVariants(filter(map(validCampaigns, '_id'), !isNil)),
		]);
		if (!isNonEmptyArray(validSenders)) {
			logger.debug('[scheduleEmails] No Valid Senders Found to Schedule Emails.');
			return { success: true };
		}

		const variantsCounter = new CampaignVariantCounter(campaignEmailVariants);
		const pLimit = promiseLimit(10);
		await Promise.all(
			map(validSenders, (sender) =>
				pLimit(() =>
					scheduleSenderEmails(sender, {
						variantsCounter,
						timeRangeToSchedule,
						campaigns: validCampaigns,
					})
				)
			)
		);

		variantsCounter.resetValue();
		return { success: true };
	} catch (error) {
		const errorMessage = `[scheduleEmails] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, data: { timeRangeToSchedule } });
		throw error;
	}
}

export default scheduleEmails;
