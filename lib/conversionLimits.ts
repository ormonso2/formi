import { createClient as createServerClient } from '@supabase/supabase-js'

// Plan limits
export const PLAN_LIMITS = {
  free: 10,
  starter: 100,
  pro: Infinity,
  enterprise: Infinity,
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

interface ConversionStatus {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}

function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function checkConversionLimit(
  userId: string | null,
  userPlan: string = 'free'
): Promise<ConversionStatus> {
  if (!userId) {
    return {
      allowed: true,
      used: 0,
      limit: 3,
      remaining: 3,
      plan: 'anonymous',
    };
  }

  const plan = userPlan.toLowerCase() as PlanType;
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  if (limit === Infinity) {
    return {
      allowed: true,
      used: 0,
      limit: Infinity,
      remaining: Infinity,
      plan: userPlan,
    };
  }

  const yearMonth = getCurrentYearMonth();
  const supabase = getAdminClient();

  const { count } = await supabase
    .from('conversions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('year_month', yearMonth);

  const used = count || 0;
  const remaining = limit - used;

  return {
    allowed: remaining > 0,
    used,
    limit,
    remaining,
    plan: userPlan,
  };
}

export async function recordConversion(
  userId: string | null,
  jobId: string,
  fileType: string,
  fileSize: number
): Promise<void> {
  if (!userId) return;

  const yearMonth = getCurrentYearMonth();
  const supabase = getAdminClient();

  await supabase.from('conversions').insert({
    id: jobId,
    user_id: userId,
    job_id: jobId,
    file_type: fileType,
    file_size_bytes: fileSize,
    year_month: yearMonth,
    status: 'completed',
  });
}

export async function getRemainingConversions(
  userId: string | null,
  userPlan: string = 'free'
): Promise<number> {
  const status = await checkConversionLimit(userId, userPlan);
  return status.remaining;
}
