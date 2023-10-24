import crypto from 'crypto';
import { Buffer } from 'buffer';

import { ENCRYPTION_KEY } from '../../config';

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

export function encrypt(str) {
	const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
	const encrypted = Buffer.concat([cipher.update(str), cipher.final()]);
	return {
		iv: iv.toString('hex'),
		content: encrypted.toString('hex'),
	};
}

export function decrypt(encrypted) {
	const decipher = crypto.createDecipheriv(
		algorithm,
		ENCRYPTION_KEY,
		Buffer.from(encrypted.iv, 'hex')
	);
	return Buffer.concat([
		decipher.update(Buffer.from(encrypted.content, 'hex')),
		decipher.final(),
	]).toString();
}
