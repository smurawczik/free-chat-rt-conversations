import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const serverPort = configService.get<number>('PORT');
  const frontendApiURL = configService.get<string>('FRONTEND_URL');

  if (!serverPort || !frontendApiURL) {
    throw new Error('CONFIG is not defined');
  }

  app.enableCors({ origin: frontendApiURL, credentials: true });
  app.use(cookieParser());
  app.use(compression());
  await app.listen(serverPort, () =>
    console.log(`orchestrator is listening on port ${serverPort}`),
  );
}
bootstrap();
