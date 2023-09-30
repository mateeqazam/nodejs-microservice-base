import promiseLimit from 'promise-limit';

import log from '../log';
import { forEach, map, isNonEmptyArray, get } from '../helpers';
import { bulkWriteMailboxEmails } from '../db-helpers/mailboxEmail';

import fetchEmail from './fetchEmail';

async function syncBoxEmails(params) {
	const { mailer, box, filter } = params || {};

	try {
		if (!mailer) throw new Error('Missing Mailer');

		const { result: imapClient } = await mailer.getIMAPClient();
		if (!imapClient) throw new Error('Missing IMAP Client');

		const { result: emailUIDs, error: searchError } = await mailer.searchInBox({
			box,
			filter,
		});
		if (searchError) throw new Error(searchError);
		if (!isNonEmptyArray(emailUIDs)) return { result: [], box };

		console.log('00 [syncBoxEmails]', {
			email: mailer?.mailbox?.email,
			box: box?.label || box,
			filter,
			emailUIDs: emailUIDs?.length,
		});

		const pLimit = promiseLimit(50);
		const emailItems = await Promise.all(
			map(emailUIDs, (emailUID) => pLimit(() => fetchEmail(imapClient, emailUID, box)))
		);

		const operations = [];
		const mailboxId = mailer.mailbox?._id;
		const boxLabel = box?.label || box?.path;
		forEach(emailItems, (emailItem) => {
			if (!emailItem || !emailItem.uid) return;

			console.log('box', boxLabel);
			const { uid, messageId, date } = emailItem || {};
			operations.push({
				updateOne: {
					filter: { mailboxId, boxLabel, messageId, uid },
					update: {
						$set: { ...emailItem, mailboxId, boxLabel, date: date ? new Date(date) : null },
					},
					upsert: true,
				},
			});
		});

		console.log('01 [syncBoxEmails]', {
			email: mailer?.mailbox?.email,
			box: box?.label || box,
			filter,
			operations: operations?.length,
		});

		const { result: bulkWriteResult, error: bulkWriteError } =
			await bulkWriteMailboxEmails(operations);
		if (bulkWriteError) throw new Error(bulkWriteError);

		const result = {
			nInserted: get(bulkWriteResult, 'insertedCount', 0),
			nMatched: get(bulkWriteResult, 'matchedCount', 0),
			nModified: get(bulkWriteResult, 'modifiedCount', 0),
			nDeleted: get(bulkWriteResult, 'deletedCount', 0),
			nUpserted: get(bulkWriteResult, 'upsertedCount', 0),
		};
		return { result, box };
	} catch (error) {
		const errorMessage = `[syncBoxEmails] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox: mailer?.mailbox, box, filter } });
		return { error, box };
	}
}

export default syncBoxEmails;
