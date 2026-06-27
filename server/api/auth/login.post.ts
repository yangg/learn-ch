export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event)

  if (!body?.password) {
    return { success: false, message: '请输入密码' }
  }

  const config = useRuntimeConfig(event)

  if (body.password !== config.authPassword) {
    return { success: false, message: '密码不正确' }
  }

  createSession(event, 'brook')

  return { success: true }
})
