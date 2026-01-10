package com.cosre.backend.dto.staff;

import com.alibaba.excel.annotation.ExcelProperty;
import com.opencsv.bean.CsvBindByName;
import lombok.Data;

@Data
public class SyllabusImportDTO {
    @ExcelProperty("Mã môn")
    @CsvBindByName(column = "Mã môn")
    private String subjectCode;

    @ExcelProperty("Mô tả")
    @CsvBindByName(column = "Mô tả")
    private String description;

    @ExcelProperty("Mục tiêu")
    @CsvBindByName(column = "Mục tiêu")
    private String objectives;

    @ExcelProperty("Lộ trình học tập")
    @CsvBindByName(column = "Lộ trình học tập")
    private String outline;

    @ExcelProperty("Năm")
    @CsvBindByName(column = "Năm")
    private Integer year;
}
