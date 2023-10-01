import createQueueAndWorker from '../lib/Queue';
import simulateCampaignJob from '../jobs/simulateCampaign';

const queueTitle = 'campaign-simulator-queue';
const { queue: campaignSimulatorQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: simulateCampaignJob,
	queueOptions: {
		limiter: { max: 100, duration: 2000 },
	},
	workerOptions: { concurrency: 50 },
});

export const campaignSimulatorWorker = worker;
export default campaignSimulatorQueue;
