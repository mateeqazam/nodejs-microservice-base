import moment from 'moment';
import { forEach, isNumber } from 'lodash';

import logger from '../logger';
import { isNonEmptyArray } from '../helpers';
import { parseTimeZone } from '../helpers/date';
import { getRandValue } from '../helpers/random';

import { getTimestampWithDaysOffset } from './helpers';

function determineMinutes(emailsSpan, index) {
	const { emails = [], startTime, endTime } = emailsSpan || {};
	const totalMinutes = (endTime - startTime) * 60;
	let minutes = 0;
	do {
		minutes = startTime * 60 + (totalMinutes / emails.length) * index + getRandValue(-5, 5);
	} while (minutes < startTime * 60 || minutes > endTime * 60);

	return minutes;
}

function calculateScheduledTime(sender, emailSpan, index, daysOffset) {
	try {
		const minutes = determineMinutes(emailSpan, index);
		const parsedTimezone = parseTimeZone(sender.timezoneOffset);
		const scheduledTime = new Date(
			moment(getTimestampWithDaysOffset(daysOffset))
				.utcOffset(parsedTimezone)
				.startOf('day')
				.add(minutes, 'minutes')
				.format()
		);

		try {
			const timestamp = getTimestampWithDaysOffset(daysOffset);
			const dt = scheduledTime.getDate();
			if (dt !== timestamp.getDate()) {
				logger.warn('[calculateScheduledTime] DATE MISMATCHED', {
					data: { scheduledTime, timestamp, sender },
				});
				scheduledTime.setDate(timestamp.getDate());
			}
		} catch {
			/* empty */
		}

		return scheduledTime;
	} catch (error) {
		const errorMessage = `[calculateScheduledTime] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { sender, emailSpan, index, daysOffset } });
		return null;
	}
}

async function determineSendingTime(sender, templates, daysOffset) {
	try {
		if (!sender || !isNonEmptyArray(templates)) return null;

		const parseCalculatedValue = (value) => (isNumber(value) ? Math.ceil(value) : 0);

		const totalTemplates = templates.length;
		const [_7To10Emails, _10To12Emails, _12To1Emails, _1To3Emails, _3To5Emails] = [
			templates.splice(0, parseCalculatedValue(0.35 * totalTemplates)),
			templates.splice(0, parseCalculatedValue(0.15 * totalTemplates)),
			templates.splice(0, parseCalculatedValue(0.05 * totalTemplates)),
			templates.splice(0, parseCalculatedValue(0.3 * totalTemplates)),
			templates.splice(0, parseCalculatedValue(0.15 * totalTemplates)),
		];

		const EMAILS_SPANS = [
			{ key: '_7To10EmailsQuota', startTime: 7, endTime: 10, emails: _7To10Emails },
			{ key: '_10To12EmailsQuota', startTime: 10, endTime: 12, emails: _10To12Emails },
			{ key: '_12To1EmailsQuota', startTime: 12, endTime: 13, emails: _12To1Emails },
			{ key: '_1To3EmailsQuota', startTime: 13, endTime: 15, emails: _1To3Emails },
			{ key: '_3To5EmailsQuota', startTime: 15, endTime: 17, emails: _3To5Emails },
		];

		const result = [];
		forEach(EMAILS_SPANS, (emailSpan) => {
			const { emails = [] } = emailSpan || {};
			forEach(emails, (emailToSend, index) => {
				const scheduledTime = calculateScheduledTime(sender, emailSpan, index, daysOffset);
				if (!scheduledTime) return;

				// TODO: check if the receiver is already receiving another email at the same scheduled time
				const resultItem = {
					to: emailToSend.receiver,
					template: emailToSend.template,
					time: scheduledTime,
				};
				if (resultItem.to && resultItem.template && resultItem.time) {
					result.push(resultItem);
				}
			});
		});

		return result;
	} catch (error) {
		const errorMessage = `[determineSendingTime] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { sender, templates, daysOffset } });
		return null;
	}
}

export default determineSendingTime;
