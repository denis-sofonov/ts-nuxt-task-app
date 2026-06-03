import { describe, expect, it } from 'vitest'
import { projectListQuerySchema, taskListQuerySchema } from '../../shared/schemas/list-query'

describe('projectListQuerySchema', () => {
  it('applies sort/order defaults alongside pagination', () => {
    expect(projectListQuerySchema.parse({})).toMatchObject({
      page: 1,
      limit: 20,
      sort: 'createdAt',
      order: 'desc',
    })
  })

  it('accepts an allow-listed sort field and trims search', () => {
    const parsed = projectListQuerySchema.parse({ sort: 'name', order: 'asc', search: '  api ' })
    expect(parsed.sort).toBe('name')
    expect(parsed.search).toBe('api')
  })

  it('rejects a sort field outside the allow-list', () => {
    expect(projectListQuerySchema.safeParse({ sort: 'password_hash' }).success).toBe(false)
  })
})

describe('taskListQuerySchema', () => {
  it('accepts a valid status filter', () => {
    expect(taskListQuerySchema.parse({ status: 'in_progress' }).status).toBe('in_progress')
  })

  it('rejects an invalid status', () => {
    expect(taskListQuerySchema.safeParse({ status: 'archived' }).success).toBe(false)
  })
})
