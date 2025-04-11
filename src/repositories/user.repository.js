class UserRepository {
  // 내 정보 조회
  getUserById = async (userId) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      data: {
        name: true,
        ...(user.role === 'TEACHER' && {
          teacher: {
            include: {
              isHomeroom: true,
            },
          },
        }),
        school: {
          include: {
            schoolName: true,
          },
        },
      },
    });
    return user;
  };

  // 내 비밀번호 조회
  getUserPassword = async (userId) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
      },
    });
    return user;
  };

  // 내 비밀번호 수정
  updateUserPassword = async (userId, password) => {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password,
      },
    });
    return user;
  };
}
export default UserRepository;
