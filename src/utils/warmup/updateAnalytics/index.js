import { isToday } from '../../helpers/date';
import WarmupAnalyticsModel from '../../../models/warmupAnalytics';

import getSpamStats from './getSpamStats';
import getEmailStats from './getEmailStats';

async function updateWarmupAnalytics({ mailboxId }) {
	// TODO: add constants for maxDays and minDays
	const result = await Promise.all([
		getEmailStats(mailboxId, 10, 1825),
		getSpamStats(mailboxId, 10, 1825, 7),
	]);

	const todayStats = result[0].find((v) => isToday(v.date));

	return WarmupAnalyticsModel.updateOne({
		filter: { mailbox: mailboxId.toString() },
		write: {
			emailCountTimeline: result[0],
			todayEmailCount: todayStats?.emailCount || 0,
			todayReplyCount: todayStats?.replyCount || 0,
			spamScoreTimeline: result[1]?.spamScoreTimeline,
			cumulativeSpamRate: result[1]?.cumulativeSpamRate,
			cumulativeReputation: result[1]?.cumulativeReputation,
		},
		upsert: true,
	});
}

export default updateWarmupAnalytics;
