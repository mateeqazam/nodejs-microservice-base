import log from '../utils/log';
import syncMailbox from '../utils/syncMailbox';

async function syncMailboxJob(job) {
	try {
		const { error } = await syncMailbox(job?.data);
		if (error) throw new Error(error);

		return { success: true, data: job?.data };
	} catch (error) {
		const errorMessage = `[syncMailboxJob] Exception: ${error.message}`;
		log.error(errorMessage, { error, jobParams: job });
		throw new Error(error || 'Something went wrong');
	}
}

export default syncMailboxJob;
