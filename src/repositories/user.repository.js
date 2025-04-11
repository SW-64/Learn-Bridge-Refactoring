class UserRepository {
  // 내 정보 조회
  getUserById = async (userId) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        school: true,
      },
      data: {
        name: true,
        ...(user.role === 'TEACHER' && {
          teacher: {
            include: {
              isHomeroom: true,
            },
          },
        }),
      },
    });
    return user;
  };
}
export default UserRepository;
