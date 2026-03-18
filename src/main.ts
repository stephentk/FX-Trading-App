// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './common/guards/jwt-auth-guard';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // if using Swagger

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe (good practice)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Apply JWT guard globally
  app.useGlobalGuards(app.get(JwtAuthGuard));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
