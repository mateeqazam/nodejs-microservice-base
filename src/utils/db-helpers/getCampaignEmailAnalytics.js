import CampaignModel from '../../models/campaign';

async function getCampaignEmailAnalytics(timestamp) {
	const pipeline = [
		{
			$match: {
				status: { $ne: 'draft' },
				'duration.endingAt': { $gte: timestamp },
				deletedAt: null,
			},
		},
		{
			$lookup: {
				from: 'campaign_flows',
				localField: '_id',
				foreignField: 'campaign',
				as: 'flows',
			},
		},
		{ $unwind: { path: '$flows' } },
		{ $match: { 'flows.stepType': 'email' } },
		{
			$group: {
				_id: {
					id: '$_id',
					name: '$name',
					status: '$status',
					prospects: '$prospects',
				},
				totalEmails: { $sum: 1 },
			},
		},
		{
			$lookup: {
				from: 'lists',
				let: { prospectsId: '$_id.prospects' },
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$_id', '$$prospectsId'],
							},
						},
					},
				],
				as: 'prospects',
			},
		},
		{ $set: { count: { $first: '$prospects.prospectCount' } } },
		{ $set: { totalEmails: { $multiply: ['$totalEmails', '$count'] } } },
		{
			$lookup: {
				from: 'campaign_analytics',
				let: { campaignId: '$_id.id' },
				pipeline: [
					{
						$match: {
							created_At: {
								$gte: timestamp,
							},
							total_emails_sent: {
								$gte: 1,
							},
							$expr: {
								$eq: ['$campaign_id', '$$campaignId'],
							},
						},
					},
				],
				as: 'sentEmailCampaign',
			},
		},
		{ $set: { campaignName: '$_id.name', campaignStatus: '$_id.status' } },
		{
			$project: {
				_id: 0,
				campaignName: 1,
				totalEmails: 1,
				campaignStatus: 1,
				sentEmails: {
					$cond: {
						if: { $isArray: '$sentEmailCampaign' },
						then: { $size: '$sentEmailCampaign' },
						else: 0,
					},
				},
			},
		},
	];

	return CampaignModel.aggregate(pipeline);
}

export default getCampaignEmailAnalytics;
