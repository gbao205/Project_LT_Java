package com.cosre.backend.dto.staff;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
@Data
@Builder
public class TimeTableResponseDTO {
    private LocalDate date;
    private int dayOfWeek;
    private int slot;
    private String room;
    private String className;
}
