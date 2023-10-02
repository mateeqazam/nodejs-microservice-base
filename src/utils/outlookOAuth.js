import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';

import logger from './logger';
import MailboxModel from '../models/mailbox';
import { ObjectId } from '../lib/Mongoose/constants';
import OUTLOOK_CREDENTIALS from '../config/outlook';

function getRefreshToken(oAuthClient) {
	const tokenCache = oAuthClient.getTokenCache().serialize();
	const refreshTokenObject = JSON.parse(tokenCache).RefreshToken;
	return refreshTokenObject?.[Object.keys(refreshTokenObject)[0]]?.secret;
}

function getOAuth2Client() {
	return new ConfidentialClientApplication({
		auth: {
			clientId: OUTLOOK_CREDENTIALS.client_id,
			authority: OUTLOOK_CREDENTIALS.authority,
			clientSecret: OUTLOOK_CREDENTIALS.client_secret,
		},
	});
}

class OutlookAuthProvider {
	constructor(mailboxId) {
		this.mailboxId = ObjectId(mailboxId);
	}

	async getAccessToken() {
		try {
			const mailbox = await MailboxModel.findOne({ filter: { _id: this.mailboxId } });
			if (!mailbox) return null;

			const isAboutToExpire = new Date(mailbox.social.expiresAt).getTime() < Date.now();
			if (!isAboutToExpire) return mailbox.social.accessToken;

			const oAuthClient = getOAuth2Client();
			const { accessToken, expiresOn } = await oAuthClient.acquireTokenByRefreshToken({
				scopes: OUTLOOK_CREDENTIALS.scopes,
				refreshToken: mailbox.social.refreshToken,
			});

			const newRefreshToken = getRefreshToken(oAuthClient);
			await MailboxModel.updateOne({
				filter: { _id: this.mailboxId },
				write: {
					'social.accessToken': accessToken,
					'social.expiresAt': expiresOn,
					'social.refreshToken': newRefreshToken || mailbox.social.refreshToken,
				},
			});

			return accessToken;
		} catch (error) {
			const errorMessage = `[getAccessToken] Exception: ${error?.message}`;
			logger.error(errorMessage, { error, data: { mailboxId: this.mailboxId } });
			return null;
		}
	}
}

function getOutlookApiClient(mailboxId) {
	return Client.initWithMiddleware({
		authProvider: new OutlookAuthProvider(mailboxId),
	});
}

export default getOutlookApiClient;
