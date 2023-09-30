import promiseLimit from 'promise-limit';

import log from '../log';
import { deleteManyMailboxEmails } from '../db-helpers/mailboxEmail';
import { map, forEach, isNonEmptyArray, filter, flatten } from '../helpers';

async function moveEmailToInbox(mailer, emailItem) {
	try {
		const { error: moveError } = await mailer.moveToInbox(emailItem?.uid);
		return { emailItem, error: moveError };
	} catch (error) {
		const errorMessage = `[moveEmailToInbox] Exception: ${error.message}`;
		log.error(errorMessage, { error, params: { mailbox: mailer?.mailbox, emailItem } });
		return { error, emailItem };
	}
}

async function moveEmailsToInbox(mailer, spamBox, emails) {
	if (!mailer) throw new Error('Missing Mailer');
	if (!spamBox) throw new Error('Missing Spam Box');
	if (!isNonEmptyArray(emails)) return { result: [] };

	try {
		await mailer.openBox(spamBox);
		const pLimit = promiseLimit(10);
		const promisesResult = await Promise.all(
			emails.map((emailItem) => pLimit(() => moveEmailToInbox(mailer, emailItem)))
		);

		return { result: promisesResult };
	} catch (error) {
		const errorMessage = `[moveEmailsToInbox] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox: mailer?.mailbox, box: spamBox } });
		return { error };
	}
}

async function moveEmailsFromSpamToInbox(mailer, emails) {
	if (!mailer) throw new Error('Missing Mailer');
	if (!isNonEmptyArray(emails)) return { result: [] };

	try {
		const emailsBySpamBoxes = {};

		forEach(emails, (emailItem = {}) => {
			const { box } = emailItem || {};
			const boxPath = box?.path;
			if (!emailsBySpamBoxes[boxPath]) emailsBySpamBoxes[boxPath] = [];
			emailsBySpamBoxes[boxPath].push(emailItem);
		});

		// need optimisation: execution in series becuase box are not opened in parallel
		const pLimit = promiseLimit(1);
		const promisesBySpamBox = map(Object.keys(emailsBySpamBoxes), (spamBox) =>
			pLimit(async () => moveEmailsToInbox(mailer, spamBox, emailsBySpamBoxes[spamBox]))
		);
		const promisesResult = await Promise.all(promisesBySpamBox);
		const movedEmailsResult = flatten(filter(map(promisesResult, 'result'), isNonEmptyArray));

		const mailboxEmailsIdsToDelete = [];
		forEach(movedEmailsResult, (resultItem = {}) => {
			const { error, emailItem } = resultItem || {};
			if (!error && emailItem && emailItem.mailboxEmailId) {
				mailboxEmailsIdsToDelete.push(emailItem?.mailboxEmailId);
			}
		});

		const { error: deleteError } = await deleteManyMailboxEmails({
			_id: { $in: mailboxEmailsIdsToDelete },
		});
		if (deleteError) throw new Error(deleteError);

		return { result: { mailbox: mailer?.mailbox, emails: movedEmailsResult } };
	} catch (error) {
		const errorMessage = `[moveEmailsFromSpamToInbox] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox: mailer?.mailbox } });
		return { error };
	}
}

export default moveEmailsFromSpamToInbox;
