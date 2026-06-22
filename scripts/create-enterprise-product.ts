import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as any,
});

async function createEnterpriseProduct() {
  try {
    // Create product for enterprise/personalized plan
    const product = await stripe.products.create({
      name: 'FORMI Personalizado',
      description: 'Plan personalizado para empresas. Contactar para cotización.',
    });

    console.log('✅ Producto creado: FORMI Personalizado');
    console.log(`   Product ID: ${product.id}`);

    // Create a placeholder price (can be updated later)
    // For enterprise plans, we typically use custom pricing
    const price = await stripe.products.create({
      name: 'FORMI Personalizado - Consulta',
      description: 'Consulta personalizada para empresas',
      default_price_data: {
        unit_amount: 0,
        currency: 'mxn',
      },
    });

    console.log(`   Consulta ID: ${price.id}`);
    console.log('\n📋 Este plan se usa para formularios de contacto, no checkout.');
    console.log('   El precio real se negocia manualmente.');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

createEnterpriseProduct();
