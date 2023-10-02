import logger from '../logger';
import MailboxModel from '../../models/mailbox';
import interactViaIMAP from '../mail-interaction/interactViaIMAP';
import interactViaOutlook from '../mail-interaction/interactViaOutlook';

async function positiveInteract(params) {
	try {
		const { to, emails } = params || {};
		if (!to) throw new Error('Missing Required Params.');

		const toMailbox = await MailboxModel.findOne({
			filter: {
				_id: to,
				status: 'active',
				deletedAt: { $exists: false },
			},
		});
		if (!toMailbox) {
			logger.debug('[positiveInteract] Mailbox not Found.');
			return;
		}

		if (toMailbox.provider === 'outlook') {
			await interactViaOutlook({ toMailbox, emails });
		}
		await interactViaIMAP({ toMailbox, emails });
	} catch (error) {
		const errorMessage = `[positiveInteract] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params });
		throw error;
	}
}

export default positiveInteract;
