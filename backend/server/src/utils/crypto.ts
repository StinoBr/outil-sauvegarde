import { createCipheriv, createDecipheriv, scryptSync, randomBytes } from 'node:crypto';
import { appConfig } from '../config/appConfig';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = appConfig.encryptionSecret.padEnd(32, '0').slice(0, 32);
const IV_LENGTH = 16;

const key = scryptSync(SECRET_KEY, 'salt', 32);

export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, content] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Erreur de déchiffrement:', error);
    return '';
  }
}
