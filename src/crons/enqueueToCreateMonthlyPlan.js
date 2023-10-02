import scheduleCronJob from '../utils/scheduleCronJob';
import enqueueToCreateMonthlyPlans from '../utils/warmup/enqueueToCreateMonthlyPlan';

function enqueueToCreateMonthlyPlansCronJob() {
	// every hour
	scheduleCronJob('0 0 */1 * * *', {
		title: 'enqueueToCreateMonthlyPlans',
		func: enqueueToCreateMonthlyPlans,
	});
}

export default enqueueToCreateMonthlyPlansCronJob;
