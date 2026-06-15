import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as any,
});

const products = [
  {
    name: 'FORMI Inicial',
    description: 'Plan Inicial - 100 conversiones/mes, 25MB máximo',
    price: 8900,
    lookup_key: 'formi_starter_monthly',
  },
  {
    name: 'FORMI Pro',
    description: 'Plan Pro - Conversiones ilimitadas, 100MB máximo, API',
    price: 19900,
    lookup_key: 'formi_pro_monthly',
  },
  {
    name: 'FORMI Estudiante',
    description: 'Plan Pro gratis por 6 meses para estudiantes verificados',
    price: 0,
    lookup_key: 'formi_student_6months',
  },
];

async function createProducts() {
  console.log('Creating Stripe products for FORMI...\n');

  for (const product of products) {
    try {
      // Create product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
      });

      console.log(`✅ Product created: ${product.name}`);
      console.log(`   Product ID: ${stripeProduct.id}`);

      if (product.price > 0) {
        // Create recurring price for paid plans
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: product.price,
          currency: 'mxn',
          recurring: { interval: 'month' },
          lookup_key: product.lookup_key,
        });

        console.log(`   Price ID: ${price.id} ← Copia este valor a .env.local`);
      } else {
        // For student plan, create a free trial setup
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: 0,
          currency: 'mxn',
          recurring: { interval: 'month' },
          lookup_key: product.lookup_key,
        });

        console.log(`   Price ID: ${price.id} ← Copia este valor a .env.local`);
      }

      console.log('');
    } catch (error: any) {
      console.error(`❌ Error creating ${product.name}:`, error.message);
    }
  }

  console.log('\n📋 Next steps:');
  console.log('1. Copy the Price IDs above');
  console.log('2. Paste them into your .env.local file:');
  console.log('   NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...');
  console.log('   NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...');
  console.log('   NEXT_PUBLIC_STRIPE_PRICE_STUDENT=price_...');
}

createProducts();
