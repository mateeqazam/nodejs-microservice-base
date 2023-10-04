import { get } from 'lodash';

import logger from '../logger';
import { isNonEmptyArray } from '../helpers';
import DailyPlanModel from '../../models/dailyPlan';

import determineReceivers from './determineReceivers';
import determineTemplates from './determineTemplates';
import { getTimestampWithDaysOffset } from './helpers';
import determineSendingTime from './determineSendingTime';

async function createDailyPlan(recordItem, daysOffset) {
	if (!recordItem) return;

	const params = { recordItem, daysOffset };
	try {
		const emailCount = get(recordItem, 'emailCount');
		const receivers = await determineReceivers(recordItem, daysOffset);
		if (!isNonEmptyArray(receivers)) {
			const logMessage = `No receivers found to meet the quota of ${emailCount}. Mailbox ref: ${recordItem._id}`;
			logger.debug(logMessage, { params, data: { emailCount } });
			return;
		}

		const emailTemplates = await determineTemplates(recordItem, receivers);
		if (!isNonEmptyArray(emailTemplates)) {
			const logMessage = `No email templates found. Mailbox ref: ${recordItem._id}`;
			logger.debug(logMessage, { params, data: { emailCount, receivers } });
			return;
		}

		const result = await determineSendingTime(recordItem, emailTemplates, daysOffset);
		if (!isNonEmptyArray(result)) {
			const logMessage = `Unable to determine sending time. Mailbox ref: ${recordItem._id}`;
			logger.debug(logMessage, { params, data: { emailCount, receivers, emailTemplates } });
			return;
		}

		const timestamp = getTimestampWithDaysOffset(daysOffset);
		await DailyPlanModel.updateOne({
			filter: { mailbox: recordItem._id, date: timestamp },
			write: {
				totalEmails: result.length,
				plannedEmails: emailCount,
				date: timestamp,
				hourlySchedule: result,
				$setOnInsert: { mailbox: recordItem._id },
			},
			upsert: true,
		});
	} catch (error) {
		const errorMessage = `[createDailyPlan] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params });
	}
}

export default createDailyPlan;
