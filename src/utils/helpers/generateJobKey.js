import moment from 'moment';

export function generateCampaignStepJobKey(prefix, stepParams) {
	const { campaignId, prospectId, stepNode } = stepParams || {};
	if (!campaignId || !prospectId || !stepNode || !stepNode._id) return null;

	const { _id: stepNodeId, stepType = 'step' } = stepNode || {};
	return `${prefix || 'campaign-step'}-${campaignId}~${prospectId}~${stepType}~${stepNodeId}`;
}

export const generateCampaignStepSimulatorJobKey = (stepParams) =>
	generateCampaignStepJobKey('campaign-step-simulator', stepParams);

export function generateEmailSenderJobKey(jobParams) {
	const { senderId, variantId, prospectId, campaignId, stepItemId, nodeItemId } = jobParams || {};
	if (!senderId || !prospectId || !variantId) return null;

	let jobKey = `send-email-${senderId}~${prospectId}~${variantId}`;
	if (campaignId) jobKey = `${jobKey}~campaign:${campaignId}`;
	if (stepItemId) jobKey = `${jobKey}~step:${stepItemId}`;
	if (nodeItemId) jobKey = `${jobKey}~node:${nodeItemId}`;

	return jobKey;
}

export function generateScheduleEmailsCronJobKey(nextTargetMoment) {
	if (!nextTargetMoment) return null;
	return `schedule-emails-${moment(nextTargetMoment).format('YY-MM-DD-HH-mm')}`;
}
