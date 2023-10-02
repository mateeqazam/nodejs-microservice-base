import { map } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../logger';
import getOutlookApiClient from '../outlookOAuth';
import { markAsInteracted, incrementInboxEmailCount, incrementFlaggedEmailCount } from './helpers';

async function processEmail(client, email, additionalParams) {
	try {
		const { _id, messageId, from, senderPlan, isReply } = email || {};
		const shouldInteract = senderPlan !== 'tester';

		await markAsInteracted(_id);

		const message = await client
			.api('/me/messages')
			.filter(`internetMessageId eq '${encodeURIComponent(messageId)}'`)
			.header('Prefer', 'IdType="ImmutableId"')
			.get();

		if (message?.value?.length !== 0) {
			if (shouldInteract) {
				await client
					.api(`/me/messages/${message.value[0].id}`)
					.update({ isRead: true, importance: 'High' });
			}

			const folder = await client.api(`/me/mailFolders/${message.value[0].parentFolderId}`).get();
			if (folder?.displayName === 'Junk Email') {
				if (shouldInteract) {
					await client.api(`/me/messages/${message.value[0].id}/move`).post({
						destinationId: 'inbox',
					});
				}
				if (!isReply) await incrementFlaggedEmailCount(from);
			} else if (!isReply) await incrementInboxEmailCount(from);
		}
	} catch (error) {
		const errorMessage = `[interactViaOutlook:processEmail] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { email, ...(additionalParams || {}) } });
	}
}

async function interactViaOutlook(params) {
	try {
		const { toMailbox, emails } = params || {};
		if (!toMailbox || toMailbox._id) return;

		const client = getOutlookApiClient(toMailbox._id);
		if (!client) throw new Error('Unable to connect with Outlook Server.');

		const pLimit = promiseLimit(1);
		await Promise.all(map(emails, (email) => pLimit(() => processEmail(client, email))));
	} catch (error) {
		const errorMessage = `[interactViaOutlook] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params });
		throw error;
	}
}

export default interactViaOutlook;
