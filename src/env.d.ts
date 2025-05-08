// src/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASE_URL: string;
      // เพิ่มตัวแปรอื่นๆ ที่ต้องการใช้จาก .env ได้ที่นี่
    }
  }
}
