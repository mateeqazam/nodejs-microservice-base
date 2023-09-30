import log from '../log';
import { isEmpty } from '../helpers';
import EmailLogModel from '../../models/emailLog';

export async function getEmailLog(queryParams) {
	try {
		const { filter: filterObj, select, sort } = queryParams || {};
		if (!filterObj || isEmpty(filterObj)) return { error: 'Missing Filter Params' };

		const filter = {
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
			...(filterObj || {}),
		};

		const defaultSort = { createdAt: -1 };
		const result = await EmailLogModel.findOne(filter, select).sort(sort || defaultSort);
		return { result: result?._doc || result };
	} catch (error) {
		const errorMessage = `[getEmailLog] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams });
		return { error };
	}
}

export async function insertEmailLog(writeObj) {
	const { to, from } = writeObj || {};
	if (!to || !from) return { error: 'Missing Required Params' };

	try {
		const result = await EmailLogModel.create(writeObj);
		return { result };
	} catch (error) {
		const errorMessage = `[insertEmailLog] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams: { write: writeObj } });
		return { error };
	}
}

export async function getEmailLogs(queryParams) {
	try {
		const { filter, select, sort, limit } = queryParams || {};
		if (!filter || isEmpty(filter)) return { error: 'Missing Filter Params' };

		const defaultSort = { createdAt: 1 };
		const result = await EmailLogModel.find(filter, select)
			.sort(sort || defaultSort)
			.limit(limit);

		return { result };
	} catch (error) {
		const errorMessage = `[getEmailLogs] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams });
		return { error };
	}
}
