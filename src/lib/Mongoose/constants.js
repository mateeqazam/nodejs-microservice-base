import mongoose from 'mongoose';

export const { ObjectId } = mongoose.Types;
export const { Boolean, Date, Mixed, Number, String } = mongoose.Schema.Types;

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
