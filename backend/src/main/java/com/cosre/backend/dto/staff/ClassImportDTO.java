package com.cosre.backend.dto.staff;

import com.alibaba.excel.annotation.ExcelProperty;
import com.opencsv.bean.CsvBindByName;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassImportDTO {

    @ExcelProperty("Tên lớp")
    @CsvBindByName(column = "Tên lớp")
    private String name;

    @ExcelProperty("Mã lớp")
    @CsvBindByName(column = "Mã lớp")
    private String classCode;

    @ExcelProperty("Học kỳ")
    @CsvBindByName(column = "Học kỳ")
    private String semester;

    @ExcelProperty("Mã môn")
    @CsvBindByName(column = "Mã môn")
    private String subjectCode;

    @ExcelProperty("Email giảng viên")
    @CsvBindByName(column = "Email giảng viên")
    private String lecturerEmail;

    @ExcelProperty("Ngày bắt đầu")
    @CsvBindByName(column = "Ngày bắt đầu")
    private String startDate;

    @ExcelProperty("Ngày kết thúc")
    @CsvBindByName(column = "Ngày kết thúc")
    private String endDate;

}