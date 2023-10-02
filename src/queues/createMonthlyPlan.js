import createQueueAndWorker from '../lib/Queue';
import createMonthlyPlanJob from '../jobs/createMonthlyPlan';

const queueTitle = 'create-monthly-plan-queue';
const { queue: scheduleEmailsQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: createMonthlyPlanJob,
	queueOptions: {
		limiter: {
			max: 500,
			duration: 60000,
			bounceBack: false,
		},
		defaultJobOptions: {
			timeout: 36000000,
			attempts: 3,
			backoff: 60000,
			delay: 0,
			priority: 3,
			removeOnComplete: true,
			removeOnFail: true,
		},
		settings: {
			retryProcessDelay: 500,
		},
	},
});

export const scheduleEmailsWorker = worker;
export default scheduleEmailsQueue;
