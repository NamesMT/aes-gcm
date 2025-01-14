import type { BufferSource } from 'node:stream/web'
import { base64ToUint8Array, stringToUint8Array, toUint8Array, uint8ArrayToBase64 } from 'uint8array-extras'

function toBufferSource(content: string | BufferSource): BufferSource {
  return typeof content === 'string' // encode content to BufferSource if needed
    ? stringToUint8Array(content)
    : content
}

export const SEPARATOR = '|'
/**
 * Encrypts content using AES-GCM with supplied password, for decryption with decrypt().  
 * (c) enhanced from https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
 *
 * @param   {string} content - content to be encrypted.
 * @param   {string} password - Password to use to encrypt content.
 * @returns {string} Encrypted result (iv and ciphertext concatenated).
 *
 * @example
 *   const encrypted = await encrypt('my secret text', 'pw');
 *   encrypt('my secret text', 'pw').then(function(encrypted) { console.log(encrypted); });
 */
export async function encrypt(
  content: string | BufferSource,
  password: string | BufferSource,
): Promise<string> {
  const pwHash = await crypto.subtle.digest('SHA-256', toBufferSource(password)) // hash the password

  const ivUtf8 = crypto.getRandomValues(new Uint8Array(12)) // get 96-bit random iv
  const ivB64 = uint8ArrayToBase64(ivUtf8) // iv as base64 string

  const alg = { name: 'AES-GCM', iv: ivUtf8 } // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, [
    'encrypt',
  ]) // generate key from pw

  const ctBuffer = await crypto.subtle.encrypt(alg, key, toBufferSource(content)) // encrypt content using key
  const ctB64 = uint8ArrayToBase64(toUint8Array(ctBuffer)) // ciphertext as base64 string

  return `${ivB64}${SEPARATOR}${ctB64}`
}

/**
 * Decrypts encrypted result from encrypt() using supplied password.  
 * (c) enhanced from https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
 *
 * @param   {string} encryptedInput - encrypted value to be decrypted.
 * @param   {string} password - Password to use to decrypt encryptedInput.
 * @returns {string} Decrypted plaintext.
 *
 * @example
 *   const plaintext = await decrypt(ciphertext, 'pw');
 *   decrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
 */
export async function decrypt(encryptedInput: string, password: string | BufferSource): Promise<string>
/**
 * Decrypts encrypted result from encrypt() using supplied password.  
 * (c) enhanced from https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
 *
 * @param   {string} encryptedInput - encrypted value to be decrypted.
 * @param   {string} password - Password to use to decrypt encryptedInput.
 * @param   {true} returnBuffer - Returns the ArrayBuffer directly without converting it to string.
 * @returns {ArrayBuffer} Decrypted encryptedInput as raw ArrayBuffer.
 *
 * @example
 *   const plaintext = await decrypt(ciphertext, 'pw');
 *   decrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
 */
export async function decrypt(encryptedInput: string, password: string | BufferSource, returnBuffer: true): Promise<ArrayBuffer>
export async function decrypt(
  encryptedInput: string,
  password: string | BufferSource,
  returnBuffer = false,
): Promise<string | ArrayBuffer> {
  const pwHash = await crypto.subtle.digest('SHA-256', toBufferSource(password)) // hash the password

  if (!encryptedInput.includes(SEPARATOR)) {
    throw new Error('Invalid encryptedInput')
  }
  const inputSplitted = encryptedInput.split(SEPARATOR)

  if (inputSplitted.length !== 2) {
    throw new Error('Invalid encryptedInput')
  }

  const ivUtf8 = base64ToUint8Array(inputSplitted[0]) // iv as Uint8Array

  const alg = { name: 'AES-GCM', iv: ivUtf8 } // specify algorithm to use

  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, [
    'decrypt',
  ]) // generate key from pw

  const ctUint8 = base64ToUint8Array(inputSplitted[1]) // ciphertext as Uint8Array

  try {
    const ptBuffer = await crypto.subtle.decrypt(alg, key, ctUint8) // decrypt ciphertext using key
    if (returnBuffer)
      return ptBuffer

    return new TextDecoder().decode(ptBuffer) // plaintext from ArrayBuffer
  }
  catch (e) {
    console.error(e)
    throw new Error('Decrypt failed')
  }
}
// ###
