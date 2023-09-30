import createQueueAndWorker from '../lib/Queue';
import syncMailboxJob from '../jobs/syncMailbox';

const queueTitle = 'sync-mailbox';
const { queue: syncMailboxQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: syncMailboxJob,
});

export const syncMailboxWorker = worker;
export default syncMailboxQueue;
