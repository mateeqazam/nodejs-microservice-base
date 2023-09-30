import log from '../log';
import { NON_INBOUND_BOXES } from '../../lib/Mailer/constants';
import { getAndProcessMailboxEmails } from '../db-helpers/mailboxEmail';
import { forEach, uniq, filter, map, isNil, isNonEmptyArray } from '../helpers';
import { updateManyCampaignSimulationStep } from '../db-helpers/campaignSimulation';

async function setReplyAndBounceFlag(mailboxEmails) {
	try {
		if (!isNonEmptyArray(mailboxEmails)) return {};

		const bouncedEmails = [];
		const emailsWithReply = [];
		forEach(mailboxEmails, (emailItem) => {
			const { inReplyTo, from, subject } = emailItem || {};
			if (!inReplyTo) return;

			// Bounced Emails Condition
			if (
				from?.name === 'Mail Delivery Subsystem' ||
				from?.address === 'mailer-daemon@googlemail.com' ||
				subject === 'Delivery Status Notification (Failure)'
			) {
				bouncedEmails.push(emailItem);
			} else {
				emailsWithReply.push(emailItem);
			}
		});

		// 01: update emails with reply

		// active/paused campaigns active or copmleted (2 months time period)
		const filterParams = {
			stepType: 'email',
			status: 'completed',
			// senderId: mailbox?._id,
			'stepInfo.messageId': { $in: uniq(filter(map(emailsWithReply, 'inReplyTo'), isNil)) },
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
		};
		const queryParams = {
			filter: filterParams,
			write: { replied: true },
		};
		await updateManyCampaignSimulationStep(queryParams); // TODO: attach messageId as replyMessageId

		// 02: bounce Emails with Reply
		// check if xFailedRecipients is prospectId

		// active/paused campaigns active or copmleted (2 months time period)
		// const filterParams = {
		// 	stepType: 'email',
		// 	status: 'completed',
		// 	// senderId: mailbox?._id,
		// 	'stepInfo.messageId': { $in: uniq(filter(map(emailsWithReply, 'inReplyTo'), isNil)) },
		// 	$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
		// };
		// const queryParams = {
		// 	filter: filterParams,
		// 	write: { bounced: true }
		// };
		// await updateManyCampaignSimulationStep(queryParams);		// TODO: attach messageId as replyMessageId

		return { success: true };
	} catch (error) {
		const errorMessage = `[setReplyAndBounceFlag] Exception: ${error?.message}`;
		log.error(errorMessage, { error });
		return { error };
	}
}

async function checkMailboxForReplyAndBounce(mailbox) {
	try {
		if (!mailbox) throw new Error('Missing Mailbox');

		const thirtyMinutesAgo = new Date(Date.now() - 11 * 24 * 60 * 60 * 1000);
		const filterParams = {
			mailboxId: mailbox?._id,
			inReplyTo: { $exists: true },
			labelBox: { $ne: NON_INBOUND_BOXES },
			updatedAt: { $gte: thirtyMinutesAgo },
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
		};

		const queryParams = {
			filter: filterParams,
			select: [
				'mailboxId',
				'from',
				'labelBox',
				'subject',
				'messageId',
				'inReplyTo',
				'xFailedRecipients',
			],
		};

		const additionalParams = {
			batchSize: 10,
			processRecords: setReplyAndBounceFlag,
		};
		await getAndProcessMailboxEmails(queryParams, additionalParams);

		return {};
	} catch (error) {
		const errorMessage = `[checkMailboxForReplyAndBounce] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox } });
		return { error };
	}
}

export default checkMailboxForReplyAndBounce;
