import { map } from 'lodash';

import { isNonEmptyArray } from '../../helpers';

function calculateSpamScore(spamScores) {
	if (!isNonEmptyArray(spamScores)) return null;

	return map(spamScores, (scoreItem) => {
		const { date, inboxEmailCount = 0, flaggedEmailCount = 0 } = scoreItem || {};
		const totalEmails = inboxEmailCount + flaggedEmailCount;
		return {
			date,
			spamRate: Math.round((flaggedEmailCount * 100) / totalEmails) || 0,
			reputation: Math.round((inboxEmailCount * 100) / totalEmails) || 0,
		};
	});
}

export default calculateSpamScore;
