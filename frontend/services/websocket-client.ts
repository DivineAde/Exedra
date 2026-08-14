import type { ClientToServerEvent, ServerToClientEvent } from "@whiteboard/shared-types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

type Listener = (event: ServerToClientEvent) => void;

/** Thin wrapper around a single WebSocket connection with auto-reconnect
 * and a simple pub/sub listener API. One instance is created per editor
 * session (see hooks/use-collaboration.ts). */
export class BoardSocket {
  private socket: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectAttempts = 0;
  private closedByClient = false;

  constructor(private token: string) {}

  connect() {
    this.closedByClient = false;
    this.socket = new WebSocket(`${WS_URL}/ws?token=${encodeURIComponent(this.token)}`);

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as ServerToClientEvent;
        this.listeners.forEach((listener) => listener(parsed));
      } catch {
        // ignore malformed frames
      }
    };

    this.socket.onclose = () => {
      if (this.closedByClient) return;
      const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 10000);
      this.reconnectAttempts += 1;
      setTimeout(() => this.connect(), delay);
    };

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
    };
  }

  send(event: ClientToServerEvent) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  close() {
    this.closedByClient = true;
    this.socket?.close();
  }
}
