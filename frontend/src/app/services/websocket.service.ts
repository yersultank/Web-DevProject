import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  connect(url: string): WebSocket {
    return new WebSocket(url);
  }

  reconnect(
    url: string,
    onMessage: (data: any) => void,
    onOpen?: () => void,
  ): () => void {
    const delays = [1000, 2000, 4000, 8000, 30000];
    let attempt = 0;
    let ws: WebSocket;
    let stopped = false;

    const connect = () => {
      ws = new WebSocket(url);
      ws.onopen = () => {
        attempt = 0;
        onOpen?.();
      };
      ws.onmessage = (e) => onMessage(JSON.parse(e.data));
      ws.onclose = () => {
        if (stopped) return;
        const delay = delays[Math.min(attempt, delays.length - 1)];
        attempt++;
        setTimeout(connect, delay);
      };
    };

    connect();
    return () => { stopped = true; ws?.close(); };
  }
}
