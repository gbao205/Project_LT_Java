package com.cosre.backend.dto.staff;

import lombok.Data;

@Data
public class TimeTableImportDTO {
    private String classCode;
    private String date;
    private String startTime;
    private String endTime;
    private String room;
    private String description;
}
