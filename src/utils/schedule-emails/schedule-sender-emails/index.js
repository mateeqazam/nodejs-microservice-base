import moment from 'moment';
import { pick, isNumber, forEach } from 'lodash';

import logger from '../../logger';
import { getRandomValue } from '../../helpers';
import emailSenderQueue from '../../../queues/emailSender';
import { calculateDateTimeDifference } from '../../helpers/date';
import { generateEmailSenderJobKey } from '../../helpers/generateJobKey';
import { DEFAULT_SEDNER_DELAY_BETWEEN_EMAILS } from '../../../constants/sender';
import { TIME_SPAN_TO_SCHEDULE_CAMPAIGN_EMAILS } from '../../../constants/simulation';

import fetchEmailsToSchedule from './fetchEmailsToSchedule';
import EmailsToBeScheduledModel from '../../../models/emailsToBeScheduled';
import CampaignSimulationModel from '../../../models/campaignSimulation';

async function scheduleSenderEmails(sender, additionalParams = {}) {
	try {
		if (!sender || !sender._id || !sender.email) {
			throw new Error('Missing or Invalid Sender');
		}

		const senderId = sender._id;
		const { campaigns, timeRangeToSchedule, variantsCounter } = additionalParams || {};
		if (!timeRangeToSchedule) throw new Error('Missing Time Range To Schedule.');

		const { fixedDelay, randomDelay } = sender?.config || {};
		const minDelay = fixedDelay || randomDelay?.from || DEFAULT_SEDNER_DELAY_BETWEEN_EMAILS;
		const totalEmailsToFetch = Math.ceil(
			Math.min(TIME_SPAN_TO_SCHEDULE_CAMPAIGN_EMAILS / minDelay + 5, sender.quota)
		); // NOTE: Adding 5 for an extra margin of safety

		const emailsToSchedule = await fetchEmailsToSchedule(senderId, campaigns, {
			totalEmailsToFetch,
		});

		let baseDelay = calculateDateTimeDifference(timeRangeToSchedule?.from, new Date());

		const campaignSimulationBulkOperations = [];
		const emailsToBeScheduledBulkOperations = [];
		forEach(emailsToSchedule, (emailItem) => {
			const { campaign, campaignFlowNode } = emailItem || {};
			const variant = variantsCounter.getVariantWithMinCount({ campaign, campaignFlowNode });
			if (!variant || !variant.minKey) {
				logger.warn('[scheduleSenderEmails] Unable to find Variant', {
					data: { variant, emailItem, sender },
				});
				return;
			}

			const delay =
				fixedDelay ||
				getRandomValue(randomDelay?.from, randomDelay?.to) ||
				DEFAULT_SEDNER_DELAY_BETWEEN_EMAILS;

			const totalDelay = baseDelay + delay * 1000;
			if (!isNumber(totalDelay) || totalDelay < 0) {
				logger.warn('[scheduleSenderEmails] Invalid calculated delay', {
					data: { baseDelay, totalDelay, emailItem, sender },
				});
				return;
			}

			const delayedDateTime = moment(new Date(Date.now() + totalDelay));
			const maxDateTimeToSchedule = moment(timeRangeToSchedule?.to);
			if (delayedDateTime.isAfter(maxDateTimeToSchedule)) return;

			const variantId = variant.minKey;
			const jobData = {
				...pick(emailItem, [
					'campaign',
					'campaignFlowNode',
					'campaignSimulationStep',
					'sender',
					'prospect',
					'failedCount',

					// queueRecordId
					// isWarmUp
				]),
				variant: variantId,
			};

			const jobKey = generateEmailSenderJobKey(jobData);
			if (!jobKey) throw new Error('Unable to generate Job Key.');

			// TODO: need to add await?
			emailSenderQueue.add(jobKey, jobData, { delay: totalDelay });

			baseDelay = totalDelay;
			variantsCounter.incrementVariantCount({ campaign, campaignFlowNode, variant });

			emailsToBeScheduledBulkOperations.push({
				updateOne: {
					filter: { _id: emailItem._id },
					write: { variant, status: 'queued', scheduledAt: delayedDateTime },
				},
			});
			campaignSimulationBulkOperations.push({
				updateOne: {
					filter: { _id: emailItem.campaignSimulationStep },
					write: { 'details.emailVariant': variant, 'details.scheduledAt': delayedDateTime },
				},
			});
		});

		await Promise.all([
			EmailsToBeScheduledModel.bulkWrite(emailsToBeScheduledBulkOperations),
			CampaignSimulationModel.bulkWrite(campaignSimulationBulkOperations),
		]);
	} catch (error) {
		const senderEmail = sender?.email || '';
		const errorMessage = `[scheduleSenderEmails] "${senderEmail}" Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { sender, ...(additionalParams || {}) } });
	}
}

export default scheduleSenderEmails;
