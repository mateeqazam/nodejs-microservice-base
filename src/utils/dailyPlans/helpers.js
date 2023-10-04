import moment from 'moment';

import { getRandValue } from '../helpers/random';

export const getTodayTimestamp = () => new Date(moment().utc().startOf('day').toDate());

export const getYesterdayTimestamp = () =>
	new Date(moment().subtract(1, 'days').utc().startOf('day').toDate());

export function getTimestampWithDaysOffset(daysOffset = 0) {
	if (daysOffset < 0) {
		return new Date(moment().subtract(Math.abs(daysOffset), 'days').utc().startOf('day').toDate());
	}
	if (daysOffset > 0) {
		return new Date(moment().add(daysOffset, 'days').utc().startOf('day').toDate());
	}
	return new Date(moment().utc().startOf('day').toDate());
}

export function determineReplyTime(sender) {
	if (!sender) return null;

	const now = moment(moment().utcOffset(sender.timezoneOffset || 0));
	const hour = now.hour();

	let delay = getRandValue(60, 120);
	switch (hour) {
		case hour >= 7 && hour < 10:
			delay = getRandValue(20, 40);
			break;
		case hour >= 10 && hour < 12:
		case hour >= 12 && hour < 13:
		case hour >= 13 && hour < 15:
			delay = getRandValue(60, 90);
			break;
		case hour >= 15 && hour < 17:
			delay = getRandValue(90, 180);
			break;
		default:
			delay = getRandValue(60, 120);
			break;
	}

	const newTime = now.add(delay, 'minutes');
	if (newTime.hour() < 17) return newTime;

	const delayM = newTime.diff(now.startOf('day').add(17, 'hours'), 'minutes');
	return now
		.add(1, 'days')
		.startOf('day')
		.add(420 + Math.abs(delayM), 'minutes')
		.toDate();
}
