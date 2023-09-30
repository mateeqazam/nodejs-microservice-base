import sendRequest from './sendRequest';
import tryCatch from '../helpers/tryCatch';

async function request(url, options = {}) {
	if (!url) return { error: 'Missing Request URL' };

	const { result, error } = await sendRequest(url, options);
	if (error) return { err: error?.message || error };
	return { result };
}

export const putRequest = (url, options = {}) => request(url, { ...options, method: 'PUT' });
export const postRequest = (url, options = {}) => request(url, { ...options, method: 'POST' });

export default tryCatch(request);
