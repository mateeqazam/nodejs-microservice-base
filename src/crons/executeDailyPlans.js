import schedule from 'node-schedule';

import scheduleCronJob from '../utils/scheduleCronJob';
import executeDailyPlans from '../utils/dailyPlans/executeDailyPlans';

function executeDailyPlansCronJob() {
	const rule = new schedule.RecurrenceRule();
	rule.hour = 0;
	rule.minute = 0;
	rule.second = 0;
	rule.tz = 'Etc/UTC';

	scheduleCronJob(rule, {
		title: 'executeDailyPlans',
		func: executeDailyPlans,
	});
}

export default executeDailyPlansCronJob;
