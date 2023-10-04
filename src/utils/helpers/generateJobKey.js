// eslint-disable-next-line import/prefer-default-export
export function generateScheduleEmailJobKey(sender, receiver, msDiff) {
	return `schedule-email-${sender?._id}-${receiver?._id}-${new Date(
		new Date().getTime() + msDiff
	).getTime()}`;
}
