package com.cosre.backend.dto.staff;

import com.alibaba.excel.annotation.ExcelProperty;
import com.opencsv.bean.CsvBindByName;
import lombok.Data;


@Data
public class UserImportDTO {
    @ExcelProperty("Họ và Tên")
    @CsvBindByName(column = "Họ và Tên")
    private String fullName;

    // --- SINH VIÊN ---
    @ExcelProperty("MSSV")
    @CsvBindByName(column = "MSSV")
    private String studentId;

    @ExcelProperty("Bậc đào tạo")
    @CsvBindByName(column = "Bậc đào tạo")
    private String eduLevel;

    @ExcelProperty("Khóa")
    @CsvBindByName(column = "Khóa")
    private String batch;

    @ExcelProperty("Ngành")
    @CsvBindByName(column = "Ngành")
    private String major;

    @ExcelProperty("Khoa")
    @CsvBindByName(column = "Khoa")
    private String faculty;

    @ExcelProperty("Chuyên ngành")
    @CsvBindByName(column = "Chuyên ngành")
    private String specialization;

    @ExcelProperty("Loại hình đào tạo")
    @CsvBindByName(column = "Loại hình đào tạo")
    private String trainingType;

    @ExcelProperty("Trạng thái")
    @CsvBindByName(column = "Trạng thái")
    private String studentStatus;

    @ExcelProperty("Ngày sinh")
    @CsvBindByName(column = "Ngày sinh")
    private String dob;

    @ExcelProperty("Ngày nhập học")
    @CsvBindByName(column = "Ngày nhập học")
    private String admissionDate;

    // --- GIẢNG VIÊN ---
    @ExcelProperty("CCCD")
    @CsvBindByName(column = "CCCD")
    private String cccd;

    @ExcelProperty("Học vị")
    @CsvBindByName(column = "Học vị")
    private String degree;

    @ExcelProperty("Bộ môn")
    @CsvBindByName(column = "Bộ môn")
    private String department;
}
