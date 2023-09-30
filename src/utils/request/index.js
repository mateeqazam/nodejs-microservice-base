import { tryCatch } from '../helpers';
import sendRequest from './sendRequest';

const request = tryCatch(async (url, options = {}) => {
	if (!url) return { err: 'Missing Request URL' };

	const { res, err } = await sendRequest(url, options);
	if (err) return { err: err?.message || err };
	return { res };
});

export const putRequest = (url, options = {}) => request(url, { ...options, method: 'PUT' });
export const postRequest = (url, options = {}) => request(url, { ...options, method: 'POST' });

export default request;
