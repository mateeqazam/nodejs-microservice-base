import setupRecurringJob from '../utils/setupRecurringJob';
import emailReplyBounceCheckQueue from '../queues/emailReplyBounceCheck';

async function checkForReplyOrBounceCronJob() {
	await setupRecurringJob(emailReplyBounceCheckQueue, {
		jobKey: 'replyBounceCheckCronJob',
		repeatRule: {
			every: 10 * 60 * 1000, // Repeat every 10 minutes
		},
	});
}

export default checkForReplyOrBounceCronJob;
