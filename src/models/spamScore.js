import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { ObjectId, Date } from '../lib/Mongoose/constants';

const spamScoreSchema = {
	mailbox: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
		required: true,
	},
	inboxEmailCount: {
		type: Number,
		default: 0,
	},
	flaggedEmailCount: {
		type: Number,
		default: 0,
	},
	date: {
		type: Date,
		required: true,
	},
};

const SpamScoreModel = new Model(DB_COLLECTIONS.spamScore, spamScoreSchema);

export default SpamScoreModel;
