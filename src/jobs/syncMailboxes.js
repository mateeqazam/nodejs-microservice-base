import log from '../utils/log';
import syncMailboxes from '../utils/syncMailboxes';

async function syncMailboxesJob(job) {
	try {
		const { error } = await syncMailboxes(job?.data);
		if (error) throw new Error(error);

		return { success: true, data: job?.data };
	} catch (error) {
		const errorMessage = `[syncMailboxesJob] Exception: ${error.message}`;
		log.error(errorMessage, { error, jobParams: job });
		throw new Error(error || 'Something went wrong');
	}
}

export default syncMailboxesJob;
