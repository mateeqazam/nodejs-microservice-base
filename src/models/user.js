import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String, Date, Boolean } from '../lib/Mongoose/constants';

const userSchema = {
	first_name: {
		type: String,
		required: true,
	},
	last_name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
	},
	email_confirmed: {
		type: Boolean,
	},
	gender: {
		type: String,
	},
	active: {
		type: Boolean,
	},
	image: {
		type: String,
		maxlength: 3000,
	},
	mobile_number: {
		type: String,
	},
	password: {
		type: String,
	},
	reset_Password_token: {
		type: String,
	},
	reset_Password_expiry: {
		type: String,
	},
	current_login_date: {
		type: Date,
	},
	last_login_date: {
		type: Date,
	},
	auth_token: {
		type: String,
	},
};

const UserModel = new Model(DB_COLLECTIONS.user, userSchema);

export default UserModel;
