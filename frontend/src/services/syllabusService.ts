// services/syllabusService.ts
import axios from "axios";

export const getSyllabusList = async (page: number, size: number) => {
  const res = await axios.get("/api/staff/syllabus", {
    params: { page, size },
  });
  return res.data;
};

export const getSyllabusDetail = async (id: number) => {
  const res = await axios.get(`/api/staff/syllabus/${id}`);
  return res.data;
};
