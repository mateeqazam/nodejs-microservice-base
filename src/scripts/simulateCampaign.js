import campaignSimulatorQueue from '../queues/campaignSimulator';

async function simulateCampaignScript() {
	const campaignId = '650c38eb5143d0b85d1d5e76';
	await campaignSimulatorQueue.add(`campaign-simulator-${campaignId}`, { campaignId });
}

export default simulateCampaignScript;
