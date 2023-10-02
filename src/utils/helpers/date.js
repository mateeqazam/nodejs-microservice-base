import { isNumber } from 'lodash';

import { WEEK_DAYS } from '../../constants';

export function getDayName(dateObj) {
	const dt = dateObj || new Date();
	return WEEK_DAYS[dt.getDay()];
}

export function getStartDayTime(dateObj) {
	const dt = dateObj || new Date();
	dt.setUTCHours(0, 0, 0, 0);
	return dt;
}

export function getEndDayTime(dateObj) {
	const dt = dateObj || new Date();
	dt.setUTCHours(23, 59, 59, 999);
	return dt;
}

export function getLastRoundedMinute(roundingFactor) {
	const now = new Date();
	const minutes = now.getMinutes();
	const roundedMinutes = Math.floor(minutes / roundingFactor) * roundingFactor;
	return new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		now.getHours(),
		roundedMinutes,
		0
	);
}

export function getTimezoneHour(timezoneOffset = 0) {
	const now = new Date();
	const currentHour = now.getUTCHours();
	const timezoneHour = currentHour + timezoneOffset;
	return (timezoneHour + 24) % 24;
}

export function getTimeAgo({ minutes } = {}) {
	let millisecondsAgo = 0;
	if (isNumber(minutes) && minutes > 0) millisecondsAgo = minutes * 60 * 1000;

	const currentTime = Date.now();
	return new Date(currentTime - millisecondsAgo);
}

export function calculateDateTimeDifference(date1, date2) {
	const timestamp1 = new Date(date1).getTime();
	const timestamp2 = new Date(date2).getTime();

	const differenceInMilliseconds = Math.abs(timestamp2 - timestamp1);
	return differenceInMilliseconds;
}
