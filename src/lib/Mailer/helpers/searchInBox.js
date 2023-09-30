import log from '../../../utils/log';
import { parseResponse } from '../../../utils/helpers';

async function searchInBox(imapClient, { box, filter }) {
	try {
		if (!imapClient) throw new Error('IMAP Client cannot be undefined');

		const searchInBoxPromise = new Promise((resolve, reject) => {
			const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
			const searchCriteria = filter || ['ALL', ['SINCE', tenMinutesAgo.toISOString()]];
			imapClient.search(searchCriteria, (error, results) => {
				if (error || !results) {
					return reject(error || `Unable to Search In Box: ${JSON.stringify({ box, filter })}`);
				}
				return resolve(results);
			});
		});

		const { result, error } = await parseResponse(searchInBoxPromise);
		if (error) throw new Error(error);

		return { result };
	} catch (error) {
		const errorMessage = `[searchInBox] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { imapClient, box, filter } });
		return { error };
	}
}

export default searchInBox;
