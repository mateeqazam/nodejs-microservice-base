import mongoose from 'mongoose';

const trackingTokensSchema = new mongoose.Schema(
	{
		token: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		campaignId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'campaign',
			required: true,
		},
		nodeItemId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'campaign_flow',
			required: true,
		},
		stepItemId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'campaign_simulation',
			required: true,
		},
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox',
			required: true,
			index: true,
		},
		prospectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'prospect',
			required: true,
			index: true,
		},
		variantId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'campaign_flow.emailVariants',
			required: true,
		},
		sendingAt: {
			type: Date,
		},
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
	}
);

trackingTokensSchema.virtual('id').get(function getId() {
	return this._id.toHexString();
});

trackingTokensSchema.set('toObject', { virtuals: true });
trackingTokensSchema.set('toJSON', { virtuals: true });

const TrackingTokenModel = mongoose.model('tracking_token', trackingTokensSchema);

export default TrackingTokenModel;
