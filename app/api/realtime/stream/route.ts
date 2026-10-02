import { NextRequest } from 'next/server';
import { eventHub } from '@/lib/realtime/eventHub';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  let removeListener: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial connection message
      const initialPayload = JSON.stringify({
        type: 'SYNC_INIT',
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      // 2. Event listener for real-time broadcasts
      const onEvent = (eventData: unknown) => {
        try {
          const chunk = `data: ${JSON.stringify(eventData)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Stream error or client closed
        }
      };

      eventHub.on('portal-event', onEvent);
      removeListener = () => eventHub.off('portal-event', onEvent);

      // Keepalive ping every 25 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        if (removeListener) removeListener();
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
    cancel() {
      if (removeListener) removeListener();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
