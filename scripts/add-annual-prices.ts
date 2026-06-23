import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  // Get existing monthly prices to find their product IDs
  const starterMonthly = await stripe.prices.retrieve(process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!);
  const proMonthly = await stripe.prices.retrieve(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!);

  const starterProduct = starterMonthly.product as string;
  const proProduct = proMonthly.product as string;

  console.log('FORMA Inicial product:', starterProduct);
  console.log('FORMA Pro product:', proProduct);

  // Create annual prices attached to existing products
  const starterAnnual = await stripe.prices.create({
    unit_amount: 96060,
    currency: 'mxn',
    recurring: { interval: 'year' },
    product: starterProduct,
    metadata: { plan: 'starter', billing: 'annual' },
  });

  const proAnnual = await stripe.prices.create({
    unit_amount: 214920,
    currency: 'mxn',
    recurring: { interval: 'year' },
    product: proProduct,
    metadata: { plan: 'pro', billing: 'annual' },
  });

  console.log('\n✅ Starter Annual Price ID:', starterAnnual.id);
  console.log('✅ Pro Annual Price ID:', proAnnual.id);

  console.log('\n📋 Actualiza tu .env:');
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL=${starterAnnual.id}`);
  console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=${proAnnual.id}`);
}

main().catch(console.error);
