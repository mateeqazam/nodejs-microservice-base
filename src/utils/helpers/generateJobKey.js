import { getLastRoundedMinute } from '.';

function generateMailboxJobKey(prefix, mailbox, roundingFactor) {
	const { _id, email } = mailbox || {};
	if (!_id || !email) return null;

	const lastMinute = getLastRoundedMinute(roundingFactor);
	const timestamp = lastMinute ? new Date(lastMinute).getTime() : Date.now();

	return `${prefix}-${_id}-${email}-${timestamp}`;
}

export function generateSyncMailboxJobKey(mailbox = {}) {
	return generateMailboxJobKey('sync-mailbox', mailbox, 5);
}

export function generateWarmupMailboxJobKey(mailbox = {}) {
	return generateMailboxJobKey('warmup-mailbox', mailbox, 10);
}
