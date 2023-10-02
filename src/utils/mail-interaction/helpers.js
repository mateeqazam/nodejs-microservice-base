import { getTodayDate } from '../helpers/date';
import SentEmailModel from '../../models/sentEmail';
import SpamScoreModel from '../../models/spamScore';

export async function markAsInteracted(_id) {
	return SentEmailModel.updateOne({
		filter: { _id },
		write: { hasInteracted: true },
	});
}

export async function incrementInboxEmailCount(mailboxId) {
	return SpamScoreModel.updateOne({
		filter: { mailbox: mailboxId, date: { $eq: new Date(getTodayDate()) } },
		write: { $inc: { inboxEmailCount: 1 } },
		upsert: true,
	});
}

export async function incrementFlaggedEmailCount(mailboxId) {
	return SpamScoreModel.updateOne({
		filter: { mailbox: mailboxId, date: { $eq: new Date(getTodayDate()) } },
		write: { $inc: { flaggedEmailCount: 1 } },
		upsert: true,
	});
}
