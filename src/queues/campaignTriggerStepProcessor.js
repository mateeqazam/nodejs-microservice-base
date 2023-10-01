import createQueueAndWorker from '../lib/Queue';
import processCampaignTriggerStepJob from '../jobs/processCampaignTriggerStep';

const queueTitle = 'campaign-trigger-step-processor-queue';
const { queue: campaignTriggerStepProcessorQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: processCampaignTriggerStepJob,
});

export const campaignTriggerStepProcessorWorker = worker;
export default campaignTriggerStepProcessorQueue;
