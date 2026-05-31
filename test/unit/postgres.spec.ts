import { describe, expect, it } from 'vitest'
import { isUniqueViolation } from '../../server/utils/postgres'

describe('isUniqueViolation', () => {
  it('detects a unique-violation (SQLSTATE 23505)', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true)
  })

  it('ignores other postgres errors and non-error values', () => {
    expect(isUniqueViolation({ code: '23503' })).toBe(false)
    expect(isUniqueViolation(new Error('boom'))).toBe(false)
    expect(isUniqueViolation(null)).toBe(false)
    expect(isUniqueViolation('23505')).toBe(false)
  })
})
