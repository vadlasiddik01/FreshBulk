// scripts/seed.ts
import { storage } from '../server/storage';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {

  const hashedPassword = await hashPassword('admin123');

  await storage.createUser({
    username: 'admin',
    email: 'admin@freshbulk.com',
    password: hashedPassword,
    role: 'admin', // if you have a role field
  });
  console.log('✅ Admin user created successfully!');

}

main().catch((err) => {
  console.error('❌ Error during seeding:', err);
});