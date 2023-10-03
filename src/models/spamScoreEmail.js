import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { Boolean, ObjectId } from '../lib/Mongoose/constants';
import createSchema from '../lib/Mongoose/helpers/createSchema';

const spamScoreEmailSchema = createSchema({
	isSpam: {
		type: Boolean,
		default: false,
	},
	isSend: {
		type: Boolean,
		default: false,
	},
	mailbox: [
		{
			type: ObjectId,
			ref: DB_COLLECTIONS.mailbox,
		},
	],
});

spamScoreEmailSchema.index({ email: 'text' });

const SpamScoreEmailModel = new Model(DB_COLLECTIONS.spamScoreEmail, spamScoreEmailSchema);

export default SpamScoreEmailModel;
