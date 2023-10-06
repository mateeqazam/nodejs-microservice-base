import moment from 'moment';
import { isNonEmptyArray } from '.';

export function formatDate(date) {
	return moment(date).utc().format('YY-MM-DD:HH-mm-ss');
}

export function getStartDayTime(date) {
	return new Date(moment(date).utc().startOf('day').toDate()).getTime();
}

export function getDaysBeforeDate(date, daysBefore = 0) {
	return new Date(moment(date).add(daysBefore, 'days').utc().startOf('day'));
}

export function differenceInDaysBetweeDates(date1, date2) {
	const startDate = moment(date1);
	const endDate = moment(date2);
	return endDate.diff(startDate, 'days');
}

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

export function generateDateArray(n = 1) {
	const currentDate = new Date();
	return Array.from({ length: n }, (_, index) => {
		const date = new Date(currentDate);
		date.setDate(currentDate.getDate() - index);
		return date;
	});
}

export function sortByDateKey(data) {
	if (!isNonEmptyArray(data)) return [];
	return data.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
}

export function getDatesBetween(startDate, endDate) {
	const dates = [];
	const currentDate = new Date(startDate);
	currentDate.setDate(currentDate.getDate() + 1);

	while (currentDate < endDate) {
		dates.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}
