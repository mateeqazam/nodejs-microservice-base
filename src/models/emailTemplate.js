import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String, Boolean, ObjectId } from '../lib/Mongoose/constants';

const emailTemplateSchema = {
	subject: {
		type: String,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	tags: [{ type: String }],
	active: {
		type: Boolean,
		default: true,
	},
	parent: {
		type: ObjectId,
		ref: DB_COLLECTIONS.emailTemplate,
		default: null,
	},
	child: {
		type: ObjectId,
		ref: DB_COLLECTIONS.emailTemplate,
		default: null,
	},
	priority: {
		type: Number,
		default: 0,
	},
};

const EmailTemplateModel = new Model(DB_COLLECTIONS.emailTemplate, emailTemplateSchema);

export default EmailTemplateModel;
