export interface SyllabusList {
  id: number;
  subjectName: string;
  year: number;
}

export interface SyllabusDetail {
  subjectName: string;
  description: string;
  objectives: string;
  outline: string;
  year: number;
}
