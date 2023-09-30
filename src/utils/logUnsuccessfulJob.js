import log from './log';

function logUnsuccessfulJob({ queueTitle, prefix, reason, job, data }) {
	const { id, name } = job || {};
	const jobIdentifier = `${id}${name ? `:~${name}` : ''}`;

	const baseText = `${queueTitle ? `[${queueTitle}]` : ''} ${prefix || ''}`.trim();
	log.warn(`${baseText} Worker Job ${jobIdentifier} was unsuccessful. Reason: ${reason}`, { data });
	return { success: false, reason };
}

export default logUnsuccessfulJob;
