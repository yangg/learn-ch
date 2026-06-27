import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('hex')
}

function verify(value: string, signature: string, secret: string): boolean {
  const expected = sign(value, secret)
  if (expected.length !== signature.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export function createSession(event: H3Event, userId: string) {
  const config = useRuntimeConfig(event)
  const signature = sign(userId, config.sessionSecret)
  const cookieValue = `${userId}.${signature}`

  setCookie(event, 'session', cookieValue, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })
}

export function getSession(event: H3Event): { userId: string } | null {
  const cookie = getCookie(event, 'session')
  if (!cookie) return null

  const dotIndex = cookie.lastIndexOf('.')
  if (dotIndex === -1) return null

  const userId = cookie.substring(0, dotIndex)
  const signature = cookie.substring(dotIndex + 1)

  const config = useRuntimeConfig(event)
  if (!verify(userId, signature, config.sessionSecret)) return null

  return { userId }
}

export function clearSession(event: H3Event) {
  deleteCookie(event, 'session', {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    path: '/'
  })
}
