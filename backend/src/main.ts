import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081'],
    credentials: true,
  });
  
  // 글로벌 파이프 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('제주 SNS API')
    .setDescription('제주 지역 정보 공유 SNS API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3004);
  console.log('서버가 포트 3004에서 실행 중입니다.');
  console.log('API 문서: http://localhost:3004/api');
}
bootstrap();
