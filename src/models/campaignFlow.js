import Model from '../lib/Mongoose/model';
import { ObjectId } from '../lib/Mongoose/constants';
import DB_COLLECTIONS from '../constants/dbCollections';
import createSchema from '../lib/Mongoose/helpers/createSchema';
import { FLOW_NODE_TYPES, TRIGGER_CONDITIONS, TRIGGER_NODE_VARIANTS } from '../constants/campaign';

const campaignFlowSchema = createSchema({
	campaign: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaign,
		required: true,
		index: true,
	},
	stepType: {
		type: String,
		enum: Object.values(FLOW_NODE_TYPES),
		default: FLOW_NODE_TYPES?.START,
		required: true,
		index: true,
	},
	parentStep: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaignFlow,
	},
	parentStepType: {
		type: String,
		enum: Object.values(TRIGGER_NODE_VARIANTS),
		default: TRIGGER_NODE_VARIANTS.DEFAULT,
	},
	tag: String,
	goalName: String,
	waitDelay: { type: Number, default: 0 },
	triggerDelay: { type: Number, default: 0 },
	triggerCondition: {
		type: String,
		enum: Object.values(TRIGGER_CONDITIONS),
	},
	emailVariants: [
		{
			variantNumber: {
				type: String,
				enum: ['A', 'B', 'C', 'D', 'E'],
			},
			emailTemplateId: {
				type: ObjectId,
				ref: DB_COLLECTIONS.campaignsEmailTemplates,
			},
			emailSubject: String,
			emailBody: String,
			templateName: String,
			isPause: { type: Boolean, default: false },
		},
	],
	location: {
		x: Number,
		y: Number,
	},
});

campaignFlowSchema.index({ tag: 'text' });

const CampaignFlowModel = new Model(DB_COLLECTIONS.campaignFlow, campaignFlowSchema);

export default CampaignFlowModel;
