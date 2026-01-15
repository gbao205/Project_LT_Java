package com.cosre.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Xử lý lỗi Validation (@Valid, @Email, @Size...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errorMessage = "Dữ liệu không hợp lệ";
        FieldError fieldError = ex.getBindingResult().getFieldError();
        if (fieldError != null) {
            errorMessage = fieldError.getDefaultMessage();
        }
        return buildResponse(HttpStatus.BAD_REQUEST, errorMessage, request);
    }

    // 2. Xử lý lỗi format JSON (thiếu dấu ngoặc, sai phẩy...)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleJsonErrors(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Lỗi định dạng dữ liệu (JSON): " + ex.getMessage(), request);
    }

    // 3. Xử lý lỗi nghiệp vụ riêng của App (AppException)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<Object> handleAppException(AppException ex, HttpServletRequest request) {
        return buildResponse(ex.getStatus(), ex.getMessage(), request);
    }

    // 4. Các lỗi Runtime khác (Lỗi logic, NullPointer...)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeExceptions(RuntimeException ex, HttpServletRequest request) {
        log.error("Runtime Exception: ", ex); // Log chi tiết lỗi để debug trên server
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Có lỗi hệ thống xảy ra", request);
    }

    // 5. Xử lý tất cả các lỗi còn lại
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralExceptions(Exception ex, HttpServletRequest request) {
        log.error("General Exception: ", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống không xác định", request);
    }

    /**
     * Hàm chung để tạo response.
     * Tự động kiểm tra nếu là request SSE (Real-time) thì trả về String để tránh lỗi Converter.
     */
    private ResponseEntity<Object> buildResponse(HttpStatus status, String message, HttpServletRequest request) {
        String acceptHeader = request.getHeader("Accept");
        
        // Nếu request yêu cầu SSE (text/event-stream), trả về String đơn giản thay vì Map/JSON
        if (acceptHeader != null && acceptHeader.contains("text/event-stream")) {
            return new ResponseEntity<>(message, status);
        }

        // Response JSON chuẩn cho các trường hợp khác
        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value());
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());
        body.put("path", request.getRequestURI());

        return new ResponseEntity<>(body, status);
    }

}