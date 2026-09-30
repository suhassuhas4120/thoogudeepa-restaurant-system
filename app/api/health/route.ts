import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/db/supabaseClient';

const serverStartTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);

  return NextResponse.json({
    status: 'healthy',
    system: 'Thoogudeepa Donne Biryani Mane POS & Operating System',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    database: {
      supabaseConfigured: isSupabaseConfigured,
      mode: isSupabaseConfigured ? 'cloud-postgres' : 'resilient-in-memory',
    },
    version: '1.0.0',
  });
}
