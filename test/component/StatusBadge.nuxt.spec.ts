// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import StatusBadge from '../../app/components/StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders the human-readable label for each status', async () => {
    const todo = await mountSuspended(StatusBadge, { props: { status: 'todo' } })
    expect(todo.text()).toContain('To do')

    const inProgress = await mountSuspended(StatusBadge, { props: { status: 'in_progress' } })
    expect(inProgress.text()).toContain('In progress')

    const done = await mountSuspended(StatusBadge, { props: { status: 'done' } })
    expect(done.text()).toContain('Done')
  })
})
