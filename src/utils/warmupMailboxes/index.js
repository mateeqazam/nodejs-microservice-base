import promiseLimit from 'promise-limit';

import log from '../log';
import { map } from '../helpers';
import { getAndProcessMailboxes } from '../db-helpers/mailbox';

import enqueueMailboxForWarmup from './enqueueMailboxForWarmup';

const MAX_CONCURRENT_JOBS = 50;

async function processMailboxes(mailboxes) {
	try {
		const pLimit = promiseLimit(MAX_CONCURRENT_JOBS);
		await Promise.all(map(mailboxes, (mailbox) => pLimit(() => enqueueMailboxForWarmup(mailbox))));
		return {};
	} catch (error) {
		const errorMessage = `[processMailboxes] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailboxes } });
		return { error };
	}
}

async function warmupMailboxes() {
	try {
		const filter = {
			status: 'active',
			// isWarmUp: true,
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
		};
		const queryParams = {
			filter,
			select: [
				'email',
				'firstName',
				'isDomain',
				'isDomainCheck',
				'lastName',
				'owner',
				'password',
				'provider',
				'timezoneOffset',
				'social',
				'smtp',
				'imap',
			],
		};
		const additionalParams = {
			batchSize: 10,
			processRecords: processMailboxes,
		};
		await getAndProcessMailboxes(queryParams, additionalParams);

		return { success: true };
	} catch (error) {
		const errorMessage = `[warmupMailboxes] Exception: ${error?.message}`;
		log.error(errorMessage, { error });
		return { error };
	}
}

export default warmupMailboxes;
