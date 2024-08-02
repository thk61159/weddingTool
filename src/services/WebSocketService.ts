import { WebSocketServer, WebSocket, ServerOptions } from 'ws';
import { Server } from 'http';

class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocketServer;

  private constructor(server: Server) {
    const options: ServerOptions = { server }; // Properly define the options
    this.wss = new WebSocketServer(options);
    this.setupListeners();
  }

  public static getInstance(server?: Server): WebSocketService {
    if (!WebSocketService.instance) {
      if (!server) {
        throw new Error("Server instance must be provided for the first initialization.");
      }
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  public getWebSocketServer(): WebSocketServer {
    return this.wss;
  }
  public broadcastMessage(message: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private setupListeners(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected');

      ws.on('message', (message: string) => {
        console.log('Received:', message);
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }
}

export default WebSocketService;
