import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, contactName, email, phone, employees, message } = body

    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const lead = await prisma.enterpriseLead.create({
      data: {
        companyName,
        contactName,
        email,
        phone,
        employees,
        message,
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Enterprise lead error:', error)
    return NextResponse.json(
      { error: 'Error al guardar la solicitud' },
      { status: 500 }
    )
  }
}
