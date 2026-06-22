import { getUser, getProfile } from '@/lib/supabase/server';
import { checkConversionLimit } from '@/lib/conversionLimits';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const profile = await getProfile();

    const limitStatus = await checkConversionLimit(
      user.id,
      profile?.plan || 'free'
    );

    return NextResponse.json({
      used: limitStatus.used,
      limit: limitStatus.limit,
      remaining: limitStatus.remaining,
      plan: limitStatus.plan,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
