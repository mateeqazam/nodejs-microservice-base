import log from '../log';
import EventLogModel from '../../models/eventLog';

export async function insertEventLog(writeObj) {
	const { event, token, capturedAt } = writeObj || {};
	if (!event || !token || !capturedAt) return { error: 'Missing Required Params' };

	try {
		const result = await EventLogModel.create(writeObj);
		return { result };
	} catch (error) {
		const errorMessage = `[insertEventLog] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams: { write: writeObj } });
		return { error };
	}
}

export async function upsertEventLog(recordItem) {
	const { event, token, capturedAt } = recordItem || {};
	if (!event || !token || !capturedAt) return { error: 'Missing Required Params' };

	let queryParams = null;
	try {
		const filter = { event, token, capturedAt };
		const update = { $set: recordItem };
		const options = { new: true, upsert: true };
		queryParams = { filter, update, options };
		const result = await EventLogModel.findOneAndUpdate(filter, update, options);
		return { result };
	} catch (error) {
		const errorMessage = `[insertEventLog] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams, data: recordItem });
		return { error };
	}
}
