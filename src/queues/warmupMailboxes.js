import createQueueAndWorker from '../lib/Queue';
import warmupMailboxesJob from '../jobs/warmupMailboxes';

const queueTitle = 'warmup-mailboxes-queue';
const { queue: warmupMailboxesQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: warmupMailboxesJob,
});

export const warmupMailboxesWorker = worker;
export default warmupMailboxesQueue;
