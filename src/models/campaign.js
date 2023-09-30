import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String, Date, Boolean, ObjectId } from '../lib/Mongoose/constants';
import {
	CAMPAIGN_STATUSES,
	CONFIG_SENDTO_OPTIONS,
	CONFIG_MISSING_VARIABLES_CASES,
} from '../constants/campaign';

const campaignSchema = {
	name: {
		type: String,
		index: true,
	},
	status: {
		type: String,
		enum: Object.values(CAMPAIGN_STATUSES),
		default: CAMPAIGN_STATUSES.DRAFT,
		index: true,
	},
	sender: [
		{
			type: ObjectId,
			ref: DB_COLLECTIONS.mailbox,
			index: true,
		},
	],
	prospects: {
		type: ObjectId,
		ref: DB_COLLECTIONS.prospectList,
	},
	excludeProspects: [
		{
			type: ObjectId,
			ref: DB_COLLECTIONS.prospectList,
		},
	],
	duration: {
		startingAt: Date,
		endingAt: Date,
		timezoneUTC: String,
	},
	selectedSchedule: {
		type: ObjectId,
		ref: DB_COLLECTIONS.campaignSchedule,
	},
	sendTo: {
		type: String,
		enum: Object.values(CONFIG_SENDTO_OPTIONS),
		default: CONFIG_SENDTO_OPTIONS.ALL,
	},
	missingVariableCase: {
		type: String,
		enum: Object.values(CONFIG_MISSING_VARIABLES_CASES),
		default: CONFIG_MISSING_VARIABLES_CASES.SEND_TO_CHECKLIST,
	},
	doNotSendTo: {
		unverified: Boolean,
		unverifiable: Boolean,
	},
	openTracking: {
		type: Boolean,
		default: true,
	},
	linkTracking: {
		type: Boolean,
		default: true,
	},
	doNotSendToResponders: {
		type: Boolean,
		default: false,
	},
	pauseDate: Date,
	// pausedBy: {
	//   type: ObjectId,
	//   ref: 'prospect_list',
	// },
	// pausedAt: {
	//   type: Date,
	// },
};

const CampaignModel = new Model(DB_COLLECTIONS.campaign, campaignSchema);

export default CampaignModel;
