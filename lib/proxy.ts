import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedPaths = ['/admin', '/student', '/dashboard']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, check role-based access
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_approved')
      .eq('id', user.id)
      .single()

    // Redirect admin to admin dashboard
    if (request.nextUrl.pathname.startsWith('/student') && profile?.role === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // Redirect student to student dashboard
    if (request.nextUrl.pathname.startsWith('/admin') && profile?.role === 'student') {
      const url = request.nextUrl.clone()
      url.pathname = '/student'
      return NextResponse.redirect(url)
    }

    // Check if student is approved
    if (request.nextUrl.pathname.startsWith('/student') && profile?.role === 'student' && !profile?.is_approved) {
      const url = request.nextUrl.clone()
      url.pathname = '/pending-approval'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
