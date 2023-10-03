import { map } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../logger';
import { isNonEmptyArray } from '../helpers';
import MailboxModel from '../../models/mailbox';
import updateWarmupAnalyticsQueue from '../../queues/updateWarmupAnalytics';

async function enqueueToUpdateWarmupAnalytics() {
	try {
		const mailboxes = await MailboxModel.find({
			filter: {
				isWarmUp: true,
				status: 'active',
				deletedAt: { $exists: false },
			},
			select: { _id: 1 },
			skipLimit: true,
		});
		if (!isNonEmptyArray(mailboxes)) return;

		const pLimit = promiseLimit(20);
		await Promise.all(
			map(mailboxes, (mailbox) =>
				pLimit(() =>
					updateWarmupAnalyticsQueue.add(`update-warmup-analytics-${mailbox?._id}`, {
						mailboxId: mailbox._id,
					})
				)
			)
		);
	} catch (error) {
		const errorMessage = `[enqueueToUpdateWarmupAnalytics] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
	}
}

export default enqueueToUpdateWarmupAnalytics;
