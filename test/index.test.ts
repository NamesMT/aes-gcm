import { SEPARATOR } from '#src/aes-gcm.js'
import { decrypt, encrypt } from '#src/index.js'
import { describe, expect, it } from 'vitest'

describe('basic usages', () => {
  const plaintext = 'Hello, world!'
  const password = 'pw'

  it('basic encrypt/decrypt should work', async () => {
    const encrypted = await encrypt(plaintext, password)
    const decrypted = await decrypt(encrypted, password)
    expect(decrypted).toBe(plaintext)

    const decryptedAB = await decrypt(encrypted, password, true)
    expect(decryptedAB).toBeInstanceOf(ArrayBuffer)
    expect(new TextDecoder().decode(decryptedAB)).toBe(plaintext)
  })

  it('should throw error if invalid encryptedInput is provided', async () => {
    const encrypted = await encrypt(plaintext, password)
    await expect(decrypt(`${encrypted}invalid`, password)).rejects.toThrowError('Invalid character')
    await expect(decrypt(`abc`, password)).rejects.toThrowError()
  })

  it('should throw error if invalid encryptedInput is provided - contains SEPARATOR', async () => {
    const encrypted = await encrypt(plaintext, password)
    await expect(decrypt(`${encrypted}${SEPARATOR}invalid`, password)).rejects.toThrowError('Invalid encryptedInput')
  })

  it('should throw error if invalid password is provided', async () => {
    const encrypted = await encrypt(plaintext, password)
    await expect(decrypt(encrypted, 'invalid')).rejects.toThrowError('Decrypt failed')
  })
})
