import mongoose from 'mongoose';

import MailboxModel from './mailbox';
import EmailLogModel from './emailLog';

const warmupInsightSchema = new mongoose.Schema(
	{
		mailboxId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: MailboxModel.collection.name,
			required: true,
		},
		emailLogId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: EmailLogModel.collection.name,
			required: true,
		},
		messageId: {
			type: String,
			required: true,
		},
		date: Date,
		box: {
			label: String,
			path: String,
		},
		spam: {
			type: Boolean,
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
	}
);

warmupInsightSchema.virtual('id').get(function getId() {
	return this._id.toHexString();
});

warmupInsightSchema.set('toObject', { virtuals: true });
warmupInsightSchema.set('toJSON', { virtuals: true });

const WarmupInsightModel = mongoose.model('warmup_insight', warmupInsightSchema);

export default WarmupInsightModel;
