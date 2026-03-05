import { type INestApplicationContext, type WsMessageHandler } from '@nestjs/common';
import { AbstractWsAdapter, type GatewayMetadata } from '@nestjs/websockets';
import { EMPTY, filter, fromEvent, mergeMap, type Observable } from 'rxjs';
import type WebSocket from 'ws';

import { StompCommand, StompFrame } from './frame.js';
import { StompServer, type StompServerOptions } from './server.js';

export interface StompAdapterOptions extends Omit<StompServerOptions, 'server'> {
  app: INestApplicationContext;
}

interface Message {
  data: Buffer;
}

export class StompAdapter extends AbstractWsAdapter {
  private server?: StompServer;
  private readonly _options: StompAdapterOptions;

  constructor(options: StompAdapterOptions) {
    super(options.app);
    this._options = options;
  }

  public create(_port: number, _options?: GatewayMetadata): StompServer {
    if (this.server) return this.server;
    const { path, auth } = this._options;
    const server = new StompServer({ server: this.httpServer, path, auth });
    this.server = server;
    return server;
  }

  public bindMessageHandlers(
    client: WebSocket,
    handlers: WsMessageHandler[],
    transform: (data: Observable<StompFrame>) => Observable<Message>,
  ) {
    fromEvent(client, 'message')
      .pipe(
        mergeMap((data) => this.bindMessageHandler(data as Message, handlers, transform)),
        filter((result) => result !== undefined),
      )
      .subscribe((response) => {
        client.send(response.data);
      });
  }

  public bindMessageHandler(
    message: Message,
    handlers: WsMessageHandler[],
    transform: (data: Observable<StompFrame>) => Observable<Message>,
  ): Observable<Message> {
    const frame = StompFrame.parse(message.data);
    if (frame.command === StompCommand.SEND) {
      const { destination } = frame.headers;
      const messageHandler = handlers.find((handler) => handler.message === destination);
      if (!messageHandler) return EMPTY;
      return transform(messageHandler.callback(frame) as Observable<StompFrame>);
    }
    return EMPTY;
  }
}
