import { prisma } from "../utils/prisma.utils.js";

class StudentsRepository {
    //전체 학생 목록 조회
    findAllStudents = async(userId) =>{
        const students = await prisma.student.findMany({

            include: {
                user: true,
            },
        });
        return students
    };

}

export default StudentsRepository;
