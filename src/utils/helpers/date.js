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
