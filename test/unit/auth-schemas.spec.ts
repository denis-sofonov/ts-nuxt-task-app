import { describe, expect, it } from 'vitest'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../../shared/schemas/auth'

describe('registerSchema', () => {
  it('normalises email (trim + lowercase) and name (trim)', () => {
    const result = registerSchema.parse({
      name: '  Ada Lovelace  ',
      email: '  ADA@Example.com ',
      password: 'supersecret',
    })
    expect(result).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'supersecret',
    })
  })

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({ name: 'Ada', email: 'a@b.com', password: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'not-an-email',
      password: 'supersecret',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty name', () => {
    const result = registerSchema.safeParse({
      name: '   ',
      email: 'a@b.com',
      password: 'supersecret',
    })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts any non-empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
  })

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })
})

describe('account recovery schemas', () => {
  it('forgotPasswordSchema normalises the email', () => {
    expect(forgotPasswordSchema.parse({ email: ' USER@X.io ' }).email).toBe('user@x.io')
  })

  it('resetPasswordSchema requires a token and an 8+ char password', () => {
    expect(resetPasswordSchema.safeParse({ token: 't', password: 'longenough' }).success).toBe(true)
    expect(resetPasswordSchema.safeParse({ token: '', password: 'longenough' }).success).toBe(false)
    expect(resetPasswordSchema.safeParse({ token: 't', password: 'short' }).success).toBe(false)
  })

  it('verifyEmailSchema requires a token', () => {
    expect(verifyEmailSchema.safeParse({ token: 'abc' }).success).toBe(true)
    expect(verifyEmailSchema.safeParse({ token: '' }).success).toBe(false)
  })
})
