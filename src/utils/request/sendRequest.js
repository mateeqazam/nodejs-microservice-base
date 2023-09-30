import fetch from 'node-fetch';

async function sendRequest(url, options = {}) {
	const { method = 'GET', headers = {}, data, IP, isTextResponse } = options;

	if (!headers) {
		if (data) {
			headers['Content-Type'] = 'application/json';
		}
	}
	if (IP) headers['x-forwarded-for'] = IP;

	const reqOptions = {
		headers,
		method,
		...(data ? { body: JSON.stringify(data) } : {}),
	};

	const response = await fetch(url, reqOptions);
	if (!response || !response.ok) {
		return {
			err: `Network response was not ok (status: ${response?.status}, statusText: ${response?.statusText} )`,
		};
	}

	return {
		res: isTextResponse ? await response.text() : await response.json(),
	};
}

export default sendRequest;
