import promiseLimit from 'promise-limit';
import { sum, isNumber, isNil, filter, forEach, flatten } from 'lodash';

import logger from '../../logger';
import EmailsToBeScheduledModel from '../../../models/emailsToBeScheduled';
import { MINIMUM_EMAILS_PER_CAMPAIGN } from '../../../constants/simulation';

function getEmailsFromEmailsToBeScheduled(params) {
	try {
		const { campaign, sender, isWarmUpEmail = false, take } = params || {};
		if (!sender || !isNumber(take) || take <= 0) {
			throw new Error('Missing or Required Invalid parameters');
		}

		const filterQuery = [
			{ status: 'active' },
			{
				$or: [
					{ failedCount: { $exists: false } },
					{ failedCount: null },
					{ failedCount: { $lte: 3 } },
				],
			},
			{ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
		];

		if (campaign) {
			filterQuery.push({ campaign });
			filterQuery.push({ $or: [{ sender }, { sender: { $exists: false } }, { sender: null }] });
		} else if (isWarmUpEmail) {
			filterQuery.push({ isWarmUpEmail });
			filterQuery.push({ sender });
		}

		const sort = {
			createdAt: 1, // Sort by createdAt in ascending order (FIFO)
			priority: -1, // Sort by priority in descending order (higher priority first)
		};

		if (campaign) sort.sender = 1; // Sort by senderId in ascending order (if it exists)

		const queryParams = {
			filter: { $and: filterQuery },
			sort,
			limit: take,
		};

		return EmailsToBeScheduledModel.find(queryParams);
	} catch (error) {
		const errorMessage = `[getEmailsFromEmailsToBeScheduled] Exception: ${error?.message}`;
		logger.dbError(errorMessage, { error, params });
		return null;
	}
}

async function fetchEmailsToSchedule(sender, campaigns, additionalParams) {
	const { totalEmailsToFetch = 0 } = additionalParams || {};
	if (!totalEmailsToFetch) return null;

	try {
		const emailsByCampaigns = {};
		forEach(campaigns, (campaign) => {
			if (campaign && campaign._id) {
				emailsByCampaigns[campaign._id] = Math.max(
					Math.ceil(totalEmailsToFetch / campaigns.length),
					MINIMUM_EMAILS_PER_CAMPAIGN,
					0
				);
			}
		});

		const promises = [];
		const pLimit = promiseLimit(20);

		forEach(Object.keys(emailsByCampaigns), (campaign) => {
			promises.push(
				pLimit(() =>
					getEmailsFromEmailsToBeScheduled({ sender, campaign, take: emailsByCampaigns[campaign] })
				)
			);
		});

		// Fetch Warm-up emails
		const totalCampaignEmailsToFetch = sum(Object.values(emailsByCampaigns));
		promises.push(
			pLimit(() =>
				getEmailsFromEmailsToBeScheduled({
					sender,
					isWarmUpEmail: true,
					take: totalEmailsToFetch - totalCampaignEmailsToFetch,
				})
			)
		);

		const emailsToSchedule = await Promise.all(promises);
		return flatten(filter(emailsToSchedule, !isNil));
	} catch (error) {
		const errorMessage = `[fetchEmailsToSchedule] Exception: ${error.message}`;
		logger.error(errorMessage, { error, data: { campaigns, ...(additionalParams || {}) } });
		return null;
	}
}

export default fetchEmailsToSchedule;
