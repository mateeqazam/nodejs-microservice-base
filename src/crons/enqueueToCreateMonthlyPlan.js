import scheduleCronJob from '../utils/scheduleCronJob';
import enqueueToCreateMonthlyPlan from '../utils/warmup/enqueueToCreateMonthlyPlan';

function enqueueToCreateMonthlyPlanCronJob() {
	// every hour
	scheduleCronJob('0 0 */1 * * *', {
		title: 'enqueueToCreateMonthlyPlan',
		func: enqueueToCreateMonthlyPlan,
	});
}

export default enqueueToCreateMonthlyPlanCronJob;
