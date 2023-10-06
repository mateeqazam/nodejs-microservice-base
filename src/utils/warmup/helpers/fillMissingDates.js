import moment from 'moment';
import { forEach } from 'lodash';

import { isNonEmptyArray } from '../../helpers';
import { formatDate, getDatesBetween, getStartDayTime, sortByDateKey } from '../../helpers/date';

function fillMissingDates(data) {
	if (!isNonEmptyArray(data)) return null;

	const dataMap = {};
	const sortedData = sortByDateKey(data);
	for (let index = 1; index < sortedData?.length; index += 1) {
		const currData = sortedData[index];
		const prevData = sortedData[index - 1];

		const currDate = moment(currData.date);
		const prevDate = moment(prevData.date);

		dataMap[formatDate(prevDate)] = prevData;

		if (currDate.diff(prevDate, 'days') > 1) {
			const missingDates = getDatesBetween(prevDate, currDate);
			forEach(missingDates, (date) => {
				const previousData = prevData?._doc || prevData;
				if (!previousData) return;

				let formattedDate = getStartDayTime(date);
				if (!formattedDate) return;
				formattedDate = new Date(formattedDate);

				dataMap[formatDate(formattedDate)] = { ...previousData, date: formattedDate };
			});
		}

		dataMap[formatDate(currDate)] = currData;
	}

	return Object.values(dataMap);
}

export default fillMissingDates;
