import scheduleCronJob from '../utils/scheduleCronJob';
import enqueueToPositiveInteract from '../utils/warmup/enqueueToPositiveInteract';

function enqueueToPositiveInteractCronJob() {
	// every 20 mins
	scheduleCronJob('0 */20 * * * *', {
		title: 'enqueueToPositiveInteract',
		func: enqueueToPositiveInteract,
	});
}

export default enqueueToPositiveInteractCronJob;
