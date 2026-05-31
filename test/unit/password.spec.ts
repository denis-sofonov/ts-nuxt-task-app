import { describe, expect, it } from 'vitest'
import { hashUserPassword, verifyUserPassword } from '../../server/utils/password'

describe('password hashing', () => {
  it('produces an argon2id hash distinct from the input', async () => {
    const hash = await hashUserPassword('correct horse battery staple')
    expect(hash).toMatch(/^\$argon2id\$/)
  })

  it('salts: the same password hashes differently each time', async () => {
    const [a, b] = await Promise.all([hashUserPassword('same'), hashUserPassword('same')])
    expect(a).not.toBe(b)
  })

  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await hashUserPassword('s3cret-passw0rd')
    expect(await verifyUserPassword(hash, 's3cret-passw0rd')).toBe(true)
    expect(await verifyUserPassword(hash, 'wrong')).toBe(false)
  })
})
