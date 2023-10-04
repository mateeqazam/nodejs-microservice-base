import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String, ObjectId } from '../lib/Mongoose/constants';

const campaignHistorySchema = {
	campaign_id: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaign,
		required: true,
	},
	prospect_id: {
		type: ObjectId,
		ref: DB_COLLECTIONS.prospect,
		required: true,
		index: true,
	},
	flowItemsCompleted: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaignFlow,
		required: true,
	},
	flowItemsCompletedAt: {
		type: Date,
		default: Date.now,
	},
	flowItemRefData: {
		type: [String],
		default: [],
	},
	flowItemsCompletionStatus: {
		enum: ['default', 'success', 'failure'],
		default: 'success',
		type: String,
		required: true,
	},
	status: {
		enum: ['started', 'completed'],
		default: 'started',
		type: String,
		required: true,
	},
};

const CampaignHistoryModel = new Model(DB_COLLECTIONS.campaignHistory, campaignHistorySchema);

export default CampaignHistoryModel;
