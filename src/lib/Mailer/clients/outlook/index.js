import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';

import log from '../../../../utils/log';
import OUTLOOK_CREDENTIALS from '../../../../config/outlook';
import { getMailbox, updateMailbox } from '../../../../utils/db-helpers/mailbox';

async function refreshAccessToken(oAuthClient, mailbox) {
	try {
		if (!oAuthClient) throw new Error('Missing oAuthClient');
		if (!mailbox) throw new Error('Missing Mailbox');

		const currentRefreshToken = mailbox?.social?.refreshToken;
		const tokenResponse = await oAuthClient.acquireTokenByRefreshToken({
			scopes: OUTLOOK_CREDENTIALS?.scopes,
			refreshToken: currentRefreshToken,
		});

		const { refreshToken, accessToken, expiresOn } = tokenResponse || {};
		if (!refreshToken || !accessToken) throw new Error('Unable to generate refresh token');

		const filter = { _id: mailbox._id };
		const write = {
			$set: {
				'social.accessToken': accessToken,
				'social.expiresAt': expiresOn,
				'social.refreshToken': refreshToken || currentRefreshToken,
			},
		};
		await updateMailbox(filter, write);

		return accessToken;
	} catch (error) {
		const errorMessage = `[refreshAccessToken] Exception: ${error?.message}`;
		log.fatal(errorMessage, { error, data: { mailbox } });
		return null;
	}
}

async function getAccessToken(mailboxId) {
	try {
		if (!mailboxId) throw new Error('Missing Mailbox Id');

		const { result: mailbox, error } = await getMailbox({ _id: mailboxId });
		if (error) throw new Error(error);

		// TODO: Consider updating the token before it expires, perhaps around 5 minutes prior to expiration.
		if (new Date(mailbox?.social?.expiresAt).getTime() < Date.now()) {
			const { clientId, authority, clientSecret } = OUTLOOK_CREDENTIALS || {};
			const oAuthClient = new ConfidentialClientApplication({
				auth: { clientId, authority, clientSecret },
			});

			return await refreshAccessToken(oAuthClient, mailbox);
		}

		return mailbox?.social?.accessToken;
	} catch (error) {
		const errorMessage = `[getAccessToken] Exception: ${error?.message}`;
		log.fatal(errorMessage, { error, data: { mailboxId } });
		return null;
	}
}
function getOutlookAPIClient(mailboxId) {
	return Client.initWithMiddleware({
		authProvider: { getAccessToken: () => getAccessToken(mailboxId) },
	});
}

export default getOutlookAPIClient;
