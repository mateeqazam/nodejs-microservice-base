import log from '../../utils/log';

import getIMAPClient from './clients/imap';

async function setupIMAPClient(mailbox) {
	try {
		if (!mailbox || !mailbox.provider) {
			throw new Error('Missing Mailbox Provider');
		}

		return await getIMAPClient(mailbox);
	} catch (error) {
		const errorMessage = `[setupIMAPClient] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox } });
		return null;
	}
}

export default setupIMAPClient;
