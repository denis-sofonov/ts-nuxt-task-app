import { describe, expect, it } from 'vitest'
import { getApiMessage, getFieldErrors } from '../../app/composables/useApiError'

describe('getFieldErrors', () => {
  it('extracts the field errors from a 422 body', () => {
    const error = { data: { data: { errors: { email: ['Enter a valid email address'] } } } }
    expect(getFieldErrors(error)).toEqual({ email: ['Enter a valid email address'] })
  })

  it('returns an empty object when there are none', () => {
    expect(getFieldErrors({ data: {} })).toEqual({})
    expect(getFieldErrors(undefined)).toEqual({})
  })
})

describe('getApiMessage', () => {
  it('prefers the status message, then the message, then the fallback', () => {
    expect(getApiMessage({ data: { statusMessage: 'Forbidden' } })).toBe('Forbidden')
    expect(getApiMessage({ data: { message: 'Boom' } })).toBe('Boom')
    expect(getApiMessage({}, 'Fallback')).toBe('Fallback')
  })
})
