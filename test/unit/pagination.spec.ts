import { describe, expect, it } from 'vitest'
import { buildPageMeta } from '../../server/utils/pagination'

describe('buildPageMeta', () => {
  it('computes the total page count', () => {
    expect(buildPageMeta(1, 20, 45)).toEqual({ page: 1, limit: 20, total: 45, totalPages: 3 })
  })

  it('returns zero pages for an empty set', () => {
    expect(buildPageMeta(1, 20, 0).totalPages).toBe(0)
  })

  it('rounds a partial last page up', () => {
    expect(buildPageMeta(2, 10, 11).totalPages).toBe(2)
  })
})
