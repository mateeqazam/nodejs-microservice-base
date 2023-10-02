import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { ObjectId, Date } from '../lib/Mongoose/constants';

const sentEmailSchema = {
	to: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
	},
	from: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
	},
	date: {
		type: Date,
		required: true,
	},
	template: {
		type: ObjectId,
		ref: DB_COLLECTIONS.emailTemplate,
	},
	messageId: {
		type: String,
	},
	isReply: {
		type: Boolean,
	},
	inReplyTo: {
		type: String,
	},
	hasInteracted: {
		type: Boolean,
		default: false,
	},
	interactionTime: {
		type: Date,
		default: null,
	},
};

const SentEmailModel = new Model(DB_COLLECTIONS.sentEmail, sentEmailSchema);

export default SentEmailModel;
