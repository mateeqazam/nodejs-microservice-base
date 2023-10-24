import 'isomorphic-fetch';
import fetch from 'node-fetch';

async function sendRequest(url, options = {}) {
	const { method = 'GET', headers = {}, data, IP, isTextResponse } = options;

	if (IP) headers['x-forwarded-for'] = IP;
	if (!headers['Content-Type'] && data) {
		headers['Content-Type'] = 'application/json';
	}

	const reqOptions = {
		headers,
		method,
		...(data ? { body: JSON.stringify(data) } : {}),
	};

	const response = await fetch(url, reqOptions);
	if (!response || !response.ok) {
		throw new Error(
			`Network response was not ok (status: ${response.status}, statusText: ${response.statusText})`
		);
	}

	const result = isTextResponse ? await response.text() : await response.json();
	return { status: response?.status, result };
}

export default sendRequest;
