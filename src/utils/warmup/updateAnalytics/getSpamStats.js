import { MS_IN_DAY } from '../../../constants';
import { getTodayDate } from '../../helpers/date';
import SpamScoreModel from '../../../models/spamScore';
import { ObjectId } from '../../../lib/Mongoose/constants';
import adjustForMinDayCount from '../helpers/adjustForMinDayCount';

async function getSpamStats(mailboxId, minDays, maxDays, cumulativeDaysCount) {
	const startDate = new Date(getTodayDate() - maxDays * MS_IN_DAY);

	const spamScores = await SpamScoreModel.findOne({
		filter: {
			mailbox: ObjectId(mailboxId),
			date: { $gte: startDate, $lte: new Date() },
		},
		sort: { date: 1 },
	});

	let cumulativeFlaggedEmailCount = 0;
	let cumulativeInboxEmailCount = 0;

	const spamScoreTimeline = adjustForMinDayCount(
		spamScores,
		minDays,
		{ inboxEmailCount: 0, flaggedEmailCount: 0 },
		{ sort: true, fillEmptyDaysWithPrevDays: true }
	).map(({ date, flaggedEmailCount, inboxEmailCount }, i) => {
		const adjustedInboxEmailCount = inboxEmailCount || 0;
		const adjustedFlaggedEmailCount = flaggedEmailCount || 0;

		if (spamScores.length - i <= cumulativeDaysCount) {
			cumulativeFlaggedEmailCount += adjustedFlaggedEmailCount;
			cumulativeInboxEmailCount += adjustedInboxEmailCount;
		}

		const totalEmails = adjustedInboxEmailCount + adjustedFlaggedEmailCount;
		return {
			date,
			spamRate: Math.round((adjustedFlaggedEmailCount * 100) / totalEmails) || 0,
			reputation: Math.round((adjustedInboxEmailCount * 100) / totalEmails) || 0,
		};
	});

	cumulativeFlaggedEmailCount /= Math.min(cumulativeDaysCount, spamScores.length);
	cumulativeInboxEmailCount /= Math.min(cumulativeDaysCount, spamScores.length);

	const totalCumulativeEmailCount = cumulativeFlaggedEmailCount + cumulativeInboxEmailCount;
	return {
		spamScoreTimeline,
		cumulativeSpamRate:
			Math.round((cumulativeFlaggedEmailCount * 100) / totalCumulativeEmailCount) || 0,
		cumulativeReputation:
			Math.round((cumulativeInboxEmailCount * 100) / totalCumulativeEmailCount) || 0,
	};
}

export default getSpamStats;
