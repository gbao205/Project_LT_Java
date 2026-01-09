package com.cosre.backend.dto.staff;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SyllabusDetailDTO {
    Long id;
    String subjectName;
    Integer year;
    String description;
    String objectives;
    String outline;
}
