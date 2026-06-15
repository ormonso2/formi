import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Lista de dominios institucionales válidos
const VALID_STUDENT_DOMAINS = [
  '.edu',            // Internacional
  '.edu.mx',         // México
  '.edu.ar',         // Argentina
  '.edu.co',         // Colombia
  '.edu.pe',         // Perú
  '.edu.cl',         // Chile
  '.edu.ve',         // Venezuela
  '.edu.br',         // Brasil
  '.edu.ec',         // Ecuador
  // Universidades mexicanas
  'unam.mx',
  'ipn.mx',
  'udg.mx',
  'uanl.mx',
  'uady.mx',
  'uaemex.mx',
  'uaq.mx',
  'uaslp.mx',
  'uabc.mx',
  'uach.mx',
  'uacam.mx',
  'uacj.mx',
  'uaeh.mx',
  'uagro.mx',
  'uam.mx',
  'uaqro.mx',
  'uas.mx',
  'uat.mx',
  'uaz.mx',
  'ubuap.mx',
  'ucol.mx',
  'udeg.mx',
  'ugto.mx',
  'uic.mx',
  'umich.mx',
  'unison.mx',
  'upaep.mx',
  'upt.mx',
  'uson.mx',
  'utez.edu.mx',
  'uv.mx',
  'uveg.edu.mx',
  'uvmnet.edu',
  'uvaq.mx',
  'uvirtual.mx',
  // Tecnológicos
  'itesm.mx',
  'iteso.mx',
  'itq.edu.mx',
  'itcelaya.edu.mx',
  'itchihuahua.edu.mx',
  'itescam.edu.mx',
  // Politécnicos
  'poligto.edu.mx',
  'ipn.mx',
  'upt.edu.mx',
]

function isStudentEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  
  return VALID_STUDENT_DOMAINS.some(validDomain => 
    domain === validDomain || domain.endsWith(validDomain)
  )
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Simula el envío de correo (reemplazar con servicio real: Resend, SendGrid, SMTP)
async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-student?token=${token}`
  
  // Para desarrollo: mostramos el link en consola
  console.log(`\n📧 VERIFICATION EMAIL (dev mode)`)
  console.log(`To: ${email}`)
  console.log(`Subject: Verifica tu cuenta de estudiante FORMI`)
  console.log(`Link: ${verifyUrl}\n`)
  
  // TODO: Integrar con servicio de email real
  // Ejemplo con Resend:
  // await resend.emails.send({
  //   from: 'FORMI <noreply@formi.com>',
  //   to: email,
  //   subject: 'Verifica tu cuenta de estudiante FORMI',
  //   html: `<p>Hola ${name},</p><p>Click para verificar: <a href="${verifyUrl}">${verifyUrl}</a></p>`
  // })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, school, studentId } = body

    // Validar campos requeridos
    if (!name || !email || !school || !studentId) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar que sea email institucional
    if (!isStudentEmail(email)) {
      return NextResponse.json(
        { 
          error: 'Email no institucional', 
          message: 'El email debe ser institucional (.edu, .edu.mx, uanl.mx, unam.mx, etc.)'
        },
        { status: 400 }
      )
    }

    // Verificar si ya existe una solicitud
    const existing = await (prisma as any).studentVerification.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      if (existing.emailVerified && existing.status === 'approved') {
        return NextResponse.json(
          { error: 'Ya tienes una cuenta de estudiante activa' },
          { status: 400 }
        )
      }
      if (existing.emailVerified && existing.status === 'pending') {
        return NextResponse.json(
          { error: 'Tu solicitud ya fue verificada y está en revisión manual' },
          { status: 400 }
        )
      }
    }

    // Generar token
    const token = generateToken()
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Crear o actualizar la solicitud
    const verification = await (prisma as any).studentVerification.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name,
        school,
        studentId,
        verificationToken: token,
        tokenExpiresAt,
        status: 'pending',
      },
      create: {
        name,
        email: email.toLowerCase(),
        school,
        studentId,
        verificationToken: token,
        tokenExpiresAt,
        status: 'pending',
      },
    })

    // Enviar email de verificación
    await sendVerificationEmail(email, name, token)

    return NextResponse.json({ 
      success: true, 
      message: 'Te enviamos un email de verificación. Revisa tu bandeja (incluyendo spam) y haz clic en el enlace para continuar.',
      verification: {
        id: verification.id,
        email: verification.email,
      }
    })

  } catch (error) {
    console.error('Student verification error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
