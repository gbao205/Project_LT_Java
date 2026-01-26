package com.cosre.backend.dto.staff;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class TimeTableImportDTO {
    @ExcelProperty("class_code")
    private String classCode;

    @ExcelProperty("Thứ")
    private Integer dayOfWeek;

    @ExcelProperty("Ca")
    private Integer slot;

    @ExcelProperty("Phòng")
    private String room;

    @ExcelProperty("Tuần")
    private String weeks;
}
