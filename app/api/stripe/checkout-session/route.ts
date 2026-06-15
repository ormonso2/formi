import { NextRequest, NextResponse } from 'next/server';
import { stripe, getStripeCustomer } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, email, name, userId } = body;

    if (!priceId || !email) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const customer = await getStripeCustomer(email, name);

    // Upsert subscription record
    await prisma.subscription.upsert({
      where: { userId: userId || customer.id },
      update: { stripeCustomerId: customer.id },
      create: {
        userId: userId || customer.id,
        stripeCustomerId: customer.id,
        status: 'incomplete',
        plan: 'pro',
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata: {
        userId: userId || customer.id,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}
