package com.cosre.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/all")
    public String allAccess() {
        return "Nội dung công khai (Ai cũng xem được)";
    }

    @GetMapping("/user")
    public String userAccess() {
        return "Nội dung bảo mật (Chỉ User có Token mới xem được)";
    }
}