/**
 * Health Check API
 * For load balancer health checks and monitoring
 */

import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function GET() {
  const startTime = Date.now();
  const env = getEnv();
  
  const checks = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  try {
    // Check database connection
    const dbCheck = await checkDatabase();
    
    // Check external services
    const servicesCheck = await checkServices();

    const isHealthy = dbCheck.healthy && servicesCheck.healthy;
    const status = isHealthy ? 'healthy' : 'degraded';
    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json({
      status,
      checks: {
        database: dbCheck,
        services: servicesCheck,
        ...checks,
      },
      responseTime: Date.now() - startTime,
    }, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      ...checks,
      responseTime: Date.now() - startTime,
    }, { status: 503 });
  }
}

async function checkDatabase() {
  try {
    // Simple database connectivity check
    const { createClient } = await import('@supabase/supabase-js');
    const env = getEnv();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase.from('_health').select('count');
    
    return {
      healthy: !error,
      responseTime: Date.now(),
      error: error?.message || null,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

async function checkServices() {
  const services = {
    stripe: false,
    openai: false,
    sendgrid: false,
  };

  const env = getEnv();

  // Check if services are configured (not actual connectivity)
  if (env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.includes('placeholder')) {
    services.stripe = true;
  }

  if (env.OPENAI_API_KEY && !env.OPENAI_API_KEY.includes('placeholder')) {
    services.openai = true;
  }

  if (env.SENDGRID_API_KEY) {
    services.sendgrid = true;
  }

  return {
    healthy: true, // Services are optional
    configured: services,
  };
}
