import { MS_IN_DAY } from '../../../constants';
import { getTodayDate } from '../../helpers/date';

function adjustForMinDayCount(dataArr, minDays, fillerObj = {}, options = {}) {
	const { sort = false, fillEmptyDaysWithPrevDays = false } = options;

	if (dataArr.length < minDays) {
		const daysSinceBeginning =
			dataArr.length &&
			Math.floor((getTodayDate() - new Date(dataArr[0].date).getTime()) / MS_IN_DAY);

		return [...Array(Math.max(minDays, daysSinceBeginning))]
			.map((_, i) => {
				const todayDate = new Date(getTodayDate() - i * MS_IN_DAY);
				const existing = dataArr.find(
					(v) => new Date(v.date).toISOString() === todayDate.toISOString()
				);

				if (existing) {
					return existing;
				}

				if (fillEmptyDaysWithPrevDays) {
					const previous = dataArr
						.sort((a, b) => new Date(b.date) - new Date(a.date))
						.find((v) => new Date(v.date) < todayDate);

					if (previous) return { ...previous, date: todayDate };
				}

				return { date: todayDate, ...fillerObj };
			})
			.sort((a, b) => new Date(a.date) - new Date(b.date));
	}

	if (sort && dataArr) return [...dataArr].sort((a, b) => new Date(a.date) - new Date(b.date));
	return dataArr;
}

export default adjustForMinDayCount;
