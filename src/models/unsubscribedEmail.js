import Model from '../lib/Mongoose/model';
import { ObjectId } from '../lib/Mongoose/constants';
import DB_COLLECTIONS from '../constants/dbCollections';

const unsubscribeEmailSchema = {
	prospect: {
		type: ObjectId,
		ref: DB_COLLECTIONS.prospect,
		required: true,
	},
	sender: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
		required: true,
	},
};

const UnsubscribeEmailModel = new Model(
	DB_COLLECTIONS.unsubscribedProspect,
	unsubscribeEmailSchema
);

export default UnsubscribeEmailModel;
