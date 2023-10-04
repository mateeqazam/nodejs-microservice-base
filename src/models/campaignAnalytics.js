import Model from '../lib/Mongoose/model';
import { ObjectId } from '../lib/Mongoose/constants';
import DB_COLLECTIONS from '../constants/dbCollections';

const campaignAnalyticsSchema = {
	campaign_id: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaign,
		required: true,
	},
	executionStartDate: {
		type: Date,
		default: Date.now,
	},
	executionEndDate: {
		type: Date,
	},
	variant_id: {
		type: ObjectId,
		required: true,
	},
	prospect_id: {
		type: ObjectId,
		ref: DB_COLLECTIONS.prospect,
		required: true,
	},
	total_emails_sent: {
		type: Number,
		default: 0,
	},
	emails_bounced: {
		type: Number,
		default: 0,
	},
	clicks: {
		type: Number,
		default: 0,
	},
	opened: {
		type: Number,
		default: 0,
	},
	// notreached = (total_prospects - (clicked+opened)/2) * 100 /total_propsects
	received_replies: {
		type: Number,
		default: 0,
	},
	unsubscribed: {
		type: Number,
		default: 0,
	},
};

const CampaignAnalyticsModel = new Model(DB_COLLECTIONS.campaignAnalytics, campaignAnalyticsSchema);

export default CampaignAnalyticsModel;
