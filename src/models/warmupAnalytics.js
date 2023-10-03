import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { Mixed, ObjectId, Date } from '../lib/Mongoose/constants';

const warmupAnalyticsSchema = {
	mailbox: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
		required: true,
		unique: true,
	},
	emailCountTimeline: [{ type: Mixed }],
	spamScoreTimeline: [{ type: Mixed }],
	todayEmailCount: Number,
	todayReplyCount: Number,
	cumulativeSpamRate: Number,
	cumulativeReputation: Number,
	date: {
		type: Date,
		required: true,
	},
};

const WarmupAnalyticsModel = new Model(DB_COLLECTIONS.warmupAnalytics, warmupAnalyticsSchema);

export default WarmupAnalyticsModel;
