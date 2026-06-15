import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as any,
  typescript: true,
});

export const getStripeCustomer = async (email: string, name?: string) => {
  const existing = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0];
  }

  return stripe.customers.create({
    email,
    name: name || email,
  });
};
