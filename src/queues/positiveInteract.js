import createQueueAndWorker from '../lib/Queue';
import positiveInteractJob from '../jobs/positiveInteract';

const queueTitle = 'positive-interaction-queue';
const { queue: positiveInteractQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: positiveInteractJob,
});

export const positiveInteractWorker = worker;
export default positiveInteractQueue;
