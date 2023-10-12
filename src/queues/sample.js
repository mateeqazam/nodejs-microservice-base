import createQueueAndWorker from '../lib/Queue';
import demoJob from '../jobs/demo';

const queueTitle = 'demo-queue';
const { queue: demoQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: demoJob,
});

export const demoWorker = worker;
export default demoQueue;
