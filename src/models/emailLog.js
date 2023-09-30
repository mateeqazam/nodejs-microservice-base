import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
	{
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'prospect',
		},
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox',
		},
		date: {
			type: Date,
			required: true,
			default: new Date(),
		},
		template: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'email_template',
		},
		messageId: {
			type: String,
		},
		isReply: {
			type: Boolean,
		},
		inReplyTo: {
			type: String,
		},
		hasInteracted: {
			type: Boolean,
			default: false,
		},
		error: {
			type: String,
		},
		errorCode: {
			type: String,
		},
		trackingToken: {
			type: String,
		},
		status: {
			type: String,
			enum: ['sent', 'failed'],
		},
		interactionTime: {
			type: Date,
		},
		sentAt: {
			type: Date,
		},
		deletedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		deletedAt: {
			type: Date,
			index: true,
		},
		emailSubject: {
			type: String,
		},
		emailBody: {
			type: String,
		},
		campaign: {
			campaignId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'campaign',
			},
		},
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
	}
);

emailLogSchema.virtual('id').get(function getId() {
	return this._id.toHexString();
});

emailLogSchema.set('toObject', { virtuals: true });
emailLogSchema.set('toJSON', { virtuals: true });

const EmailLogModel = mongoose.model('email_log', emailLogSchema);

export default EmailLogModel;
