import { MS_IN_DAY } from '../../constants';

function generateWarmupPlan(maxEmails, weeks, startDateInMS) {
	const dayCount = weeks * 7;

	const plan = Array.from({ length: dayCount }, (_, i) => {
		const currentDate = new Date(startDateInMS + i * MS_IN_DAY);
		const emailCount =
			Math.round((i * (maxEmails / (dayCount - 1)) * i) / dayCount + 0.03 * maxEmails) || 1;

		if (i === 0 || [0, 6].includes(currentDate.getDay())) {
			return {
				emailCount: i === 0 ? 20 : Math.round(emailCount * 0.1) || 1,
				date: currentDate.getTime(),
			};
		}

		return { emailCount, date: currentDate.getTime() };
	});

	return plan;
}

export default generateWarmupPlan;
