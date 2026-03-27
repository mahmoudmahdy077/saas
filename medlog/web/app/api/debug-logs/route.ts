/**
 * Debug Log API
 * Access and manage debug logs
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '../../../lib/debug-logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'stats';

    // In production, require authentication
    if (process.env.NODE_ENV === 'production') {
      // Add auth check here
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'stats': {
        const stats = logger.getStats();
        return NextResponse.json(stats);
      }

      case 'recent': {
        const count = parseInt(searchParams.get('count') || '100');
        const logs = logger.getRecentLogs(count);
        return NextResponse.json({ logs });
      }

      case 'search': {
        const level = searchParams.get('level') as any || undefined;
        const module = searchParams.get('module') || undefined;
        const messageContains = searchParams.get('q') || undefined;
        
        const logs = logger.searchLogs({
          level,
          module,
          messageContains,
        });
        
        return NextResponse.json({ logs, count: logs.length });
      }

      case 'export': {
        const format = searchParams.get('format') as 'json' | 'text' || 'json';
        const content = logger.exportLogs(format);
        
        return new NextResponse(content, {
          headers: {
            'Content-Type': format === 'json' ? 'application/json' : 'text/plain',
            'Content-Disposition': `attachment; filename="medlog-logs.${format}"`,
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('api/debug-logs', 'Failed to get logs', error);
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // In production, require authentication
    if (process.env.NODE_ENV === 'production') {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'clear': {
        logger.clearLogs();
        return NextResponse.json({ success: true, message: 'Logs cleared' });
      }

      case 'rotate': {
        // Force log rotation
        logger['rotateLogs']();
        return NextResponse.json({ success: true, message: 'Logs rotated' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('api/debug-logs', 'Failed to manage logs', error);
    return NextResponse.json(
      { error: 'Failed to manage logs' },
      { status: 500 }
    );
  }
}
