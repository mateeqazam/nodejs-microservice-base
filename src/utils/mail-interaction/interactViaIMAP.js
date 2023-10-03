import { map } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../logger';
import IMAP from '../../lib/IMAP';
import { markAsInteracted, incrementInboxEmailCount, incrementFlaggedEmailCount } from './helpers';

const STARRED_EMAILS_RATIO = 0.2; // Adjust the ratio as needed

const fetchOptions = {
	bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
	markSeen: false,
};

async function processEmail(imap, email, additionalParams) {
	try {
		const { _id, messageId, from, senderPlan, isReply } = email || {};
		const { inboxFolder, spamFolder } = additionalParams || {};
		const shouldInteract = senderPlan !== 'tester';
		fetchOptions.markSeen = shouldInteract;

		await markAsInteracted(_id);

		let emailProcessed = false;

		// TODO: need to refactor the code
		if (!emailProcessed && inboxFolder) {
			const uid = await imap.getUID(messageId, inboxFolder.path);
			if (uid) {
				if (shouldInteract) {
					await imap.markAsImportant(uid);
					if (Math.random() <= STARRED_EMAILS_RATIO && !isReply) {
						await imap.markAsStarred(uid);
					}
				}
				if (!isReply) await incrementInboxEmailCount(from);
				emailProcessed = true;
			}
		}

		if (!emailProcessed && spamFolder) {
			const uid = await imap.getUID(messageId, spamFolder.path);
			if (uid) {
				if (shouldInteract) {
					await imap.moveToInbox(uid);
					const newUID = await imap.getUID(messageId, inboxFolder.path);
					if (newUID) {
						await imap.markAsImportant(newUID);
						if (Math.random() <= STARRED_EMAILS_RATIO && !isReply) {
							await imap.markAsStarred(newUID);
						}
					}
				}
				if (!isReply) await incrementFlaggedEmailCount(from);
				emailProcessed = true;
			}
		}
	} catch (error) {
		const errorMessage = `[interactViaIMAP:processEmail] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { email, ...(additionalParams || {}) } });
	}
}

async function interactViaIMAP(params) {
	try {
		const { toMailbox, emails } = params || {};
		if (!toMailbox || toMailbox.senderOnly) return;

		const imap = await IMAP.connect({ mailbox: toMailbox, fetchOptions });
		const inboxFolder = await imap.getInboxFolder();
		const spamFolder = await imap.getSpamFolder();

		const pLimit = promiseLimit(1);
		await Promise.all(
			map(emails, (email) => pLimit(() => processEmail(imap, email, { inboxFolder, spamFolder })))
		);

		imap.connection.end();
	} catch (error) {
		const errorMessage = `[interactViaIMAP] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params });
		throw error;
	}
}

export default interactViaIMAP;
