import mongoose from 'mongoose';

import DB_COLLECTIONS from '../../../constants/dbCollections';

const createSchema = (properties = {}) => {
	const collectionSchema = new mongoose.Schema(
		{
			...properties,

			createdBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: DB_COLLECTIONS.user,
			},

			updatedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: DB_COLLECTIONS.user,
			},

			deletedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: DB_COLLECTIONS.user,
			},
			deletedAt: {
				type: Date,
			},
		},
		{
			timestamps: ['createdAt', 'updatedAt'],
		}
	);

	collectionSchema.virtual('id').get(function getId() {
		return this._id.toHexString();
	});

	collectionSchema.set('toObject', { virtuals: true });
	collectionSchema.set('toJSON', { virtuals: true });

	return collectionSchema;
};

export default createSchema;
