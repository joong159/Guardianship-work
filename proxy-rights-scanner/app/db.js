import { PrismaClient } from '@prisma/client';

// 개발 환경에서 hot-reloading 시 PrismaClient가 계속 새로 생성되는 것을 방지합니다.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ['query'], // 개발 시 쿼리를 확인하고 싶을 때 주석을 해제하세요.
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;