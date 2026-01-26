package com.cosre.backend.dto.staff;

import com.alibaba.excel.annotation.ExcelProperty;
import com.opencsv.bean.CsvBindByName;
import lombok.Data;

@Data
public class AssignImportDTO {
    @ExcelProperty("studentId")
    @CsvBindByName(column = "studentId")
    private String studentId;
}