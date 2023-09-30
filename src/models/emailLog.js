import Model from '../lib/Mongoose/model';
import { String } from '../lib/Mongoose/constants';
import DB_COLLECTIONS from '../constants/dbCollections';
import createSchema from '../lib/Mongoose/helpers/createSchema';

const emailLogSchema = createSchema({
	sender: {
		type: String,
		required: true,
		index: true,
	},
	recipient: {
		type: String,
		required: true,
		index: true,
	},
	cc: [{ type: String }],
	bcc: [{ type: String }],
	emailSubject: {
		type: String,
		required: true,
	},
	emailBody: {
		type: String,
		required: true,
	},
	messageId: {
		type: String,
	},
	error: {
		code: String,
		message: String,
	},
});

emailLogSchema.index({ email: 'text' });

const EmailLogModel = new Model(DB_COLLECTIONS.emailLog, emailLogSchema);

export default EmailLogModel;
