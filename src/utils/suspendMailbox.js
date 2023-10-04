import UserModel from '../models/user';
import SentEmail from '../models/sentEmail';
import MailboxModel from '../models/mailbox';
import FailedEmail from '../models/failedEmail';
import { ObjectId } from '../lib/Mongoose/constants';
import notificationTemplate from '../emailTemplates/notification';

import logger from './logger';
import sendSystemEmail from './sendSystemEmail';

export async function shouldSuspendMailbox(mailbox) {
	if (!mailbox) return false;

	try {
		const existing = await MailboxModel.findOne({ _id: ObjectId(mailbox._id) });
		if (!existing || existing.status !== 'active') return false;

		const lastSentEmail = await SentEmail.findOne({
			filter: { from: mailbox._id },
			sort: { createdAt: -1 },
		});

		const last3FailedEmails = await FailedEmail.find({
			filter: { from: mailbox._id },
			sort: { createdAt: -1 },
			limit: 3,
		});

		const sentEmailTime = lastSentEmail ? new Date(lastSentEmail.createdAt) : null;
		const failedEmailTime =
			last3FailedEmails.length === 3
				? new Date(last3FailedEmails[last3FailedEmails.length - 1].createdAt)
				: null;

		return failedEmailTime > sentEmailTime;
	} catch (error) {
		const errorMessage = `[shouldSuspendMailbox] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { mailbox } });
		return false;
	}
}

async function suspendMailbox(mailbox) {
	if (!mailbox) return;

	try {
		await MailboxModel.updateOne({
			filter: { _id: ObjectId(mailbox._id) },
			write: {
				status: 'suspended',
				suspendedAt: new Date(),
				'suspendedRaw.reason': 'requires_reauthentication',
			},
		});

		const owner = await UserModel.findOne({ filter: { _id: ObjectId(mailbox.owner) } });
		if (!owner || !owner.email) {
			const warnMessage = '[suspendMailbox] Error: Owner not Found';
			logger.warn(warnMessage, { params: { mailbox } });
			return;
		}

		await sendSystemEmail({
			to: owner.email,
			subject: 'Pribox - Action Required',
			html: notificationTemplate(
				owner.profile.firstName,
				'Pribox - Action Required',
				`Pribox cannot access your mailbox ${mailbox.email}. This is most likely due to revoked credentials. Action is required on your behalf to continue the warmup process. Please sign in to your <a href="https://app.pribox.io/dashboard/email-warmup-analytics" target="_blank">Pribox dashboard</a> to resolve this issue.<br/><br/>Enjoy using Pribox!`
			),
		});
	} catch (error) {
		const errorMessage = `[suspendMailbox] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { mailbox } });
	}
}

export default suspendMailbox;
