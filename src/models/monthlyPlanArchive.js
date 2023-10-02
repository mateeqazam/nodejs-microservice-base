import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { ObjectId, Date } from '../lib/Mongoose/constants';

const monthlyPlanArchiveSchema = {
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

const MonthlyPlanArchiveModel = new Model(
	DB_COLLECTIONS.monthlyPlanArchive,
	monthlyPlanArchiveSchema
);

export default MonthlyPlanArchiveModel;
