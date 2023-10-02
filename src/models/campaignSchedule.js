import Model from '../lib/Mongoose/model';
import { WEEK_DAYS } from '../constants';
import DB_COLLECTIONS from '../constants/dbCollections';
import { String, Date } from '../lib/Mongoose/constants';
import createSchema from '../lib/Mongoose/helpers/createSchema';

const campaignScheduleSchema = createSchema({
	name: { type: String, required: true, index: true },
	timezoneUTC: String,
	timings: [
		{
			day: { type: String, enum: WEEK_DAYS?.map((day) => day.toLowerCase()) },
			startTime: Date,
			endTime: Date,
		},
	],
});

campaignScheduleSchema.index({ name: 'text' });

const CampaignScheduleModel = new Model(DB_COLLECTIONS.campaignSchedule, campaignScheduleSchema);

export default CampaignScheduleModel;
