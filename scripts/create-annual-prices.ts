import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createAnnualPrices() {
  // Starter: $89 MXN/mes → anual = $89 * 12 * 0.9 = $960.60 MXN/año
  const starterAnnual = await stripe.prices.create({
    unit_amount: 96060, // $960.60 MXN
    currency: 'mxn',
    recurring: {
      interval: 'year',
    },
    product_data: {
      name: 'FORMi Inicial - Anual',
      metadata: {
        plan: 'starter',
        billing: 'annual',
      },
    },
    metadata: {
      plan: 'starter',
      billing: 'annual',
    },
  });

  console.log('✅ Starter Annual Price ID:', starterAnnual.id);

  // Pro: $199 MXN/mes → anual = $199 * 12 * 0.9 = $2,149.20 MXN/año
  const proAnnual = await stripe.prices.create({
    unit_amount: 214920, // $2,149.20 MXN
    currency: 'mxn',
    recurring: {
      interval: 'year',
    },
    product_data: {
      name: 'FORMi Pro - Anual',
      metadata: {
        plan: 'pro',
        billing: 'annual',
      },
    },
    metadata: {
      plan: 'pro',
      billing: 'annual',
    },
  });

  console.log('✅ Pro Annual Price ID:', proAnnual.id);

  console.log('\n📋 Add these to your .env:');
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL=${starterAnnual.id}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=${proAnnual.id}`);
}

createAnnualPrices().catch(console.error);
