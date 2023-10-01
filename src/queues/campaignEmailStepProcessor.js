import createQueueAndWorker from '../lib/Queue';
import processCampaignEmailStepJob from '../jobs/processCampaignEmailStep';

const queueTitle = 'campaign-email-step-processor-queue';
const { queue: campaignEmailStepProcessorQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: processCampaignEmailStepJob,
});

export const campaignEmailStepProcessorWorker = worker;
export default campaignEmailStepProcessorQueue;
