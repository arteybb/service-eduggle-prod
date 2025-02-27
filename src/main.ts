import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // สร้างแอปพลิเคชันด้วย Express Adapter
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  // ตั้ง Global Prefix สำหรับ API
  app.setGlobalPrefix('api');

  // ใช้ Static Assets สำหรับไฟล์ที่อยู่ในโฟลเดอร์ uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URL path ที่จะเข้าถึงไฟล์ใน uploads
  });

  // เริ่มเซิร์ฟเวอร์บนพอร์ตที่กำหนดใน environment หรือ 3000
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
