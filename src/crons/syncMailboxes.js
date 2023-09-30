import syncMailboxesQueue from '../queues/syncMailboxes';
import setupRecurringJob from '../utils/setupRecurringJob';

async function syncMailboxesCronJob() {
	await setupRecurringJob(syncMailboxesQueue, {
		jobKey: 'syncMailboxesCronJob',
		repeatRule: {
			every: 10 * 60 * 1000, // Repeat every 10 minutes
		},
	});
}

export default syncMailboxesCronJob;
