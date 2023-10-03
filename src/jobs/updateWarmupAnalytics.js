import logger from '../utils/logger';
import parseJobParams from '../utils/helpers/parseJobParams';
import updateWarmupAnalytics from '../utils/warmup/updateAnalytics';

async function updateWarmupAnalyticsJob(job, additionalParams) {
	try {
		const { mailboxId } = job?.data || {};
		const { logUnsuccessfulJob } = additionalParams || {};
		if (!mailboxId) return logUnsuccessfulJob('Missing Required Mailbox Id.');

		await updateWarmupAnalytics(mailboxId);

		return { success: true, data: { mailboxId } };
	} catch (error) {
		const errorMessage = `[updateWarmupAnalyticsJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job) });
		throw new Error(error || 'Something went wrong');
	}
}

export default updateWarmupAnalyticsJob;
