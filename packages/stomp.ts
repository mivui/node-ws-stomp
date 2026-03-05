import { type Server as HTTPServer } from 'http';
import { type Server as HTTPSServer } from 'https';

import { type AuthProvider } from './auth.js';
import { type StompFrame } from './frame.js';
import { StompServer } from './server.js';

export class Autowired {
  private constructor() {}

  private static readonly container: Record<string, unknown> = {};

  public static register(name: string, instance: unknown) {
    this.container[name] = instance;
  }

  public static get<T>(name: string): T {
    return this.container[name] as T;
  }
}

export class Stomp {
  private constructor() {}

  public static server(server: HTTPServer | HTTPSServer, path: string, auth?: AuthProvider) {
    const stomp = new StompServer({ server, path, auth });
    Autowired.register(StompServer.name, stomp);
  }

  public static send(destination: string, body: string, headers: Record<string, string> = {}) {
    const server = Autowired.get<StompServer>(StompServer.name);
    server?.send(destination, body, headers);
  }

  public static subscribe(destination: string, callback: (frame: StompFrame) => void) {
    const server = Autowired.get<StompServer>(StompServer.name);
    server?.subscribe(destination, callback);
  }

  public static unsubscribe(destination: string) {
    const server = Autowired.get<StompServer>(StompServer.name);
    server?.unsubscribe(destination);
  }
}
