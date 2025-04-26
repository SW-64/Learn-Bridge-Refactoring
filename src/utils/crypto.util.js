import crypto from 'crypto';
import { CRYPTO_SECRET_KEY } from '../constants/env.constant.js';

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(CRYPTO_SECRET_KEY, 'hex');
const ivLength = 16;

// 암호화
const encrypt = (text) => {
  text = text.toString();
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  };
};

// 복호화
const decrypt = (scoreIv, scoreContent) => {
  const iv = Buffer.from(scoreIv, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(scoreContent, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};

export { encrypt, decrypt };
