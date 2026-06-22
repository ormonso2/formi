import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as any,
});

async function createEnterprisePlan() {
  console.log('🏢 Creando plan Personalizado/Empresa en Stripe...\n');

  try {
    // Crear producto
    const product = await stripe.products.create({
      name: 'FORMI Empresas',
      description: 'Plan personalizado para grandes equipos. Incluye usuarios ilimitados, API dedicada, soporte prioritario, SLA garantizado y opciones on-premise.',
      metadata: {
        type: 'enterprise',
        features: 'usuarios_ilimitados,api_dedicada,soporte_dedicado,personalizacion,sla,on-premise,auditoria'
      }
    });

    console.log(`✅ Producto creado: ${product.name}`);
    console.log(`   ID: ${product.id}`);

    // Crear precio base mensual (ajustable según negociación)
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 49900, // $499 MXN - precio base inicial
      currency: 'mxn',
      recurring: { interval: 'month' },
      lookup_key: 'formi_enterprise_monthly',
      nickname: 'Empresas - Mensual base',
      metadata: {
        type: 'base_price',
        note: 'Precio negociable según volumen'
      }
    });

    console.log(`\n💰 Precio mensual base: $499 MXN`);
    console.log(`   Price ID: ${monthlyPrice.id}`);
    console.log(`   Lookup Key: ${monthlyPrice.lookup_key}`);

    // Crear precio anual con descuento (opcional)
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 479900, // $4,799 MXN/año (~20% descuento vs mensual)
      currency: 'mxn',
      recurring: { interval: 'year' },
      lookup_key: 'formi_enterprise_yearly',
      nickname: 'Empresas - Anual (20% off)',
      metadata: {
        type: 'discounted',
        note: 'Precio anual con descuento'
      }
    });

    console.log(`\n💰 Precio anual: $4,799 MXN (20% descuento)`);
    console.log(`   Price ID: ${yearlyPrice.id}`);
    console.log(`   Lookup Key: ${yearlyPrice.lookup_key}`);

    console.log('\n📋 CONFIGURACIÓN PARA .env:');
    console.log(`   NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY=${monthlyPrice.id}`);
    console.log(`   NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY=${yearlyPrice.id}`);
    console.log('\n⚠️  Nota: El precio real puede ajustarse manualmente desde el dashboard');
    console.log('    de Stripe según las necesidades específicas del cliente.');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createEnterprisePlan();
