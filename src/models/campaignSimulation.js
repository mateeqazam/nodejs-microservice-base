import mongoose from 'mongoose';

const campaignSimulationSchema = new mongoose.Schema(
	{
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
		prospectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'prospect',
			required: true,
			index: true,
		},
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'mailbox',
			required: true,
		},
		nodeItemRefData: {
			type: [String],
			default: [],
		},
		stepType: {
			type: String,
			enum: ['start', 'email', 'trigger', 'delay', 'goal'],
		},
		triggerCondition: {
			type: String,
			enum: ['opened', 'clicked'],
		},
		nodeVariant: {
			type: String,
			enum: ['yes', 'no'],
		},
		status: {
			type: String,
			enum: ['active', 'completed', 'failed', 'paused'],
			default: 'active',
			required: true,
		},

		// scheduledAt: {
		// 	type: Date,
		// },
		// executedAt: {
		// 	type: Date,
		// },
		// stepInfo: {
		// 	type: mongoose.Schema.Types.Mixed,
		// }
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
	}
);

campaignSimulationSchema.virtual('id').get(function getId() {
	return this._id.toHexString();
});

campaignSimulationSchema.set('toObject', { virtuals: true });
campaignSimulationSchema.set('toJSON', { virtuals: true });

const CampaignSimulationModel = mongoose.model('campaign_simulation', campaignSimulationSchema);

export default CampaignSimulationModel;
