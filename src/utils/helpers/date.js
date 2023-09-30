import { isNumber } from 'lodash';

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
