package com.cosre.backend.dto.head;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HeadLecturerDTO {
    private Long id;
    private String fullName;
    private String email;
    private int activeClassCount;
    private int proposalCount;
    private String status;
}