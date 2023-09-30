import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String, ObjectId } from '../lib/Mongoose/constants';
import createSchema from '../lib/Mongoose/helpers/createSchema';

const prospectListSchema = createSchema({
	name: {
		type: String,
		required: true,
	},
	unsubscribedList: {
		type: Boolean,
		default: false,
	},
	header: [{ type: ObjectId, ref: DB_COLLECTIONS.prospectField }],
});

prospectListSchema.index({ name: 'text' });

const ProspectListModel = new Model(DB_COLLECTIONS.prospectList, prospectListSchema);

export default ProspectListModel;
