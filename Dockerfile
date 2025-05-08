# ใช้ Node.js official image (แทนที่ version ถ้าจำเป็น)
FROM node:18

# ตั้ง working directory ใน container
WORKDIR /usr/src/app

# คัดลอกไฟล์ package.json และ yarn.lock (หรือตัวจัดการ package อื่นๆ)
COPY package*.json ./

# ติดตั้ง dependencies
RUN yarn install

# คัดลอกโค้ดทั้งหมดจากเครื่องของคุณไปยัง container
COPY . .

# คอมไพล์โปรเจค NestJS
RUN yarn build

# กำหนดพอร์ตที่ใช้
EXPOSE 3000

# สั่งให้รันแอปพลิเคชันใน production mode
CMD ["yarn", "start:prod"]
