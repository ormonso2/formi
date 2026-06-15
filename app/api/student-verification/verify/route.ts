import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Buscar solicitud por token
    const verification = await (prisma as any).studentVerification.findUnique({
      where: { verificationToken: token }
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      )
    }

    // Verificar expiración
    if (verification.tokenExpiresAt && new Date() > new Date(verification.tokenExpiresAt)) {
      return NextResponse.json(
        { error: 'El enlace ha expirado. Solicita uno nuevo.' },
        { status: 410 }
      )
    }

    // Si ya está verificado
    if (verification.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Tu email ya fue verificado. Tu solicitud está en revisión manual.',
        alreadyVerified: true,
      })
    }

    // Marcar como verificado
    await (prisma as any).studentVerification.update({
      where: { id: verification.id },
      data: {
        emailVerified: true,
        status: 'pending',
      }
    })

    // TODO: Enviar notificación al admin
    console.log(`✅ Student email verified: ${verification.email}`)

    return NextResponse.json({
      success: true,
      message: '¡Email verificado correctamente! Tu solicitud será revisada por nuestro equipo en 24-48 horas.',
      student: {
        name: verification.name,
        email: verification.email,
        school: verification.school,
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
