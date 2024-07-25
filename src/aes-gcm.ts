import { base64ToUint8Array, stringToUint8Array, toUint8Array, uint8ArrayToBase64 } from 'uint8array-extras'

// ### Based on: https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a?permalink_comment_id=4475767#gistcomment-4475767
export const SEPARATOR = '|'
/**
 * Encrypts plaintext using AES-GCM with supplied password, for decryption with decrypt().
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {string} plaintext - Plaintext to be encrypted.
 * @param   {string} password - Password to use to encrypt plaintext.
 * @returns {string} Encrypted ciphertext.
 *
 * @example
 *   const ciphertext = await encrypt('my secret text', 'pw');
 *   encrypt('my secret text', 'pw').then(function(ciphertext) { console.log(ciphertext); });
 */
export async function encrypt(
  plaintext: string,
  password: string,
): Promise<string> {
  const pwUtf8 = stringToUint8Array(password) // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8) // hash the password

  const ivUtf8 = crypto.getRandomValues(new Uint8Array(12)) // get 96-bit random iv
  const ivB64 = uint8ArrayToBase64(ivUtf8) // iv as base64 string

  const alg = { name: 'AES-GCM', iv: ivUtf8 } // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, [
    'encrypt',
  ]) // generate key from pw

  const ptUtf8 = stringToUint8Array(plaintext) // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUtf8) // encrypt plaintext using key
  const ctB64 = uint8ArrayToBase64(toUint8Array(ctBuffer)) // ciphertext as base64 string

  return `${ivB64}${SEPARATOR}${ctB64}`
}

/**
 * Decrypts ciphertext encrypted with encrypt() using supplied password.
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {string} ciphertext - Ciphertext to be decrypted.
 * @param   {string} password - Password to use to decrypt ciphertext.
 * @returns {string} Decrypted plaintext.
 *
 * @example
 *   const plaintext = await decrypt(ciphertext, 'pw');
 *   decrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
 */
export async function decrypt(
  ciphertext: string,
  password: string,
): Promise<string> {
  const pwUtf8 = new TextEncoder().encode(password) // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8) // hash the password

  if (!ciphertext.includes(SEPARATOR)) {
    throw new Error('Invalid ciphertext')
  }
  const cipherSplitted = ciphertext.split(SEPARATOR)

  if (cipherSplitted.length !== 2) {
    throw new Error('Invalid ciphertext')
  }

  const ivB64 = cipherSplitted[0] // decode base64 iv
  const ivUtf8 = base64ToUint8Array(ivB64) // iv as Uint8Array

  const alg = { name: 'AES-GCM', iv: ivUtf8 } // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, [
    'decrypt',
  ]) // generate key from pw

  const ctB64 = cipherSplitted[1] // decode base64 iv
  const ctUint8 = base64ToUint8Array(ctB64) // ciphertext as Uint8Array

  try {
    const ptBuffer = await crypto.subtle.decrypt(alg, key, ctUint8) // decrypt ciphertext using key
    const ptStr = new TextDecoder().decode(ptBuffer) // plaintext from ArrayBuffer
    return ptStr
  }
  catch (e) {
    console.error(e)
    throw new Error('Decrypt failed')
  }
}
// ###
