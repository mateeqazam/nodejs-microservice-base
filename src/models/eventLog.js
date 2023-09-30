import mongoose from 'mongoose';

import { EMAIL_EVENTS } from '../config';

const eventLogsSchema = new mongoose.Schema(
	{
		event: {
			type: String,
			enum: Object.values(EMAIL_EVENTS),
			required: true,
			index: true,
		},
		token: {
			type: String,
			required: true,
		},
		url: {
			type: String,
		},
		capturedAt: {
			type: Date,
		},
	},
	{
		timestamps: {
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
	}
);

eventLogsSchema.virtual('id').get(function getId() {
	return this._id.toHexString();
});

eventLogsSchema.set('toObject', { virtuals: true });
eventLogsSchema.set('toJSON', { virtuals: true });

const EventLogModel = mongoose.model('tracker_event_logs', eventLogsSchema);

export default EventLogModel;
