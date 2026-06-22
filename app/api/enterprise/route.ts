import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'

const WHATSAPP_NUMBER = '5214423807751'

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

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: lead } = await supabase.from('enterprise_leads').insert({
      id: crypto.randomUUID(),
      company_name: companyName,
      contact_name: contactName,
      email,
      phone,
      employees,
      message,
    }).select().single()

    const fecha = new Date().toLocaleString('es-MX')
    const whatsappMessage = `🚀 *Nueva solicitud ENTERPRISE - FORMI*

🏢 *Empresa:* ${companyName}
👤 *Contacto:* ${contactName}
📧 *Email:* ${email}
📱 *Teléfono:* ${phone || 'No proporcionado'}
👥 *Empleados:* ${employees || 'No especificado'}

📝 *Mensaje:*
${message || 'Sin mensaje adicional'}

⏰ Fecha: ${fecha}

🔗 Admin: formi.fun/admin`

    const encodedMessage = encodeURIComponent(whatsappMessage)
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

    return NextResponse.json({
      success: true,
      lead,
      whatsappUrl
    })
  } catch (error) {
    console.error('Enterprise lead error:', error)
    return NextResponse.json(
      { error: 'Error al guardar la solicitud' },
      { status: 500 }
    )
  }
}
