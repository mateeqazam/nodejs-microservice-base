import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { Date, ObjectId } from '../lib/Mongoose/constants';
import createSchema from '../lib/Mongoose/helpers/createSchema';

const dailyPlanSchema = createSchema({
	mailbox: {
		type: ObjectId,
		ref: DB_COLLECTIONS.mailbox,
		required: true,
	},
	totalEmails: {
		type: Number,
	},
	plannedEmails: {
		type: Number,
	},
	date: {
		type: Date,
		required: true,
	},
	hourlySchedule: [
		{
			time: {
				type: Date,
				required: true,
			},
			to: {
				type: ObjectId,
				ref: DB_COLLECTIONS.mailbox,
				required: true,
			},
			template: {
				type: ObjectId,
				ref: DB_COLLECTIONS.emailTemplate,
				required: true,
			},
		},
	],
});

dailyPlanSchema.index({ mailbox: 1, date: 1 }, { unique: true });

const DailyPlanModel = new Model(DB_COLLECTIONS.dailyPlan, dailyPlanSchema);

export default DailyPlanModel;
