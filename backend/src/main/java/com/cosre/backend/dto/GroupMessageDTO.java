package com.cosre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMessageDTO {
    private String username;
    private String content;
    private LocalDateTime time; // Sẽ được Jackson format tự động
}