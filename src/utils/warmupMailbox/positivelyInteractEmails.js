import promiseLimit from 'promise-limit';

import log from '../log';
import { isEmpty, isNonEmptyArray, map } from '../helpers';

const STARRED_EMAILS_RATIO = 0.35;

async function positiveInteractEmail(mailer, emailItem) {
	if (!mailer) throw new Error('Missing Mailer');
	if (!emailItem || isEmpty(emailItem)) throw new Error('Missing Email Item');

	try {
		const { uid, isReply, emailLogId } = emailItem;
		if (!uid) throw new Error('Missing Email UID');

		const imapClient = await mailer.getIMAPClient();
		if (!imapClient) throw new Error('Missing Imap Client');

		await imapClient.markAsImportant(uid);

		const shouldStarredTheEmail = Math.random() < STARRED_EMAILS_RATIO;
		if (!isReply && shouldStarredTheEmail) await imapClient.markAsStarred(uid);

		// await markEmailAsInteracted(emailLogId);
		return { success: true };
	} catch (error) {
		const errorMessage = `[positiveInteractEmail] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox: mailer?.mailbox } });
		return { error };
	}
}

async function positivelyInteractEmails(mailer, emails) {
	if (!mailer) throw new Error('Missing Mailer');
	if (!isNonEmptyArray(emails)) return {};

	try {
		const pLimit = promiseLimit(10);
		const result = await Promise.all(
			map(emails, (emailItem) => pLimit(() => positiveInteractEmail(mailer, emailItem)))
		);
		return { result };
	} catch (error) {
		const errorMessage = `[positivelyInteractEmails] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox: mailer?.mailbox } });
		return { error };
	}
}

export default positivelyInteractEmails;
