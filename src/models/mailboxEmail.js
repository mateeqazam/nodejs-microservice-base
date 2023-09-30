import mongoose from 'mongoose';

const mailboxEmailSchema = new mongoose.Schema(
	{
		uid: { type: Number, required: true },
		boxLabel: { type: String, required: true },
		mailboxId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox',
			required: true,
		},

		from: {
			address: { type: String, required: true },
			name: String,
		},
		to: {
			address: { type: String, required: true },
			name: String,
		},
		cc: [
			{
				address: String,
				name: String,
			},
		],
		bcc: [
			{
				address: String,
				name: String,
			},
		],
		allRecipients: [
			{
				address: String,
				name: String,
			},
		],

		xFailedRecipients: String,
		returnPath: mongoose.Schema.Types.Mixed,

		messageId: { type: String, required: true },
		inReplyTo: String,
		date: { type: Date, required: true },

		subject: String,
		body: String,

		box: {
			label: String,
			path: String,
		},
		flags: [String],
		attributes: mongoose.Schema.Types.Mixed,

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

mailboxEmailSchema.index({ mailboxId: 1, messageId: 1, boxLabel: 1 }, { unique: true });

mailboxEmailSchema.virtual('id').get(function getId() {
	return this._id.toHexString();
});

mailboxEmailSchema.set('toObject', { virtuals: true });
mailboxEmailSchema.set('toJSON', { virtuals: true });

const MailboxEmailModel = mongoose.model('mailbox_email', mailboxEmailSchema);

export default MailboxEmailModel;
