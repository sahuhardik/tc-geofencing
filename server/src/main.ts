import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('TimeCamp Geofencing')
    .setDescription('TimeCamp Geofencing API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
