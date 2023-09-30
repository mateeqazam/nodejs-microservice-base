import { simpleParser } from 'mailparser';

import log from '../../../../utils/log';
import { get, map, filter, pick, omitBy, isNonEmptyArray, isNil } from '../../../../utils/helpers';

const PARSER_OPTIONS = {
	skipHtmlToText: true,
	skipImageLinks: true,
	skipTextToHtml: true,
};

export function parseEmailAttributes(attrs) {
	if (!attrs) return null;

	return {
		flags: filter(
			map(attrs?.flags, (item = '') => item.replace('\\', '').replace('$', '').toLowerCase()),
			(item) => !!item
		),
	};
}

function getEmailAddress(address) {
	if (!address || !isNonEmptyArray(address?.value)) return null;
	return filter(address.value, (obj) => obj && obj.address);
}

export async function parseEmailBody(source, options = PARSER_OPTIONS) {
	try {
		const parsed = await simpleParser(source);
		if (!parsed) return null;

		const result = {
			...pick(parsed, [
				'subject',
				'date',
				'messageId',
				'inReplyTo',
				// 'headers',
				// 'attachments',
				// 'references',
			]),

			from: get(getEmailAddress(parsed?.from), '[0]'),
			to: get(getEmailAddress(parsed?.headers?.get('delivered-to')), '[0]'),
			cc: getEmailAddress(parsed?.cc),
			bcc: getEmailAddress(parsed?.bcc),
			allReceipents: getEmailAddress(parsed?.to),

			xFailedRecipients: parsed?.headers?.get('x-failed-recipients'),
			returnPath: parsed?.headers?.get('return-path'),

			body: parsed?.html || parsed?.text,
		};

		return omitBy(result, isNil);
	} catch (error) {
		const errorMessage = `[parseEmail] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { options } });
		return null;
	}
}
