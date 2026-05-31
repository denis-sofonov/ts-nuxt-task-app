import { describe, expect, it } from 'vitest'
import { paginationSchema } from '../../shared/schemas/pagination'
import { createProjectSchema, updateProjectSchema } from '../../shared/schemas/project'
import { createTaskSchema, updateTaskSchema } from '../../shared/schemas/task'

describe('paginationSchema', () => {
  it('applies defaults and coerces string query values', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 20 })
    expect(paginationSchema.parse({ page: '3', limit: '50' })).toEqual({ page: 3, limit: 50 })
  })

  it('enforces bounds', () => {
    expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false)
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false)
  })
})

describe('createTaskSchema', () => {
  it('defaults status to todo', () => {
    expect(createTaskSchema.parse({ title: 'A' }).status).toBe('todo')
  })

  it('rejects an unknown status', () => {
    expect(createTaskSchema.safeParse({ title: 'A', status: 'archived' }).success).toBe(false)
  })
})

describe('partial update schemas', () => {
  it('reject an empty patch', () => {
    expect(updateProjectSchema.safeParse({}).success).toBe(false)
    expect(updateTaskSchema.safeParse({}).success).toBe(false)
  })

  it('do not reintroduce the status default on partial task updates', () => {
    const parsed = updateTaskSchema.parse({ title: 'Renamed' })
    expect(parsed).not.toHaveProperty('status')
  })

  it('accept a single changed field', () => {
    expect(createProjectSchema.safeParse({ name: 'Ok' }).success).toBe(true)
    expect(updateProjectSchema.safeParse({ name: 'Ok' }).success).toBe(true)
  })
})
