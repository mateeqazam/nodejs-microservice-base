import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String, Date, ObjectId } from '../lib/Mongoose/constants';
import { CAMPAIGN_EMAIL_QUEUE_STATUSES } from '../constants/campaign';

const emailsToBeScheduledSchema = {
	campaignSimulationStep: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaignSimulation,
		required: true,
		index: true,
	},
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
	sender: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
		required: true,
	},
	prospect: {
		type: ObjectId,
		ref: DB_COLLECTIONS.prospect,
		required: true,
		index: true,
	},
	emailVariant: ObjectId,
	status: {
		type: String,
		enum: Object.values(CAMPAIGN_EMAIL_QUEUE_STATUSES),
		default: CAMPAIGN_EMAIL_QUEUE_STATUSES?.ACTIVE,
		required: true,
		index: true,
	},
	scheduledAt: Date,
	sentAt: Date,
	emailLog: {
		type: ObjectId,
		ref: DB_COLLECTIONS.emailLog,
	},
	failedCount: {
		type: Number,
		default: 0,
	},
	error: {
		message: String,
	},
};

const EmailsToBeScheduledModel = new Model(
	DB_COLLECTIONS.emailsToBeScheduled,
	emailsToBeScheduledSchema
);

export default EmailsToBeScheduledModel;
