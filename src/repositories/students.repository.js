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

    //특정 학생 상세 조회
    findStudent = async(studentId) => {
        const students = await prisma.student.findUnique({
            where: {
                studentId:Number(studentId),
            },

            include: {
                user: true,
            },
        });
        return students;
    };

    //특정 학생 정보 수정
    modifyStudent = async(studentId,updateData) => {
        const students = await prisma.student.update({
            where: {
                studentId:Number(studentId),
            },

            data: updateData,

            include: {
                user: true,
            },
        });
        return students;
    };

    //특정 학생 정보 삭제
    eraseStudent= async(studentId) => {
        const students = await prisma.student.delete({
            where:{
                studentId:Number(studentId)
            },
        });
        return students;
    };

}

export default StudentsRepository;
