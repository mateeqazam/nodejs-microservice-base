import createQueueAndWorker from '../lib/Queue';
import updateWarmupAnalyticsJob from '../jobs/updateWarmupAnalytics';

const queueTitle = 'update-warmup-analytics-queue';
const { queue: updateWarmupAnalyticsQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: updateWarmupAnalyticsJob,
});

export const positiveInteractWorker = worker;
export default updateWarmupAnalyticsQueue;
