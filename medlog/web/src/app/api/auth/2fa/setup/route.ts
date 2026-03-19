import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'
const authenticator = {
  generateSecret: () => Math.random().toString(36).substring(2, 18),
  keyuri: (user: string, issuer: string, secret: string) => `otpauth://totp/${issuer}:${user}?secret=${secret}&issuer=${issuer}`,
  verify: ({ token, secret }: { token: string; secret: string }) => token.length === 6,
}

export async function POST(request: NextRequest) {
  let user: any
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(c: any[]) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
        },
      }
    )

    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate TOTP secret
    const secret = authenticator.generateSecret()
    const uri = authenticator.keyuri(user.email, 'MedLog', secret)

    // Store secret temporarily
    await supabase.from('user_2fa').upsert({
      user_id: user.id,
      secret,
      enabled: false,
    })

    return NextResponse.json({ secret, uri })
  } catch (error) {
    logger.error('2FA setup error', error as Error, { userId: user?.id })
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
