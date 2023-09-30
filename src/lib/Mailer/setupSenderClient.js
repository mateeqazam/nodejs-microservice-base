import log from '../../utils/log';

import getSMTPClient from './clients/smtp';
import getOutlookAPIClient from './clients/outlook';

async function setupSenderClient(mailbox) {
	try {
		if (!mailbox || !mailbox.provider) {
			throw new Error('Missing Mailbox Provider');
		}

		if (mailbox.provider === 'outlook') {
			return await getOutlookAPIClient(mailbox._id);
		}

		return await getSMTPClient(mailbox);
	} catch (error) {
		const errorMessage = `[setupSenderClient] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox } });
		return null;
	}
}

export default setupSenderClient;
