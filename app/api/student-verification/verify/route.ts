import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      )
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Buscar solicitud por token
    const { data: verification } = await supabase
      .from('student_verifications')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (!verification) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      )
    }

    // Verificar expiración
    if (verification.token_expires_at && new Date() > new Date(verification.token_expires_at)) {
      return NextResponse.json(
        { error: 'El enlace ha expirado. Solicita uno nuevo.' },
        { status: 410 }
      )
    }

    // Si ya está verificado
    if (verification.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Tu email ya fue verificado. Tu solicitud está en revisión manual.',
        alreadyVerified: true,
      })
    }

    // Marcar como verificado
    await supabase
      .from('student_verifications')
      .update({
        email_verified: true,
        status: 'pending',
      })
      .eq('id', verification.id)

    console.log(`✅ Student email verified: ${verification.email}`)

    return NextResponse.json({
      success: true,
      message: '¡Email verificado correctamente! Tu solicitud será revisada por nuestro equipo en 24-48 horas.',
      student: {
        name: verification.name,
        email: verification.email,
        school: verification.school_name,
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Error al verificar el token' },
      { status: 500 }
    )
  }
}
