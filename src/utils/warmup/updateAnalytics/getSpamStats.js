import { sumBy } from 'lodash';

import { MS_IN_DAY } from '../../../constants';
import { sortByDateKey } from '../../helpers/date';
import SpamScoreModel from '../../../models/spamScore';
import { ObjectId } from '../../../lib/Mongoose/constants';
import fillMissingDates from '../helpers/fillMissingDates';
import calculateSpamScore from '../helpers/calculateSpamScore';

async function getSpamStats(mailboxId, currentDate, daysToStart = 100) {
	const startDate = new Date(currentDate - daysToStart * MS_IN_DAY);
	const minDays = 30;
	const cumulativeDaysCount = 3;

	const spamScoresResult = await SpamScoreModel.find({
		filter: {
			mailbox: new ObjectId(mailboxId),
			date: { $gte: startDate, $lte: currentDate },
		},
		sort: { date: 1 },
		limit: minDays,
	});

	const spamScores = fillMissingDates(spamScoresResult);
	const spamScoreTimeline = calculateSpamScore(spamScores);

	const effectiveCumulativeDaysCount = Math.min(cumulativeDaysCount, spamScores?.length);

	const effectiveSpamScores = sortByDateKey(spamScores).slice(
		Math.max(spamScores.length - effectiveCumulativeDaysCount, 0)
	);

	const cumulativeInboxEmailCount = sumBy(effectiveSpamScores, 'inboxEmailCount') || 0;
	const cumulativeFlaggedEmailCount = sumBy(effectiveSpamScores, 'flaggedEmailCount') || 0;
	const totalCumulativeEmailCount = cumulativeInboxEmailCount + cumulativeFlaggedEmailCount;

	return {
		spamScoreTimeline,
		cumulativeSpamRate:
			Math.round((cumulativeFlaggedEmailCount * 100) / totalCumulativeEmailCount) || 0,
		cumulativeReputation:
			Math.round((cumulativeInboxEmailCount * 100) / totalCumulativeEmailCount) || 0,
	};
}

export default getSpamStats;
