import _ from 'lodash';
import { BUSINESS_HOURS } from '../constants';

export const {
	get,
	map,
	has,
	sum,
	set,
	keys,
	uniq,
	pick,
	omit,
	last,
	find,
	join,
	sumBy,
	first,
	merge,
	isNil,
	assign,
	sortBy,
	omitBy,
	pickBy,
	filter,
	forEach,
	flatten,
	isArray,
	isEmpty,
	groupBy,
	flatMap,
	orderBy,
	isNumber,
	isString,
	startCase,
	camelCase,
	capitalize,
	isFunction,
	isPlainObject,
} = _;

export const isNonEmptyArray = (arr) => isArray(arr) && arr.length;

export const sleep = (ms) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

export function tryCatch(func) {
	return async (...args) => {
		try {
			return await func(...args);
		} catch (err) {
			console.error(`[${func?.name} || tryCatch] Exception`, err?.message || err);
			return { err: err?.message || err };
		}
	};
}

export function mergeUrlWithRoute(baseUrl = '', route = '') {
	const cleanedBaseUrl = baseUrl.replace(/\/+$/, '');
	const cleanedRoute = route.replace(/^\/+/, '');
	return `${cleanedBaseUrl}/${cleanedRoute}`;
}

export async function parseResponse(promise) {
	return promise.then((result) => ({ result })).catch((error) => ({ error }));
}

export function removeEmptyProps(obj) {
	return pickBy(obj, (value) => {
		if (isArray(value)) return !isEmpty(value);
		if (!isPlainObject(value)) return !isNil(value);

		const cleaned = removeEmptyProps(value);
		return !isEmpty(cleaned);
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

export function getTimezoneHour(timezoneOffset = 0) {
	const now = new Date();
	const currentHour = now.getUTCHours();
	const timezoneHour = currentHour + timezoneOffset;
	return (timezoneHour + 24) % 24;
}

export function isCurrentTimeInBusinessHours(timezoneOffset = 0) {
	const timezoneHour = getTimezoneHour(timezoneOffset);
	// TODO: need to test all the edge cases
	return timezoneHour >= BUSINESS_HOURS?.from && timezoneHour < BUSINESS_HOURS?.to;
}

export function getTimeAgo({ minutes } = {}) {
	let millisecondsAgo = 0;
	if (isNumber(minutes) && minutes > 0) millisecondsAgo = minutes * 60 * 1000;

	const currentTime = Date.now();
	return new Date(currentTime - millisecondsAgo);
}

export function getPreviousBusinessDayCloseTime() {
	const now = new Date();
	const previousDay = new Date();
	previousDay.setDate(now.getDate() - 1);

	const closeHour = Math.max((BUSINESS_HOURS?.to || 0) - 1, 0);
	previousDay.setHours(closeHour, 30);
	return previousDay;
}
