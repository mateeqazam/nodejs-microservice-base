import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String } from '../lib/Mongoose/constants';

const userSchema = {
	firstName: {
		type: String,
		required: true,
	},
	lastName: String,
};

const UserModel = new Model(DB_COLLECTIONS.user, userSchema);

export default UserModel;
