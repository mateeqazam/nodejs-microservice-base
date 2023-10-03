import promiseLimit from 'promise-limit';
import { filter, isNil, map } from 'lodash';

import logger from '../utils/logger';
import { isNonEmptyArray } from '../utils/helpers';
import { PRIBOX_SENDER_EMAIL } from '../constants';
import scheduleCronJob from '../utils/scheduleCronJob';
import sendSystemEmail from '../utils/sendSystemEmail';
import SpamScoreEmailModel from '../models/spamScoreEmail';
import WarmupAnalyticsModel from '../models/warmupAnalytics';
import notificationTemplate from '../emailTemplates/notification';

async function processSpamScoreEmailItem(resultItem) {
	if (!resultItem || !resultItem._id) return;

	try {
		const { _id, mailbox, createdBy } = resultItem;
		const receiverIds = await WarmupAnalyticsModel.find({
			filter: {
				mailbox: { $in: map(mailbox, '_id') },
				$or: [{ cumulativeSpamRate: { $gt: 0 } }, { cumulativeReputation: { $gt: 0 } }],
			},
			skipLimit: true,
		});

		if (!isNonEmptyArray(receiverIds)) return;

		const mailboxesEmail = filter(map(mailbox, 'email'), isNil);
		const emails = mailboxesEmail.join(',');

		const { email, profile } = createdBy || {};
		await sendSystemEmail({
			from: PRIBOX_SENDER_EMAIL,
			to: email,
			subject: 'Pribox - Successfully Calculated your SPAM score and Domain Authority',
			html: notificationTemplate(
				profile?.firstName,
				'Pribox - Action Required',
				`We have successfully calculated your SPAM score and Domain Authority of ${emails}. Please open the dashboard <a href="https://app.pribox.io/dashboard/Email-Warmup-Analytics" color="blue" style="text-decoration:underline;" text-decoration ="underline" target="_blank">Pribox dashboard</a> to view it.
								<br/><br/>
								Enjoy using Pribox!
								`
			),
		});

		await SpamScoreEmailModel.updateOne({
			filter: { _id },
			write: { isSpam: true, isSend: true },
		});
	} catch (error) {
		const errorMessage = `[processSpamScoreEmailItem] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: resultItem });
	}
}

async function spamScoreEmails() {
	const results = await SpamScoreEmailModel.find({
		filter: { isSpam: false, isSend: false },
		select: { createdBy: 1, mailbox: 1 },
	});

	const pLimit = promiseLimit(10);
	await Promise.all(
		map(results, (resultItem) => pLimit(() => processSpamScoreEmailItem(resultItem)))
	);
}

function spamScoreEmailsCronJob() {
	// 30th minute of every 2nd hour,
	scheduleCronJob('30 */2 * * *', {
		title: 'spamScoreEmails',
		func: spamScoreEmails,
	});
}

export default spamScoreEmailsCronJob;
