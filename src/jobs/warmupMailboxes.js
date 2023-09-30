import log from '../utils/log';
import warmupMailboxes from '../utils/warmupMailboxes';

async function warmupMailboxesJob(job) {
	try {
		const { error } = await warmupMailboxes(job?.data);
		if (error) throw new Error(error);

		return { success: true, data: job?.data };
	} catch (error) {
		const errorMessage = `[warmupMailboxesJob] Exception: ${error.message}`;
		log.error(errorMessage, { error, jobParams: job });
		throw new Error(error || 'Something went wrong');
	}
}

export default warmupMailboxesJob;
