import { isNonEmptyArray } from '../helpers';
import CampaignModel from '../../models/campaign';
import CampaignScheduleModel from '../../models/campaignSchedule';

// TODO: Optimize the query: check if the current time is within the campaign schedule.
async function getActiveCampaignsWithSchedule(filterParams) {
	const currentTimeStamp = new Date();
	const pipeline = [
		{
			$match: {
				...(filterParams || {}),
				status: 'active',
				'duration.startingAt': { $lte: currentTimeStamp },
				'duration.endingAt': { $gte: currentTimeStamp },
				$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
			},
		},
		{
			$lookup: {
				from: CampaignScheduleModel.collectionName,
				localField: 'selectedSchedule',
				foreignField: '_id',
				as: 'schedules',
			},
		},
		{ $addFields: { schedule: { $arrayElemAt: ['$schedules', 0] } } },
		{
			$project: {
				_id: 1,
				name: 1,
				duration: 1,
				sender: 1,
				openTracking: 1,
				linkTracking: 1,
				donotSendToResponders: 1,
				schedule: 1,
			},
		},
	];

	return CampaignModel.aggregate(pipeline);
}

export async function getActiveCampaignWithSchedule(filterParams) {
	const activeCampaigns = await getActiveCampaignsWithSchedule(filterParams);
	return isNonEmptyArray(activeCampaigns) ? activeCampaigns[0] : null;
}

export default getActiveCampaignsWithSchedule;
