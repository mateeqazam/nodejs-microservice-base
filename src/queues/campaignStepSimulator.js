import createQueueAndWorker from '../lib/Queue';
import simulateCampaignStepJob from '../jobs/simulateCampaignStep';

const queueTitle = 'campaign-step-simulator-queue';
const { queue: campaignStepSimulatorQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: simulateCampaignStepJob,
});

export const campaignStepSimulatorWorker = worker;
export default campaignStepSimulatorQueue;
