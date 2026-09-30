import { afterEach, vi } from 'vitest';

// useSharedBridge opens a WebSocket to ws://<host>:3000 on import and retries
// forever on failure. Stub it so unit tests stay offline and exit cleanly.
class FakeWebSocket {
  static OPEN = 1;
  readyState = 0;
  onmessage: ((e: unknown) => void) | null = null;
  onclose: (() => void) | null = null;
  send() {}
  close() {}
}
vi.stubGlobal('WebSocket', FakeWebSocket);

afterEach(() => {
  localStorage.clear();
});
