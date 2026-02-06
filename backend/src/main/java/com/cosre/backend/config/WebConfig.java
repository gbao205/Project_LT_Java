package com.cosre.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ánh xạ URL /api/workspace/download/** vào thư mục vật lý uploads/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        registry.addResourceHandler("/api/workspace/download/**")
                .addResourceLocations("file:uploads/");
    }
}