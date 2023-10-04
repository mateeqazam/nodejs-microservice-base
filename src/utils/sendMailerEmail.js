import Mailer from '../lib/Mailer';
import SentEmailModel from '../models/sentEmail';
import FailedEmailModel from '../models/failedEmail';
import { ObjectId } from '../lib/Mongoose/constants';
import EmailTemplateModel from '../models/emailTemplate';
import CampaignHistoryModel from '../models/campaignHistory';
import CampaignAnalyticsModel from '../models/campaignAnalytics';

import logger from './logger';
import { getTodayDate } from './helpers/date';
import scheduleEmail from './dailyPlans/scheduleEmail';
import { determineReplyTime } from './dailyPlans/helpers';
import suspendMailbox, { shouldSuspendMailbox } from './suspendMailbox';

async function sendMailerEmail(emailToSchedule) {
	if (!emailToSchedule) return;

	const {
		sender,
		receiver,
		template,
		isReply = false,
		parentMessageId,
		analyticsData,
		historyData,
	} = emailToSchedule;

	try {
		if (!sender || sender.status !== 'active') {
			logger.debug('Missing or Inactive Sender', { data: sender, params: emailToSchedule });
			return;
		}

		const mailer = new Mailer(sender);
		const senderAddress = Mailer.getAddressField(sender);
		const emailSign = `${sender.firstName} ${sender.lastName || ''}`.trim();
		const bcc = sender?.config?.bcc;

		const sentEmailResult = await mailer.sendEmail({
			toMailbox: receiver,
			template,
			isReply,
			parentMessageId,
			senderAddress,
			emailSign,
			bcc,
		});

		if (historyData && sentEmailResult?.messageId) {
			await CampaignHistoryModel.updateOne({
				filter: { _id: ObjectId(historyData.insertedId) },
				write: {
					$addToSet: { flowItemRefData: `${sentEmailResult?.messageId}_${historyData.variantId}` },
				},
			});
		}

		await SentEmailModel.create({
			to: receiver._id,
			from: sender._id,
			isReply,
			date: getTodayDate(),
			template: template._id,
			messageId: sentEmailResult?.messageId,
			...(isReply && { inReplyTo: parentMessageId }),
		});

		if (sentEmailResult && template.child && isReply) {
			const childTemplate = await EmailTemplateModel.findOne({
				filter: {
					_id: ObjectId(template.child),
					active: true,
					deletedAt: { $exists: false },
				},
			});

			if (childTemplate) {
				scheduleEmail({
					sender: receiver,
					receiver: sender,
					template: childTemplate,
					isReply: true,
					parentMessageId: sentEmailResult?.messageId,
					time: determineReplyTime(sender),
				});
			}
		}
	} catch (error) {
		const errorMessage = `[sendMailerEmail] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: emailToSchedule });

		if (analyticsData) {
			await CampaignAnalyticsModel.updateOne({
				filter: { _id: analyticsData._id },
				write: { $inc: { emails_bounced: 1 } },
			});
		}

		await FailedEmailModel.create({
			to: receiver._id,
			from: sender._id,
			template: template._id,
			errorCode: error?.code,
		});

		if (sender && (error?.code === 'EAUTH' || error?.code === 'ClientAuthError')) {
			if (await shouldSuspendMailbox(sender)) await suspendMailbox(sender);
		}
	}
}

export default sendMailerEmail;
