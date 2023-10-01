import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String, Date, Boolean, ObjectId } from '../lib/Mongoose/constants';
import {
	FLOW_NODE_TYPES,
	SIMULATION_STEP_STATUSES,
	TRIGGER_CONDITIONS,
	TRIGGER_NODE_VARIANTS,
} from '../constants/campaign';

const campaignSimulationSchema = {
	campaign: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaign,
		required: true,
		index: true,
	},
	campaignFlowNode: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaignFlow,
		required: true,
		index: true,
	},
	prospect: {
		type: ObjectId,
		ref: DB_COLLECTIONS.prospect,
		required: true,
		index: true,
	},
	sender: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
		index: true,
	},
	stepType: {
		type: String,
		enum: Object.values(FLOW_NODE_TYPES),
		required: true,
		index: true,
	},
	status: {
		type: String,
		enum: Object.values(SIMULATION_STEP_STATUSES),
		default: SIMULATION_STEP_STATUSES.ACTIVE,
		required: true,
		index: true,
	},
	details: {
		scheduledAt: Date,
		executedAt: Date,
		triggerCondition: {
			type: String,
			enum: Object.values(TRIGGER_CONDITIONS),
		},
		triggerNodeVariant: {
			type: String,
			enum: Object.values(TRIGGER_NODE_VARIANTS),
		},
		scheduledEmailQueueItemID: ObjectId,
		emailOpened: Boolean,
		gotReplied: Boolean,
		emailBounced: Boolean,
	},
	error: {
		message: String,
	},
};

const CampaignSimulationModel = new Model(
	DB_COLLECTIONS.campaignSimulation,
	campaignSimulationSchema
);

export default CampaignSimulationModel;
