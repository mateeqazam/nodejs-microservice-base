import warmupMailboxesQueue from '../queues/warmupMailboxes';
import setupRecurringJob from '../utils/setupRecurringJob';

async function warmupMailboxesCronJob() {
	await setupRecurringJob(warmupMailboxesQueue, {
		jobKey: 'warmupMailboxesCronJob',
		repeatRule: {
			every: 30 * 60 * 1000, // Repeat every 30 minutes
		},
	});
}

export default warmupMailboxesCronJob;
