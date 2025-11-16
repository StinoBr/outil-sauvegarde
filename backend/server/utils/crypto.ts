// backend/server/utils/crypto.ts

// C'est un module intégré à Node.js
import { createCipheriv, createDecipheriv, scryptSync } from 'crypto';

// --- Configuration (NE JAMAIS METTRE EN DUR DANS UN VRAI PROJET) ---
// Idéalement, ceci devrait venir de vos variables d'environnement (.env)
const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = 'votre-super-secret-de-32-caracteres'; // Doit faire 32 octets
const IV_LENGTH = 16; // Pour AES

// On dérive une clé de 32 octets à partir de notre secret
const key = scryptSync(SECRET_KEY, 'salt', 32);

/**
 * Chiffre un texte (ex: un mot de passe)
 */
export function encrypt(text: string): string {
  // Crée un "Initial Vector" aléatoire
  const iv = Buffer.alloc(IV_LENGTH, 0); // Pour la simplicité, on utilise un IV nul. Idéalement, il devrait être aléatoire.
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Déchiffre un texte
 */
export function decrypt(encryptedText: string): string {
  const iv = Buffer.alloc(IV_LENGTH, 0); // Doit être le même IV que pour le chiffrement

  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Erreur de déchiffrement:', error);
    return ''; // Retourne une chaîne vide en cas d'échec
  }
}