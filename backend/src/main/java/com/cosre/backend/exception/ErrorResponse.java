package com.cosre.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private int status;           // Mã lỗi
    private String message;       // Thông báo lỗi chi tiết
    private LocalDateTime timestamp; // Thời gian xảy ra lỗi
}