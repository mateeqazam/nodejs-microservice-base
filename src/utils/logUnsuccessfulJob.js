import logger from './logger';

function logUnsuccessfulJob({ queueTitle, prefix, reason, job, data }) {
	const { id, name } = job || {};
	const jobIdentifier = id + (name ? `:~${name}` : '');

	const baseText = `${queueTitle ? `[${queueTitle}]` : ''} ${prefix || ''}`.trim();
	const warningMessage = `Worker Job ${jobIdentifier} was unsuccessful. Reason: ${reason}`;
	logger.warn(`${baseText} ${warningMessage}`, { data });

	return { success: false, reason };
}

export default logUnsuccessfulJob;
