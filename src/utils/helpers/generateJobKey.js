// eslint-disable-next-line import/prefer-default-export
export function generateEmailTrackingEventJobKey(event, token, capturedAt) {
	if (!event || !token || !capturedAt) return null;
	return `${event}-${token}-${new Date(capturedAt).getTime()}`;
}
