package com.cosre.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đây chính là endpoint "/ws" mà frontend đang gọi
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Cho phép mọi nguồn
                .withSockJS(); // Kích hoạt SockJS để hỗ trợ frontend
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Các tin nhắn bắt đầu bằng /app sẽ được gửi tới @MessageMapping trong Controller
        registry.setApplicationDestinationPrefixes("/app");

        // Các tin nhắn bắt đầu bằng /topic sẽ được gửi về cho Client đã subscribe
        registry.enableSimpleBroker("/topic");
    }
}