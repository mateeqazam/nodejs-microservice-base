import linkifyHtml from 'linkify-html';

import log from '../../../utils/log';
import { camelCase, mergeUrlWithRoute } from '../../../utils/helpers';
import { PRIBOX_TRACKER_HOST, EMAIL_PIXEL_IMAGE_PATH } from '../../../config';

export const generateFullName = ({ firstName, lastName } = {}) =>
	`${firstName} ${lastName || ''}`.trim();

export function generateAddressField(mailbox = {}) {
	const fullName = generateFullName(mailbox);
	return `${fullName} <${mailbox.email}>`;
}

export function interpolateVariables(body = '', variables = {}) {
	const modifiedBody = body.replace(/\{\{([^:}]+)(?::([^}]*))?\}\}/g, (match, key, fallback) => {
		const camelCasedKey = camelCase(key.trim());
		return variables[camelCasedKey] || fallback || '';
	});

	return modifiedBody;
}

export const addSignatureToEmailBody = (body, signature) =>
	signature ? `${body || ''}<br/><div>${signature}</div>` : body;

export function addUnsubscribeLinkToEmailBody(body, trackingToken) {
	const route = trackingToken ? `/unsubscribe?token=${trackingToken}` : '/unsubscribe';
	const url = mergeUrlWithRoute(PRIBOX_TRACKER_HOST, route);
	return `${body || ''}<br/><div><a href="${url}">Unsubscribe</a></div>`;
}

export function attachLinkTrackerToEmailBody(body, trackingToken) {
	if (!trackingToken) return body;

	try {
		const linkifiedEmailBody = linkifyHtml(body || '');

		const anchorPattern = /<a\s+([^>]+)>(.*?)<\/a>/gi;
		const hrefPattern = /href=["']([^'"]*)["']/gi;
		const modifiedEmailBody = linkifiedEmailBody.replace(
			anchorPattern,
			(match, attributes, content) => {
				const modifiedHref = hrefPattern.exec(attributes);
				if (modifiedHref) {
					const originalHref = modifiedHref[1];
					const encodedOriginalHref = encodeURIComponent(originalHref);
					const route = `/link?token=${trackingToken}&url=${encodedOriginalHref}`;
					const url = mergeUrlWithRoute(PRIBOX_TRACKER_HOST, route);
					const modifiedLink = `href="${url}"`;
					return `<a ${attributes.replace(hrefPattern, modifiedLink)}>${content}</a>`;
				}
				return match;
			}
		);

		return modifiedEmailBody;
	} catch (error) {
		const errorMessage = `[attachLinkTrackerToEmailBody Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { body, trackingToken } });
		return body;
	}
}

export function attachOpenTrackerToEmailBody(body, trackingToken) {
	if (!trackingToken) return body;

	try {
		const emailPixelImageRoute = `${EMAIL_PIXEL_IMAGE_PATH}?token=${trackingToken}`;
		const emailPixelImageURL = mergeUrlWithRoute(PRIBOX_TRACKER_HOST, emailPixelImageRoute);
		return `${body}<div><img width="1" height="1" alt="email" src="${emailPixelImageURL}" /></div>`;
	} catch (error) {
		const errorMessage = `[attachOpenTrackerToEmailBody Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { body, trackingToken } });
		return body;
	}
}
