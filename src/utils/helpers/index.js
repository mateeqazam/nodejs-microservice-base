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

export function findMinKeyAndValue(obj) {
	const { minKey, minValue } = Object.entries(obj).reduce(
		(acc, [key, value]) => (value < acc.minValue ? { minKey: key, minValue: value } : acc),
		{ minKey: null, minValue: Infinity }
	);
	return { minKey, minValue };
}

export function getEmailVariantCountsMap(emailVariants) {
	const variantsWithSentCount = {};
	if (!isNonEmptyArray(emailVariants)) return variantsWithSentCount;

	_.forEach(emailVariants, (variantItem) => {
		const { campaign, campaignFlowNode, variant, count = 0 } = variantItem || {};
		variantsWithSentCount[campaign] ??= {};
		variantsWithSentCount[campaign][campaignFlowNode] ??= {};
		variantsWithSentCount[campaign][campaignFlowNode][variant] = count || 0;
	});

	return variantsWithSentCount;
}

export function camelToSnakeCase(str) {
	if (!str || _.isString(str)) return null;

	return str.replace(/[A-Z]/g, (letter, index) =>
		index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`
	);
}
