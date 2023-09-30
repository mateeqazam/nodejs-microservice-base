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

export function getLastRoundedMinute(roundingFactor) {
	const now = new Date();
	const minutes = now.getMinutes();
	const roundedMinutes = Math.floor(minutes / roundingFactor) * roundingFactor;
	return new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		now.getHours(),
		roundedMinutes,
		0
	);
}
