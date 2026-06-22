import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient as createServerClient } from '@supabase/supabase-js';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function getPlanFromPriceId(priceId: string): string {
  const starterPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER;
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  const studentPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDENT;

  if (priceId === starterPriceId) return 'starter';
  if (priceId === proPriceId) return 'pro';
  if (priceId === studentPriceId) return 'pro';
  return 'free';
}

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: any;

  try {
    event = (stripe as any).webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = getAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        const subscription: any = await (stripe as any).subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const planName = getPlanFromPriceId(priceId);

        await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            status: subscription.status,
            plan: planName,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        // Update user plan in profiles
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (sub?.user_id) {
          await supabase
            .from('profiles')
            .update({ plan: planName })
            .eq('id', sub.user_id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const subscription: any = await (stripe as any).subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const planName = getPlanFromPriceId(priceId);

          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_customer_id', customerId);

          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (sub?.user_id) {
            await supabase
              .from('profiles')
              .update({ plan: planName })
              .eq('id', sub.user_id);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const planName = getPlanFromPriceId(priceId);

        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (!subscription.cancel_at_period_end) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (sub?.user_id) {
            await supabase
              .from('profiles')
              .update({ plan: planName })
              .eq('id', sub.user_id);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan: 'free',
          })
          .eq('stripe_subscription_id', subscription.id);

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub?.user_id) {
          await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', sub.user_id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
