import _ from 'lodash';

export const isNonEmptyArray = (arr) => _.isArray(arr) && arr.length;

export async function parseResponse(promise) {
	return promise.then((result) => ({ result })).catch((error) => ({ error }));
}

export function removeEmptyProps(obj) {
	return _.pickBy(obj, (value) => {
		if (_.isArray(value)) return !_.isEmpty(value);
		if (!_.isPlainObject(value)) return !_.isNil(value);

		const cleaned = removeEmptyProps(value);
		return !_.isEmpty(cleaned);
	});
}
