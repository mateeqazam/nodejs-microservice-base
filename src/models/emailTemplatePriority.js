import Model from '../lib/Mongoose/model';
import { ObjectId } from '../lib/Mongoose/constants';
import DB_COLLECTIONS from '../constants/dbCollections';

const emailTemplatePrioritySchema = {
	receiver: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
	},
	template: {
		type: ObjectId,
		ref: DB_COLLECTIONS.emailTemplate,
	},
	priority: {
		type: Number,
		default: 0,
	},
};

const EmailTemplatePriorityModel = new Model(
	DB_COLLECTIONS.emailTemplatePriority,
	emailTemplatePrioritySchema
);

export default EmailTemplatePriorityModel;
