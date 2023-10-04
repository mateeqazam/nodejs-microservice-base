import Model from '../lib/Mongoose/model';
import { ObjectId } from '../lib/Mongoose/constants';
import DB_COLLECTIONS from '../constants/dbCollections';

const failedEmailSchema = {
	to: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
	},
	from: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
	},
	template: {
		type: ObjectId,
		ref: DB_COLLECTIONS.emailTemplate,
	},
	errorCode: {
		type: String,
		required: true,
	},
};

const FailedEmailModel = new Model(DB_COLLECTIONS.failedEmail, failedEmailSchema);

export default FailedEmailModel;
