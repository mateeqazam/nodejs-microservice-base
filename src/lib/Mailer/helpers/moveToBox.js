import log from '../../../utils/log';
import { parseResponse } from '../../../utils/helpers';

async function moveToBox(imapClient, { uid, targetBox }) {
	try {
		if (!uid) throw new Error('Missing UID');
		if (!targetBox) throw new Error('Missing Target Box');
		if (!imapClient) throw new Error('IMAP Client cannot be undefined');

		const moveToBoxPromise = new Promise((resolve, reject) => {
			imapClient.move(uid, targetBox, (error) => {
				console.log('error', error, uid, targetBox);
				if (error) return reject(error);
				return resolve();
			});
		});

		const { error } = await parseResponse(moveToBoxPromise);
		if (error) throw new Error(error);

		return { success: true };
	} catch (error) {
		const errorMessage = `[moveToBox] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { imapClient, uid, targetBox } });
		return { error };
	}
}

export default moveToBox;
