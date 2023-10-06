import { MS_IN_DAY } from '../../../constants';
import SentEmailModel from '../../../models/sentEmail';
import { ObjectId } from '../../../lib/Mongoose/constants';

async function getEmailStats(mailboxId, currentDate, daysToStart = 100) {
	const startDate = new Date(currentDate - daysToStart * MS_IN_DAY);

	return SentEmailModel.aggregate([
		{ $match: { from: new ObjectId(mailboxId), date: { $gte: startDate, $lte: currentDate } } },
		{
			$group: {
				_id: '$date',
				emailCount: { $sum: { $cond: { if: { $eq: ['$isReply', false] }, then: 1, else: 0 } } },
				replyCount: { $sum: { $cond: { if: { $eq: ['$isReply', true] }, then: 1, else: 0 } } },
			},
		},
		// { $match: { $expr: { $gt: [{ $add: ['$emailCount', '$replyCount'] }, 2] } } },
		{ $project: { _id: 0, date: '$_id', emailCount: 1, replyCount: 1 } },
		{ $sort: { date: -1 } },
		{ $limit: 30 },
	]);
}

export default getEmailStats;
