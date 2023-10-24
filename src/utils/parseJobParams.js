import { omit } from 'lodash';

function parseJobParams(job, keysToExclude = []) {
	const { id, name, data } = job || {};
	return { jobId: id, jobName: name, data: omit(data, keysToExclude) };
}

export default parseJobParams;
