export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return await getUserStats(user.id)
})
