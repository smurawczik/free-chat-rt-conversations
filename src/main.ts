import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });
  app.use(cookieParser());
  app.use(compression());
  // app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(3033, () =>
    console.log('orchestrator is listening on port 3033'),
  );
}
bootstrap();
