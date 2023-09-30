import log from '../log';
import { ObjectId } from '../db';
import EmailLogModel from '../../models/emailLog';
import MailboxEmailModel from '../../models/mailboxEmail';

async function getMailboxEmails(mailboxId, filterParams) {
	if (!mailboxId || !filterParams) {
		return { error: 'Missing Mailbox Id or Filter Params' };
	}

	let pipeline = null;
	try {
		pipeline = [
			{
				$match: {
					$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
					...filterParams,
					from: new ObjectId(mailboxId),
				},
			},
			{
				$lookup: {
					from: MailboxEmailModel.collection.name,
					let: { messageId: '$messageId' },
					pipeline: [
						{
							$match: {
								mailboxId: new ObjectId(mailboxId),
								// boxLabel: { $in: ['INBOX', 'Spam'] },
								$expr: { $eq: ['$messageId', '$$messageId'] },
								$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
							},
						},
						{ $project: { messageId: 1, uid: 1, box: 1, boxLabel: 1 } },
					],
					as: 'mailboxEmails',
				},
			},
			{ $unwind: '$mailboxEmails' },
			{
				$project: {
					emailLogId: '$_id',
					to: 1,
					from: 1,
					isReply: 1,
					hasInteracted: 1,
					emailSubject: 1,
					date: 1,
					messageId: 1,
					uid: '$mailboxEmails.uid',
					mailboxEmailId: '$mailboxEmails._id',
					boxLabel: '$mailboxEmails.boxLabel',
					box: '$mailboxEmails.box',
				},
			},
		];

		const result = await EmailLogModel.aggregate(pipeline);
		return { result };
	} catch (error) {
		const errorMessage = `[getMailboxEmails] Exception: ${error?.message}`;
		log.error(errorMessage, {
			dbError: 1,
			error,
			queryParams: { pipeline },
			params: { mailboxId, filterParams },
		});
		return { error };
	}
}

export default getMailboxEmails;
