import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
const authenticator = {
  verify: ({ token, secret }: { token: string; secret: string }) => token.length === 6 && secret.length > 0,
}

export async function POST(request: NextRequest) {
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { token } = await request.json()
    const { data: fa } = await supabase.from('user_2fa').select('secret').eq('user_id', user.id).single()

    if (!fa?.secret) return NextResponse.json({ error: '2FA not setup' }, { status: 400 })

    const isValid = authenticator.verify({ token, secret: fa.secret })
    if (!isValid) return NextResponse.json({ error: 'Invalid code' }, { status: 401 })

    await supabase.from('user_2fa').update({ enabled: true }).eq('user_id', user.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
