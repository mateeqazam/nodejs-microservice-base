import logger from '../utils/logger';
import parseJobParams from '../utils/helpers/parseJobParams';

async function scheduleEmailsJob(job) {
	try {
		const { name: jobName } = job || {};
		logger.debug(`[scheduleEmailsJob] Job "${jobName}" started at ${new Date()}`);

		// await scheduleEmails();

		logger.debug(`[scheduleEmailsJob] Job "${jobName}" completed at ${new Date()}`);
		return { success: true, data: { jobName } };
	} catch (error) {
		const errorMessage = `[scheduleEmailsJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job) });
		throw new Error(error || 'Something went wrong');
	}
}

export default scheduleEmailsJob;
