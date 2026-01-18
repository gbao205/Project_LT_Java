import api from "./api";

export const getSyllabusList = async (
  page: number, 
  size: number, 
  id?: number, 
  subjectName?: string, 
  year?: number
) => {
  const res = await api.get("/staff/syllabus", {
    params: { page, size, id, subjectName, year },
  });
  return res.data;
};

export const getSyllabusDetail = async (id: number) => {
  const res = await api.get(`/staff/syllabus/${id}`);
  return res.data;
};
