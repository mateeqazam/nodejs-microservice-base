import createQueueAndWorker from '../lib/Queue';
import processCampaignGoalStepJob from '../jobs/processCampaignGoalStep';

const queueTitle = 'campaign-goal-step-processor-queue';
const { queue: campaignGoalStepProcessorQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: processCampaignGoalStepJob,
});

export const campaignGoalStepProcessorWorker = worker;
export default campaignGoalStepProcessorQueue;
