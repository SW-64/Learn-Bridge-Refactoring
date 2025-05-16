import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  const hashedPassword = await bcrypt.hash('admin1234', 10); // 초기 비번

  await prisma.user.create({
    data: {
      name: '관리자',
      email: 'admin@school.com',
      role: 'ADMIN',
      password: hashedPassword,
      school: {
        connect: { schoolId: 1 }, // 관리자 계정이 속한 학교
      },
    },
  });

  console.log('✅ Admin 계정이 생성되었습니다');
};

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
