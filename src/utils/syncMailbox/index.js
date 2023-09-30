import promiseLimit from 'promise-limit';

import log from '../log';
import Mailer from '../../lib/Mailer';
import { forEach, map } from '../helpers';
import syncBoxEmails from '../syncBoxEmails';

import { BOXES_TO_EXCLUDE } from './constants';

async function syncMailbox(params) {
	const { mailbox, filter = {} } = params || {};

	try {
		if (!mailbox) throw new Error('Missing Mailbox');

		const mailer = new Mailer(mailbox);
		if (!mailer) throw new Error('Missing Mailer');

		const { error: imapConnectionError } = await mailer.getIMAPClient();
		if (imapConnectionError) throw new Error(imapConnectionError);

		const { result: boxes, error: boxesError } = await mailer.getBoxes();
		if (boxesError) throw new Error(boxesError);

		const filteredBoxes = [];
		forEach(boxes, (box) => {
			if (!box || (!box.label && !box.path)) return;
			if (BOXES_TO_EXCLUDE.includes(box.label)) return;
			filteredBoxes.push({ label: box?.label, path: box?.path });
		});

		// need optimisation: execution in series becuase box are not opened in parallel
		const pLimit = promiseLimit(1);
		await Promise.all(
			map(filteredBoxes, (box) => pLimit(() => syncBoxEmails({ mailer, box, filter })))
		);

		log.debug('[syncMailbox] Mailbox Synced', mailbox?.email);
		return { success: true };
	} catch (error) {
		const errorMessage = `[syncMailbox] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params });
		return { error };
	}
}

export default syncMailbox;
