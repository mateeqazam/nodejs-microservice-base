import mongoose from 'mongoose';

export const { String, Date, Boolean, ObjectId, Mixed } = mongoose.Schema.Types;

export const DEFAULT_SELECT_LIMIT = 20;
export const MONGO_UPDATE_OPERATORS = [
	'$set',
	'$unset',
	'$inc',
	'$push',
	'$pull',
	'$addToSet',
	'$rename',
];
