import logger from '../logger';
import CampaignModel from '../../models/campaign';

async function getActiveCampaignById(campaignId) {
	if (!campaignId) throw new Error('Missing Required Campaign Id');

	try {
		const currentTimeStamp = new Date();
		const filter = {
			_id: campaignId,
			status: 'active',
			'duration.startingAt': { $lte: currentTimeStamp },
			'duration.endingAt': { $gte: currentTimeStamp },
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
		};

		const select = {
			name: 1,
			sender: 1,
			prospects: 1,
			excludeProspects: 1,
			selectedSchedule: 1,
			sendTo: 1,
			donotSendTo: 1,
			missingVariableCase: 1,
		};

		const activeCampaign = await CampaignModel.findOne({ filter, select });
		return activeCampaign;
	} catch (error) {
		const errorMessage = `[getActiveCampaignById] Exception: ${error?.message}`;
		logger.dbError(errorMessage, { error, params: { campaignId } });
		throw error;
	}
}

export default getActiveCampaignById;
