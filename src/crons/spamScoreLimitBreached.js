import { forEach } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../utils/logger';
import { PRIBOX_SENDER_EMAIL } from '../constants';
import { isNonEmptyArray } from '../utils/helpers';
import sendSystemEmail from '../utils/sendSystemEmail';
import scheduleCronJob from '../utils/scheduleCronJob';
import WarmupAnalyticsModel from '../models/warmupAnalytics';
import notificationTemplate from '../emailTemplates/notification';

async function notifySpamLimitBreached(params) {
	try {
		const { userEmail, firstName, mailboxEmail } = params || {};
		if (!userEmail || !mailboxEmail) throw new Error('Missing Required Emails');

		await sendSystemEmail({
			from: PRIBOX_SENDER_EMAIL,
			to: userEmail,
			subject: 'Pribox - SPAM limit breached',
			html: notificationTemplate(
				firstName,
				'Pribox - Action Required',
				`Your mailbox, ${mailboxEmail} has breached the SPAM limit of 15%. We advise you to investigate to protect your domain reputation.
          <br/><br/>
          Enjoy using Pribox!
        `
			),
		});
	} catch (error) {
		const errorMessage = `[notifySpamLimitBreached] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params });
	}
}

async function spamScoreLimitBreached() {
	const spamBreachedMailboxes = await WarmupAnalyticsModel.find({
		filter: { cumulativeSpamRate: { $gt: 15 } },
		populate: {
			path: 'mailbox',
			match: { deletedAt: null, status: 'active' },
			populate: [{ path: 'owner' }],
		},
		skipLimit: true,
	});

	if (!isNonEmptyArray(spamBreachedMailboxes)) return;

	const promises = [];
	const pLimit = promiseLimit(10);
	forEach(spamBreachedMailboxes, (boxItem) => {
		if (!boxItem || !boxItem.mailbox) return;

		const { mailbox } = boxItem;
		const mailboxEmail = mailbox?.email || '';
		const userEmail = mailbox?.owner?.email || '';
		const firstName = mailbox?.owner?.profile?.firstName || '';
		if (!userEmail || userEmail?.length <= 0) return;

		promises.push(pLimit(() => notifySpamLimitBreached({ mailboxEmail, userEmail, firstName })));
	});

	await Promise.all(promises);
}

function spamScoreLimitBreachedCronJob() {
	// every midnight
	scheduleCronJob('0 0 0 * * *', {
		title: 'spamScoreLimitBreached',
		func: spamScoreLimitBreached,
	});
}

export default spamScoreLimitBreachedCronJob;
