defineRouteMeta({
  openAPI: {
    tags: ['System'],
    summary: 'User statistics',
    description: 'Cached project/task counts.',
  },
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return await getUserStats(user.id)
})
