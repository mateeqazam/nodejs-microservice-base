import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { ObjectId, Date } from '../lib/Mongoose/constants';

const monthlyPlanSchema = {
	mailbox: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
		required: true,
		unique: true,
	},
	totalEmails: {
		type: Number,
	},
	dailySchedule: [
		{
			emailCount: {
				type: Number,
			},
			date: {
				type: Date,
			},
		},
	],
	startAt: {
		type: Date,
		required: true,
	},
	endAt: {
		type: Date,
		required: true,
	},
};

const MonthlyPlanModel = new Model(DB_COLLECTIONS.monthlyPlan, monthlyPlanSchema);

export default MonthlyPlanModel;
