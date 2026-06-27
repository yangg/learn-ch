import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string, password?: string }>(event)

  if (!body?.username || !body?.password) {
    return { success: false, message: '请输入用户名和密码' }
  }

  const sql = useDb()
  const [user] = await sql`
    SELECT id, username, password FROM users WHERE username = ${body.username}
  `

  if (!user) {
    return { success: false, message: '用户名或密码不正确' }
  }

  const valid = await bcrypt.compare(body.password, user.password)
  if (!valid) {
    return { success: false, message: '用户名或密码不正确' }
  }

  createAppSession(event, String(user.id))

  return { success: true }
})
