import log from '../utils/log';
import warmupMailbox from '../utils/warmupMailbox';

async function warmupMailboxJob(job) {
	try {
		const { error } = await warmupMailbox(job?.data);
		if (error) throw new Error(error);

		return { success: true, data: job?.data };
	} catch (error) {
		const errorMessage = `[warmupMailboxJob] Exception: ${error.message}`;
		log.error(errorMessage, { error, jobParams: job });
		throw new Error(error || 'Something went wrong');
	}
}

export default warmupMailboxJob;
