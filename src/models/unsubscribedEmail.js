import mongoose from 'mongoose';

const unsubscribeEmailSchema = new mongoose.Schema(
	{
		prospect: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'prospect',
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox',
		},
		deletedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		createdBy: {
			type: String,
		},
		deletedAt: {
			type: Date,
			index: true,
		},
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
	}
);

unsubscribeEmailSchema.virtual('id').get(function getId() {
	return this._id.toHexString();
});

unsubscribeEmailSchema.set('toObject', { virtuals: true });
unsubscribeEmailSchema.set('toJSON', { virtuals: true });

const UnsubscribeEmailModel = mongoose.model('unsubscribe_email', unsubscribeEmailSchema);

export default UnsubscribeEmailModel;
