import sendRequest from './sendRequest';

async function request(url, options = {}) {
	if (!url) return { error: 'Missing Request URL' };
	return sendRequest(url, options);
}

export const putRequest = (url, options = {}) => request(url, { ...options, method: 'PUT' });
export const postRequest = (url, options = {}) => request(url, { ...options, method: 'POST' });

export default request;
