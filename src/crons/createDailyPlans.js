import moment from 'moment';
import schedule from 'node-schedule';

import scheduleCronJob from '../utils/scheduleCronJob';
import createDailyPlans from '../utils/dailyPlans/createDailyPlans';

async function createDailyPlansHandler() {
	const day = new Date().getDay();
	if (day !== 6 && day !== 0) {
		await createDailyPlans(1);
		if (day === 5) {
			await createDailyPlans(2);
			await createDailyPlans(3);
		}
	}

	const timestamp = new Date(moment().add(-24, 'hours').utc().toDate());
	const filter = { createdAt: { $gte: timestamp } };
	await createDailyPlans(0, filter);
	if (day === 6 || day === 0) {
		await createDailyPlans(1, filter);
		if (day === 6) await createDailyPlans(2, filter);
	}
}

function createDailyPlansCronJob() {
	const rule = new schedule.RecurrenceRule();
	rule.hour = 9;
	rule.minute = 0;
	rule.second = 0;
	rule.tz = 'Etc/UTC';

	scheduleCronJob(rule, {
		title: 'createDailyPlans',
		func: createDailyPlansHandler,
	});
}

export default createDailyPlansCronJob;
