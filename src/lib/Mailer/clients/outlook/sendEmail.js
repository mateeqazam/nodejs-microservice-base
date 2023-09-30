import log from '../../../../utils/log';
import { get, isNonEmptyArray } from '../../../../utils/helpers';

async function sendEmailViaOutlook(client, message) {
	try {
		if (!client) throw new Error('Missing Client');
		if (!message) throw new Error('Missing Message');

		const { inReplyTo } = message;

		let draft;
		if (inReplyTo) {
			const parent = await client
				.api('/me/messages')
				.filter(`internetMessageId eq '${encodeURIComponent(inReplyTo)}'`)
				.header('Prefer', 'IdType="ImmutableId"')
				.get();

			if (!parent || isNonEmptyArray(parent.value)) {
				throw new Error('Unable to retrieve parent email for creating reply');
			}

			const parentId = get(parent, 'value[0].id');
			if (!parentId) {
				throw new Error('Unable to find parentId for creating reply');
			}

			draft = await client
				.api(`/me/messages/${parentId}/createReply`)
				.header('Prefer', 'IdType="ImmutableId"')
				.post({ message });
		} else {
			draft = await client
				.api('/me/messages')
				.header('Prefer', 'IdType="ImmutableId"')
				.post(message);
		}

		await client.api(`/me/messages/${draft.id}/send`).post();
		return { result: { messageId: draft?.internetMessageId } };
	} catch (error) {
		const errorMessage = `[sendEmailViaOutlook] Exception: ${error?.message}`;
		log.fatal(errorMessage, { error, data: { message } });
		return { error };
	}
}

export default sendEmailViaOutlook;
