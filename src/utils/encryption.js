import crypto from 'crypto';
import { Buffer } from 'buffer';
import { ENCRYPTION_KEY } from '../config';

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

function encrypt(str) {
	const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
	const encrypted = Buffer.concat([cipher.update(str), cipher.final()]);
	return {
		iv: iv.toString('hex'),
		content: encrypted.toString('hex'),
	};
}

function decrypt(encrypted) {
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

export function getEncryptedPassword(password) {
	if (!password) return password;
	return Buffer.from(JSON.stringify(encrypt(password))).toString('base64');
}

export function getDecryptedPassword(encryptedPassword) {
	return decrypt(JSON.parse(Buffer.from(encryptedPassword, 'base64').toString('ascii')));
}
