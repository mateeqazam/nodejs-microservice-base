import createQueueAndWorker from '../lib/Queue';
import processCampaignDelayStepJob from '../jobs/processCampaignDelayStep';

const queueTitle = 'campaign-delay-step-processor-queue';
const { queue: campaignDelayStepProcessorQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: processCampaignDelayStepJob,
});

export const campaignDelayStepProcessorWorker = worker;
export default campaignDelayStepProcessorQueue;
