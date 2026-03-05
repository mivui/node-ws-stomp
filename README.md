# ws-stomp

[![npm version](https://img.shields.io/npm/v/ws-Stomp.svg?style=flat-square)](https://www.npmjs.com/package/ws-stomp)
[![Alt](https://img.shields.io/npm/dt/ws-stomp?style=flat-square)](https://npmcharts.com/compare/ws-stomp?minimal=true)
![Alt](https://img.shields.io/github/license/mivui/node-ws-stomp?style=flat-square)

### implementation of the stomp version of ws

### install

```shell
npm i ws-stomp
```

> http

```ts
import { createServer } from 'http';
import { Stomp } from 'ws-stomp';

const server = createServer();
Stomp.server(server, '/ws');
server.listen(3000);
// ws://lcalhost:3000/ws
```

> send

```ts
import { Stomp } from 'ws-stomp';

Stomp.send('/topic/something', JSON.stringify({ name: 'name' }), { token: 'token' });
```

> subscribe

```ts
import { Stomp } from 'ws-stomp';

Stomp.subscribe('/topic/greetings', (e) => {
  const body = e.body;
});
```

> unsubscribe

```ts
import { Stomp } from 'ws-stomp';

Stomp.unsubscribe('/topic/greetings');
```

> express

#### server.js

```ts
import express from 'express';
import { Stomp } from 'ws-stomp';

const app = express();
app.get('/send', (_, res) => {
  Stomp.send('/topic/something', 'payload');
  res.status(200).json({});
});
const server = app.listen(3000);
Stomp.server(server, '/ws');
Stomp.subscribe('/topic/greetings', (message) => {
  console.log(message.body);
});
```

#### browser.js

```ts
import { Client } from '@stomp/stompjs';

const client = new Client({
  brokerURL: 'ws://lcalhost:3000/ws',
  onConnect: () => {
    client.publish({ destination: '/topic/greetings', body: 'Hello World!' });
    client.subscribe('/topic/something', (message) => {
      console.log(message.body);
    });
  },
});
client.activate();
```

> nest

#### install

```shell
npm i @nestjs/websockets
```

#### websocket.gateway.ts

```ts
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { StompFrame, StompServer } from 'ws-stomp';

@WebSocketGateway()
export class WebsocketGateway {
  @WebSocketServer()
  private readonly server: StompServer;

  @SubscribeMessage('/topic/greetings')
  public send(@MessageBody() message: StompFrame) {
    console.log(message.body);
    this.server.send('/topic/something', message.body);
  }
}
```

#### app.module.ts

```ts
import { Module } from '@nestjs/common';

import { WebsocketGateway } from './websocket.gateway';

@Module({
  providers: [WebsocketGateway],
})
export class AppModule {}
```

#### main.ts

```ts
import { StompAdapter } from 'ws-stomp';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new StompAdapter({ app, path: '/ws' }));
  await app.listen(3000);
}
bootstrap();
```

#### browser.js

```ts
import { Client } from '@stomp/stompjs';

const client = new Client({
  brokerURL: 'ws://lcalhost:3000/ws',
  onConnect: () => {
    client.publish({ destination: '/topic/greetings', body: 'Hello World!' });
    client.subscribe('/topic/something', (message) => {
      console.log(message.body);
    });
  },
});
client.activate();
```
