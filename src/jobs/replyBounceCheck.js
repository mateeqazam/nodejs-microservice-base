import log from '../utils/log';
import checkForReplyOrBounceCronJob from '../utils/checkForReplyOrBounce';

async function replyBounceCheckJob(job) {
	try {
		const { error } = await checkForReplyOrBounceCronJob();
		if (error) throw new Error(error);

		return { success: true, data: job?.data };
	} catch (error) {
		const errorMessage = `[replyBounceCheckJob] Exception: ${error.message}`;
		log.error(errorMessage, { error, jobParams: job });
		throw new Error(error || 'Something went wrong');
	}
}

export default replyBounceCheckJob;
