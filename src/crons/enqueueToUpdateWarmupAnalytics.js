import scheduleCronJob from '../utils/scheduleCronJob';
import enqueueToUpdateWarmupAnalytics from '../utils/warmup/enqueueToUpdateWarmupAnalytics';

function enqueueToUpdateWarmupAnalyticsCronJob() {
	// every 2 hours
	scheduleCronJob('0 0 */2 * * *', {
		title: 'enqueueToUpdateWarmupAnalytics',
		func: enqueueToUpdateWarmupAnalytics,
	});
}

export default enqueueToUpdateWarmupAnalyticsCronJob;
