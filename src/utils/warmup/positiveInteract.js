import logger from '../logger';
import { isNonEmptyArray } from '../helpers';
import MailboxModel from '../../models/mailbox';
import interactViaIMAP from '../mail-interaction/interactViaIMAP';
import interactViaOutlook from '../mail-interaction/interactViaOutlook';

async function positiveInteract(mailboxId, emails) {
	try {
		if (!mailboxId) throw new Error('Missing Required Params.');
		if (!isNonEmptyArray(emails)) return;

		const toMailbox = await MailboxModel.findOne({
			filter: {
				_id: mailboxId,
				status: 'active',
				deletedAt: { $exists: false },
			},
		});
		if (!toMailbox) {
			logger.debug(`[positiveInteract] ${mailboxId} Mailbox not Found.`, { data: { mailboxId } });
			return;
		}

		if (toMailbox.provider === 'outlook') {
			await interactViaOutlook({ toMailbox, emails });
		} else {
			await interactViaIMAP({ toMailbox, emails });
		}
	} catch (error) {
		const errorMessage = `[positiveInteract] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { to: mailboxId, emails } });
		throw error;
	}
}

export default positiveInteract;
