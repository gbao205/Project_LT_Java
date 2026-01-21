package com.cosre.backend.dto.staff;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateClassDateDTO {
    private LocalDate startDate;
    private LocalDate endDate;
}
