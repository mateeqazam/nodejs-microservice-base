import createQueueAndWorker from '../lib/Queue';
import warmupMailboxJob from '../jobs/warmpupMailbox';

const queueTitle = 'warmup-mailbox-queue';
const { queue: warmupMailboxQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: warmupMailboxJob,
});

export const warmupMailboxWorker = worker;
export default warmupMailboxQueue;
