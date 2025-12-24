export interface Subject {
    id: number;
    subjectCode: string; // VD: SWP391
    name: string;   
    specialization: string;     // VD: Đồ án tốt nghiệp
    description?: string;
}