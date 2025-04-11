import { prisma } from "../utils/prisma.utils.js";

class UserRepository {
    // 반 or 담임 조회 (유효성 검증)
    findClass = async(grade, gradeClass) => {
        const data = await prisma.class.findFirst({
            where: {
                grade: grade,
                gradeClass: gradeClass,
            },
        });
        return data;
    }

    // 반 생성
    createClass = async(grade, gradeClass, teacherId) => {
        const data = await prisma.class.create({
            data: {
                grade,
                gradeClass,
                teacher: {
                    connect: {
                        teacherId:teacherId
                    }
                },
            },

            
        });
        return data;
    }
}

export default UserRepository;
