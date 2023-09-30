import log from '../../../utils/log';
import { parseResponse } from '../../../utils/helpers';

async function openBox(imapClient, boxPath) {
	try {
		if (!imapClient) throw new Error('IMAP Client cannot be undefined');
		if (!boxPath) throw new Error('Missing Box Path');

		const openBoxPromise = new Promise((resolve, reject) => {
			imapClient.openBox(boxPath, true, (error, box) => {
				if (box) return resolve(box);
				return reject(error || `Unable to Open Box: ${boxPath}`);
			});
		});

		const { result, error } = await parseResponse(openBoxPromise);
		if (error) throw new Error(error);

		return { result };
	} catch (error) {
		const errorMessage = `[openBox] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { imapClient, boxPath } });
		return { error };
	}
}

export default openBox;
