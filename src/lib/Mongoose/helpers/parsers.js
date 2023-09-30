import { pick } from 'lodash';

import { DEFAULT_SELECT_LIMIT, MONGO_UPDATE_OPERATORS } from '../constants';

export function parseQueryOptions(queryOptions) {
	const { filter: filters, skip = 0, limit, skipLimit, ...otherOptions } = queryOptions || {};
	const parsedLimit = limit || (!skipLimit ? DEFAULT_SELECT_LIMIT : null);
	return {
		filter: filters,
		skip,
		limit: parsedLimit,
		...otherOptions,
	};
}

export function parseWriteOperations(writeParams = {}) {
	const nonMongoOpsKeys = Object.keys(writeParams).filter(
		(key) => !MONGO_UPDATE_OPERATORS.includes(key)
	);

	return {
		...writeParams,
		$set: {
			...pick(writeParams, nonMongoOpsKeys),
			...(writeParams.$set || {}),
		},
	};
}
