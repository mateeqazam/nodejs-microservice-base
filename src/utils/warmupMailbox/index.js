import log from '../log';
import Mailer from '../../lib/Mailer';
import syncBoxEmails from '../syncBoxEmails';
import { isNonEmptyArray, forEach } from '../helpers';
import { SPAM_BOXES } from '../../lib/Mailer/constants';
import getMailboxEmails from '../db-helpers/getMailboxEmails';
import { bulkWriteWarmupInsights } from '../db-helpers/warmupInsight';

import moveEmailsFromSpamToInbox from './moveSpamToInbox';
import positivelyInteractEmails from './positivelyInteractEmails';

async function warmupMailbox(params) {
	try {
		const { mailbox, filter: filterParams = {} } = params || {};
		if (!mailbox) throw new Error('Missing Mailbox');

		const mailboxId = mailbox?._id;
		const { result: mailboxEmails, error: mailboxEmailsError } = await getMailboxEmails(
			mailboxId,
			filterParams
		);
		if (mailboxEmailsError) throw new Error(mailboxEmailsError);
		if (!isNonEmptyArray(mailboxEmails)) return { success: true };

		const operations = [];
		const spamEmails = [];
		const nonSpamEmails = [];
		forEach(mailboxEmails, (emailItem = {}) => {
			const { emailLogId, messageId, uid, boxLabel, box, date } = emailItem || {};
			if (!uid || !emailLogId || !messageId || !boxLabel) return;

			const isSpamEmail = SPAM_BOXES.includes(boxLabel);
			if (isSpamEmail) spamEmails.push(emailItem);
			else nonSpamEmails.push(emailItem);

			operations.push({
				updateOne: {
					filter: { mailboxId, emailLogId, messageId },
					update: {
						$set: {
							mailboxId,
							emailLogId,
							uid,
							messageId,
							boxLabel,
							box,
							date,
							spam: isSpamEmail,
						},
					},
					upsert: true,
				},
			});
		});

		const { error: bulkWriteError } = await bulkWriteWarmupInsights(operations);
		if (bulkWriteError) throw new Error(bulkWriteError);

		const mailer = new Mailer(mailbox);
		const { result: movedEmails } = await moveEmailsFromSpamToInbox(mailer, spamEmails);
		const emailsToPositiveInteract = [...nonSpamEmails, ...movedEmails];
		await positivelyInteractEmails(mailer, emailsToPositiveInteract);

		const inboxObj = await mailer.getInboxName();
		const messageIdsQueryToSync = [];
		forEach(emailsToPositiveInteract, (emailItem = {}) => {
			const { messageId } = emailItem || {};
			if (messageId) {
				messageIdsQueryToSync.push(`HEADER Message-ID "${messageId}"`);
			}
		});
		const searchQuery = messageIdsQueryToSync.join(' OR ');
		const { error: syncError } = await syncBoxEmails({
			mailer,
			box: inboxObj,
			filter: [searchQuery],
		});
		if (syncError) throw new Error(syncError);

		log.debug('[warmupMailbox] Mailbox Executed', mailbox?.email);
		return { success: true };
	} catch (error) {
		const errorMessage = `[warmupMailbox] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params });
		return { error };
	}
}

export default warmupMailbox;
