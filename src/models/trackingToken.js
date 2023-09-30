import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String, ObjectId, Date } from '../lib/Mongoose/constants';

const emailTrackingTokenSchema = {
	token: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	campaign: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaign,
		required: true,
	},
	campaignFlowNode: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaignFlow,
		required: true,
	},
	campaignSimulationStep: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaignSimulation,
		required: true,
	},
	sender: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
		required: true,
		index: true,
	},
	prospect: {
		type: ObjectId,
		ref: DB_COLLECTIONS.prospect,
		required: true,
		index: true,
	},
	variant: {
		type: ObjectId,
		required: true,
	},
	sendingAt: {
		type: Date,
	},
};

const EmailTrackingTokenModel = new Model(
	DB_COLLECTIONS.emailTrackingToken,
	emailTrackingTokenSchema
);

export default EmailTrackingTokenModel;
