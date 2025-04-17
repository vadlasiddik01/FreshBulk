import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  try {
    const hash = await hashPassword('admin123');
    console.log('Hashed password for admin123:', hash);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

main();