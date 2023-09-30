import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import createSchema from '../lib/Mongoose/helpers/createSchema';
import { String, Mixed, ObjectId } from '../lib/Mongoose/constants';
import { PROSPECT_VERIFICATION_STATUSES } from '../constants/prospect';

const prospectSchema = createSchema({
	firstName: String,
	lastName: String,
	email: {
		type: String,
		required: true,
	},
	emailVerified: {
		type: String,
		enum: Object.values(PROSPECT_VERIFICATION_STATUSES),
		default: PROSPECT_VERIFICATION_STATUSES.UNCHECK,
	},
	tags: [{ type: ObjectId, ref: DB_COLLECTIONS.TAGS }],
	industry: String,
	country: String,
	company: String,
	position: String,
	location: String,
	custom: Mixed,
	emailVerifyRes: Mixed,
	prospectListId: {
		type: ObjectId,
		ref: DB_COLLECTIONS.prospectList,
	},
});

const ProspectModel = new Model(DB_COLLECTIONS.prospect, prospectSchema);

export default ProspectModel;
