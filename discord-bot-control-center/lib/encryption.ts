/**
 * Encryption utilities for sensitive data
 * Created: 2025/3/13
 * 
 * This module provides functions for encrypting and decrypting sensitive data
 * using AES-256-GCM symmetric encryption.
 */

import crypto from 'crypto';

// Get encryption key from environment variables
// In production, this should be a secure, randomly generated key
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    // For development, use a default key
    // In production, this should throw an error if no key is provided
    console.warn('ENCRYPTION_KEY not found in environment variables. Using default key for development.');
    return crypto.scryptSync('development-key-do-not-use-in-production', 'salt', 32);
  }
  
  // If key is provided as hex string
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  // If key is provided as base64 string
  if (key.length === 44 && key.endsWith('==')) {
    return Buffer.from(key, 'base64');
  }
  
  // Otherwise, derive a key using scrypt
  return crypto.scryptSync(key, 'salt', 32);
};

/**
 * Encrypts text using AES-256-GCM
 * 
 * @param text - The text to encrypt
 * @returns The encrypted text as a hex string
 */
export const encrypt = (text: string): string => {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher using AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  
  // Encrypt the text
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag();
  
  // Combine IV, auth tag, and encrypted data
  // Format: IV (16 bytes) + Auth Tag (16 bytes) + Encrypted Data
  return Buffer.concat([iv, authTag, encrypted]).toString('hex');
};

/**
 * Decrypts text that was encrypted using AES-256-GCM
 * 
 * @param encryptedHex - The encrypted text as a hex string
 * @returns The decrypted text
 */
export const decrypt = (encryptedHex: string): string => {
  // Convert hex string to buffer
  const buffer = Buffer.from(encryptedHex, 'hex');
  
  // Extract IV, auth tag, and encrypted data
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
  
  // Set authentication tag
  decipher.setAuthTag(authTag);
  
  // Decrypt the data
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  // Return as UTF-8 string
  return decrypted.toString('utf8');
};

/**
 * Checks if a string is encrypted
 * 
 * @param text - The text to check
 * @returns True if the text appears to be encrypted
 */
export const isEncrypted = (text: string): boolean => {
  // Check if the text is a hex string with the minimum length
  // IV (16 bytes) + Auth Tag (16 bytes) + Some encrypted data (at least 1 byte)
  // = 33 bytes minimum = 66 hex characters
  return /^[0-9a-f]{66,}$/i.test(text);
};
