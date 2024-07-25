import { describe, expect, it } from 'vitest'
import { SEPARATOR } from '~/aes-gcm'
import { decrypt, encrypt } from '~/index'

describe('basic usages', () => {
  const plaintext = 'Hello, world!'
  const password = 'pw'

  it('basic encrypt/decrypt should work', async () => {
    const encrypted = await encrypt(plaintext, password)
    const decrypted = await decrypt(encrypted, password)
    expect(decrypted).toBe(plaintext)
  })

  it('should throw error if invalid ciphertext is provided', async () => {
    const encrypted = await encrypt(plaintext, password)
    expect(decrypt(`${encrypted}invalid`, password)).rejects.toThrowError('Invalid character')
    expect(decrypt(`abc`, password)).rejects.toThrowError()
  })

  it('should throw error if invalid ciphertext is provided - contains SEPARATOR', async () => {
    const encrypted = await encrypt(plaintext, password)
    expect(decrypt(`${encrypted}${SEPARATOR}invalid`, password)).rejects.toThrowError('Invalid ciphertext')
  })

  it('should throw error if invalid password is provided', async () => {
    const encrypted = await encrypt(plaintext, password)
    expect(decrypt(encrypted, 'invalid')).rejects.toThrowError('Decrypt failed')
  })
})
