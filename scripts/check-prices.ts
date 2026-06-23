import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  const starter = await stripe.prices.retrieve(process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!);
  const pro = await stripe.prices.retrieve(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!);
  const starterAnnual = await stripe.prices.retrieve(process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL!);
  const proAnnual = await stripe.prices.retrieve(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL!);

  console.log('Starter monthly product:', starter.product);
  console.log('Pro monthly product:', pro.product);
  console.log('Starter annual product:', starterAnnual.product);
  console.log('Pro annual product:', proAnnual.product);
}

main().catch(console.error);
