import Imap from 'node-imap';

import log from '../../../../utils/log';
import { parseResponse } from '../../../../utils/helpers';

import getIMAPConfig from './getIMAPConfig';

async function connectToIMAP(mailboxIMAPConfig) {
	return new Promise((resolve, reject) => {
		const imap = new Imap(mailboxIMAPConfig);

		imap.once('ready', () => resolve(imap));

		imap.once('error', (err) => reject(err));

		imap.once('end', () => {
			log.debug('[connectToIMAP] Connection Closed', { params: { mailboxIMAPConfig } });
		});

		imap.connect();
	});
}

async function getIMAPClient(mailbox) {
	try {
		const mailboxIMAPConfig = getIMAPConfig(mailbox);
		if (!mailboxIMAPConfig) throw new Error('Missing IMAP Config');

		const { result: imap, error } = await parseResponse(connectToIMAP(mailboxIMAPConfig));
		if (error) throw new Error(error);
		return imap;
	} catch (error) {
		const errorMessage = `[getIMAPClient] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox } });
		return null;
	}
}

export default getIMAPClient;
