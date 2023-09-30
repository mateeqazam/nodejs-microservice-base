import log from '../log';
import { isNonEmptyArray } from '../helpers';

async function fetchAndProcessRecords(queryParams, additionalParams = {}) {
	try {
		const { filter, select, skip = 0 } = queryParams || {};

		const { DBModel, processRecords, batchSize } = additionalParams || {};
		if (!DBModel) throw new Error('Missing DBModel');
		if (!processRecords) throw new Error('Missing Parser Function');

		const records = await DBModel.find(filter).select(select).skip(skip).limit(batchSize);
		if (isNonEmptyArray(records)) {
			if (processRecords) await processRecords(records);

			const updatedQueryParams = { ...(queryParams || {}), skip: skip + batchSize };
			const totalProcessed =
				records.length + (await fetchAndProcessRecords(updatedQueryParams, additionalParams));
			return { result: { totalProcessed } };
		}

		return { result: { totalProcessed: 0 } };
	} catch (error) {
		const errorMessage = `[fetchAndProcessRecords] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams, params: { additionalParams } });
		return { error };
	}
}

export default fetchAndProcessRecords;
