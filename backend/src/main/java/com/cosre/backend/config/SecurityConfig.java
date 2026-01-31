package com.cosre.backend.config;

import com.cosre.backend.security.jwt.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static javax.swing.text.html.HTML.Tag.HEAD;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    private static final String[] SWAGGER_WHITELIST = {
        "/swagger",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html"
    };

    // 1. Cấu hình bộ lọc bảo mật
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF vì dùng JWT
                .headers(headers -> headers
                    // CHO PHÉP hiển thị nội dung trong iframe từ cùng một server
                    .frameOptions(frame -> frame.sameOrigin()) 
                    .frameOptions(frame -> frame.disable())
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Kích hoạt CORS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless
                .authorizeHttpRequests(auth -> auth
                    // --- SWAGGER ---
                    .requestMatchers(SWAGGER_WHITELIST).permitAll()
                    .requestMatchers("/api/workspace/download/**").permitAll()
                    .requestMatchers("/api/auth/**").permitAll()
                    // 1. Cho phép request lỗi và preflight (OPTIONS)
                    .requestMatchers("/error").permitAll()
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // 2. CÁC API PUBLIC
                    .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                    .requestMatchers("/api/configs/**").permitAll()
                    .requestMatchers("/api/subjects/**").permitAll()
                    .requestMatchers("/api/test/**").permitAll()
                    .requestMatchers("/ws/**").permitAll()
                    .requestMatchers("/api/chat/**").permitAll()
                    // 3. API AI & CHAT (BẮT BUỘC ĐĂNG NHẬP ĐỂ LẤY USER ID)
                    .requestMatchers("/api/ai/**").authenticated()

                    // 4. PHÂN QUYỀN
                    .requestMatchers("/api/users/contacts").authenticated()
                    .requestMatchers("/api/users/**").hasRole("ADMIN")

                    // 5. CÁC API CÒN LẠI CẦN ĐĂNG NHẬP
                    .anyRequest().authenticated()
                );

        // Thêm filter kiểm tra Token trước
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 2. Bean mã hóa mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 3. Bean quản lý xác thực
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // 4. Cấu hình CORS (ĐÃ SỬA LỖI)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Thay vì setAllowedOrigins("*"), ta dùng setAllowedOriginPatterns("*")
        // Điều này cho phép mọi nguồn nhưng vẫn hợp lệ khi dùng AllowCredentials
        configuration.setAllowedOriginPatterns(List.of("*"));

        // Cho phép đầy đủ các method
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD","PATCH"));

        // Cho phép mọi header
        configuration.setAllowedHeaders(List.of("*"));

        // Cho phép Frontend đọc được header trả về
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));

        // QUAN TRỌNG: Cho phép gửi Cookies/Auth Header (Credentials)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}