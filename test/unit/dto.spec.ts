import { describe, expect, it } from 'vitest'
import type { Project, Task } from '../../server/database/schema'
import { toProjectDto, toTaskDto } from '../../server/utils/dto'

const createdAt = new Date('2026-01-02T03:04:05.000Z')
const updatedAt = new Date('2026-01-03T04:05:06.000Z')

describe('toProjectDto', () => {
  it('serialises timestamps to ISO strings and whitelists fields', () => {
    const row: Project = {
      id: 'p1',
      userId: 'u1',
      name: 'Website',
      description: null,
      createdAt,
      updatedAt,
    }

    expect(toProjectDto(row)).toEqual({
      id: 'p1',
      userId: 'u1',
      name: 'Website',
      description: null,
      createdAt: '2026-01-02T03:04:05.000Z',
      updatedAt: '2026-01-03T04:05:06.000Z',
    })
  })
})

describe('toTaskDto', () => {
  it('serialises timestamps to ISO strings and keeps the status', () => {
    const row: Task = {
      id: 't1',
      projectId: 'p1',
      title: 'Audit pages',
      description: 'Optional',
      status: 'in_progress',
      createdAt,
      updatedAt,
    }

    expect(toTaskDto(row)).toEqual({
      id: 't1',
      projectId: 'p1',
      title: 'Audit pages',
      description: 'Optional',
      status: 'in_progress',
      createdAt: '2026-01-02T03:04:05.000Z',
      updatedAt: '2026-01-03T04:05:06.000Z',
    })
  })
})
