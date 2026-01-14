package com.cosre.backend.dto.staff;
import com.alibaba.excel.annotation.ExcelProperty;
import com.opencsv.bean.CsvBindByName;
import lombok.Data;
@Data
public class SubjectImportDTO {

    @ExcelProperty("Mã môn")
    @CsvBindByName(column = "Mã môn")
    private String subjectCode;

    @ExcelProperty("Tên môn")
    @CsvBindByName(column = "Tên môn")
    private String name;

    @ExcelProperty("Chuyên ngành")
    @CsvBindByName(column = "Chuyên ngành")
    private String specialization;
}
