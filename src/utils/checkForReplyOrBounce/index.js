import promiseLimit from 'promise-limit';

import log from '../log';
import { map } from '../helpers';
import { getAndProcessMailboxes } from '../db-helpers/mailbox';

import checkMailboxForReplyAndBounce from './checkMailboxForReplyAndBounce';

async function processMailboxes(mailboxes) {
	try {
		const pLimit = promiseLimit(50);
		await Promise.all(
			map(mailboxes, (mailbox) => pLimit(() => checkMailboxForReplyAndBounce(mailbox)))
		);
		return {};
	} catch (error) {
		const errorMessage = `[processMailboxes] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailboxes } });
		return { error };
	}
}

async function checkForReplyOrBounce() {
	try {
		const filter = {
			status: 'active',
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
		};
		const queryParams = {
			filter,
			select: ['email', 'owner'],
		};

		const additionalParams = {
			batchSize: 10,
			processRecords: processMailboxes,
		};
		await getAndProcessMailboxes(queryParams, additionalParams);

		return { success: true };
	} catch (error) {
		const errorMessage = `[checkForReplyOrBounce] Exception: ${error?.message}`;
		log.error(errorMessage, { error });
		return { error };
	}
}

export default checkForReplyOrBounce;
