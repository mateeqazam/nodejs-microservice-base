import { isNonEmptyArray } from '../helpers';
import MailboxModel from '../../models/mailbox';
import { getStartDayTime, getEndDayTime } from '../helpers/date';
import EmailsToBeScheduledModel from '../../models/emailsToBeScheduled';

async function getActiveSendersWithTodayCount(senderIds, isWarmpUp = false) {
	if (!isNonEmptyArray(senderIds)) return null;

	const todayQuery = { $gte: getStartDayTime(), $lte: getEndDayTime() };
	const pipeline = [
		{
			$match: {
				$match: {
					$and: [
						{ status: 'active', 'config.messagePerDay': { $gt: 0 } },
						{ $or: [{ isWarmpUp }, { _id: { $in: senderIds } }] },
						{ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
					],
				},
			},
		},
		{ $project: { _id: 1, email: 1, config: 1 } },
		{
			$lookup: {
				from: EmailsToBeScheduledModel.collectionName,
				let: { sid: '$_id' },
				pipeline: [
					{
						$match: {
							$expr: { $in: ['$senderId', '$$sid'] },
							status: { $in: ['completed', 'scheduled'] },
							$and: [
								{
									$or: [{ sentAt: todayQuery }, { scheduledAt: todayQuery }],
								},
								{
									$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
								},
							],
						},
					},
					{ $group: { _id: '$senderId', count: { $sum: 1 } } },
				],
				as: 'todayEmailsCount',
			},
		},
		{ $project: { _id: 1, email: 1, config: 1, todayEmailsCount: 1 } },
	];

	return MailboxModel.aggregate(pipeline);
}

export default getActiveSendersWithTodayCount;
