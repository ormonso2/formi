import { NextRequest, NextResponse } from 'next/server';
import { stripe, getStripeCustomer } from '@/lib/stripe';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { getUser, getProfile } from '@/lib/supabase/server';

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const profile = await getProfile();
    const email = user.email!;
    const name = profile?.name || email;

    const customer = await getStripeCustomer(email, name);
    const supabase = getAdminClient();

    // Find existing subscription for this user
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingSub) {
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customer.id })
        .eq('id', existingSub.id);
    } else {
      await supabase.from('subscriptions').insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        stripe_customer_id: customer.id,
        status: 'incomplete',
        plan: 'free',
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
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
        userId: user.id,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}
