import createQueueAndWorker from '../lib/Queue';
import createMonthlyPlanJob from '../jobs/createMonthlyPlan';

const queueTitle = 'create-monthly-plan-queue';
const { queue: createMonthlyPlanQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: createMonthlyPlanJob,
});

export const createMonthlyPlanWorker = worker;
export default createMonthlyPlanQueue;
