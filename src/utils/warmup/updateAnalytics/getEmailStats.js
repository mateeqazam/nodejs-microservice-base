import { MS_IN_DAY } from '../../../constants';
import { getTodayDate } from '../../helpers/date';
import SentEmailModel from '../../../models/sentEmail';
import { ObjectId } from '../../../lib/Mongoose/constants';
import adjustForMinDayCount from '../helpers/adjustForMinDayCount';

async function getEmailStats(mailboxId, minDays, maxDays) {
	const startDate = new Date(getTodayDate() - maxDays * MS_IN_DAY);

	const emailStats = await SentEmailModel.aggregate([
		{
			$match: {
				from: ObjectId(mailboxId),
				isReply: false,
				date: { $gte: startDate, $lte: new Date() },
			},
		},
		{
			$group: {
				_id: '$date',
				emailCount: { $sum: 1 },
				messageIds: { $push: '$messageId' },
			},
		},
		{ $addFields: { replyCount: 0 } },
		{ $sort: { _id: 1 } },
		{ $project: { date: '$_id', _id: 0, emailCount: 1, replyCount: 1, messageIds: 1 } },
	]);

	const replyCursor = SentEmailModel.aggregate(
		[
			{ $match: { inReplyTo: { $in: emailStats.flatMap((v) => v.messageIds) } } },
			{ $sort: { date: 1 } },
			{ $project: { inReplyTo: 1, date: 1 } },
		],
		{ allowDiskUse: true }
	);

	let lastCorrectIndex = null;
	// eslint-disable-next-line no-restricted-syntax
	for await (const reply of replyCursor) {
		if (lastCorrectIndex !== null) {
			const isLastIndexCorrect = emailStats[lastCorrectIndex].messageIds.includes(reply.inReplyTo);
			if (isLastIndexCorrect) {
				emailStats[lastCorrectIndex].replyCount += 1;
			}
		} else {
			const potentialIndex = emailStats.findIndex(
				(v) => new Date(v.date).toISOString() === new Date(reply.date).toISOString()
			);

			if (potentialIndex !== -1) {
				const isIndexCorrect = emailStats[potentialIndex].messageIds.includes(reply.inReplyTo);
				if (isIndexCorrect) {
					emailStats[potentialIndex].replyCount += 1;
					lastCorrectIndex = potentialIndex;
				} else {
					const pastEmailCounts = emailStats
						.slice(Math.max(potentialIndex - 5, 0), potentialIndex)
						.reverse();

					pastEmailCounts.some((pastItem, i) => {
						const currentIndex = potentialIndex - i - 1;
						const isPastItemCorrect = pastItem.messageIds.includes(reply.inReplyTo);
						if (isPastItemCorrect) {
							emailStats[currentIndex].replyCount += 1;
							return true;
						}
						return false;
					});
				}
			}
		}
	}

	const cleanedEmailStats = emailStats.map(({ messageIds, ...rest }) => rest);
	return adjustForMinDayCount(cleanedEmailStats, minDays, {
		emailCount: 0,
		replyCount: 0,
	});
}

export default getEmailStats;
