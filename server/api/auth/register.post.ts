import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string, password?: string, invitationCode?: string }>(event)

  if (!body?.username || !body?.password || !body?.invitationCode) {
    throw createError({ statusCode: 400, statusMessage: '请填写所有字段' })
  }

  if (body.username.length < 2 || body.username.length > 20) {
    throw createError({ statusCode: 400, statusMessage: '用户名长度应为 2-20 个字符' })
  }

  if (body.password.length < 4) {
    throw createError({ statusCode: 400, statusMessage: '密码长度至少 4 个字符' })
  }

  const sql = useDb()

  // Validate invitation code
  const [code] = await sql`
    SELECT id FROM invitation_codes WHERE code = ${body.invitationCode}
  `
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: '邀请码无效' })
  }

  // Check if username is taken
  const [existing] = await sql`
    SELECT id FROM users WHERE username = ${body.username}
  `
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: '用户名已被使用' })
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(body.password, 10)
  const [user] = await sql`
    INSERT INTO users (username, password)
    VALUES (${body.username}, ${hashedPassword})
    RETURNING id
  `

  // Auto login
  createAppSession(event, String(user.id))

  return { success: true }
})
