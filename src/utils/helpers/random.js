export const getRandValue = (min = 0, max = 10000) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

export function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

export function getRandomIntFromRange(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

export const getRandomValue = (min, max) => {
	if (!min || min === 0 || !max || max === 0) return 0;
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function randomChunk(arr, count) {
	const pickedIndexes = {};

	const chunkedResult = [];
	for (let i = 0; i < count; i += 1) {
		const randomIndex = Math.floor(Math.random() * (arr.length - i)) + i;
		if (!pickedIndexes[randomIndex] && arr[randomIndex]) {
			chunkedResult.push(arr[randomIndex]);
			pickedIndexes[randomIndex] = true;
		}
	}
	return chunkedResult;
}
