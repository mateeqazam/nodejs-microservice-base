import createQueueAndWorker from '../lib/Queue';
import syncMailboxesJob from '../jobs/syncMailboxes';

const queueTitle = 'sync-mailboxes';
const { queue: syncMailboxesQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: syncMailboxesJob,
});

export const syncMailboxesWorker = worker;
export default syncMailboxesQueue;
