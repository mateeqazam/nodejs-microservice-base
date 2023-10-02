import logger from '../logger';
import CampaignFlowModel from '../../models/campaignFlow';
import EmailsToBeScheduledModel from '../../models/emailsToBeScheduled';

async function getVariantsWithCount(filterParams) {
	try {
		const statusesToRetrieve = ['completed', 'queued'];

		const pipeline = [
			{
				$match: {
					...(filterParams || {}),
					stepType: 'email',
					$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
				},
			},
			{ $unwind: '$emailVariants' },
			{
				$match: {
					$and: [
						{
							$or: [
								{ 'emailVariants.isPause': false },
								{ 'emailVariants.isPause': { $exists: false } },
							],
						},
						{
							$or: [
								{ 'emailVariants.deletedAt': { $exists: false } },
								{ 'emailVariants.deletedAt': null },
							],
						},
					],
				},
			},
			{
				$project: {
					_id: 0,
					campaign: '$campaign',
					flowNodeItem: '$_id',
					variant: '$emailVariants._id',
				},
			},
			{
				$lookup: {
					from: EmailsToBeScheduledModel.collectionName,
					let: { campaign: '$campaign', flowNodeItem: '$flowNodeItem', variant: '$variant' },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ['$campaign', '$$campaign'] },
										{ $eq: ['$flowNodeItem', '$$flowNodeItem'] },
										{ $eq: ['$variant', '$$variant'] },
										{ $in: ['$status', statusesToRetrieve] },
									],
								},
								$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
							},
						},
						{
							$project: {
								campaignSimulationStep: 1,
								sender: 1,
								prospect: 1,
								createdAt: 1,
								updatedAt: 1,
							},
						},
					],
					as: 'scheduledAndCompletedEmails',
				},
			},
			{
				$project: {
					campaign: 1,
					variant: 1,
					campaignFlowNode: '$_id',
					count: { $size: '$scheduledAndCompletedEmails' },
				},
			},
		];

		return CampaignFlowModel.aggregate(pipeline);
	} catch (error) {
		const errorMessage = `[getVariantsWithCount] Exception: ${error?.message}`;
		logger.dbError(errorMessage, { error, param: { filterParams } });
		return null;
	}
}

export default getVariantsWithCount;
