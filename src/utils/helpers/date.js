import moment from 'moment';

export function isToday(date) {
	if (!date) return false;
	return moment().isSame(new Date(date), 'day');
}

export function getTodayDate() {
	return new Date(moment().utc().startOf('day').toDate()).getTime();
}

export function getTimestampWithDaysOffset(daysOffset = 0) {
	const currentDate = moment().utc().startOf('day');

	if (daysOffset !== 0) {
		const adjustedDate =
			daysOffset < 0
				? currentDate.subtract(Math.abs(daysOffset), 'days')
				: currentDate.add(daysOffset, 'days');
		return new Date(adjustedDate.toDate());
	}

	return new Date(currentDate.toDate());
}

export function parseTimeZone(timezoneOffset) {
	if (!timezoneOffset && timezoneOffset !== 0) return '+00:00';

	let isNegativeTimezone = false;
	let nTimezoneOffset = Number(timezoneOffset);
	if (nTimezoneOffset < 0) isNegativeTimezone = true;
	nTimezoneOffset = Math.abs(nTimezoneOffset);

	const values = String(nTimezoneOffset).split('.');
	let timezone = isNegativeTimezone ? '-' : '+';
	timezone = `${timezone}${`0${values[0]}`.slice(-2)}`;
	let suffix = '00';
	if (values[1] && Number(values[1]) === 5) suffix = '30';
	timezone = `${timezone}:${`0${suffix}`.slice(-2)}`;
	return timezone;
}
