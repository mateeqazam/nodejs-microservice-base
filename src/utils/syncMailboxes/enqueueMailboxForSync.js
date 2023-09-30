import log from '../log';
import { getTimeAgo } from '../helpers';
import syncMailboxQueue from '../../queues/syncMailbox';
import checkJobExists from '../../lib/Queue/checkJobExists';
import { generateSyncMailboxJobKey } from '../helpers/generateJobKey';

async function enqueueMailboxForSync(mailbox) {
	try {
		if (!mailbox || !mailbox.email) throw new Error('Invalid Mailbox');

		const jobKey = generateSyncMailboxJobKey(mailbox);
		if (!jobKey) throw new Error('Unable to generate job key');

		const jobExists = await checkJobExists(syncMailboxQueue, jobKey);
		if (jobExists) return { enqueued: false };

		const thirtyMinutesAgo = getTimeAgo({ minutes: 30 });
		const searchCriteria = ['ALL', ['SINCE', thirtyMinutesAgo.toISOString()]];
		const jobData = { mailbox, filter: searchCriteria };
		await syncMailboxQueue.add(jobKey, jobData);
		return { enqueued: true };
	} catch (error) {
		const errorMessage = `[enqueueMailboxForSync] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox } });
		return { error };
	}
}

export default enqueueMailboxForSync;
