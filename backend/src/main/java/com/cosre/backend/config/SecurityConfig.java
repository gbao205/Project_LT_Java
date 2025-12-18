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

    // 1. Cấu hình bộ lọc bảo mật
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF vì dùng JWT
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Kích hoạt CORS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless
                .authorizeHttpRequests(auth -> auth
                        // 1. Cho phép request lỗi và preflight (OPTIONS)
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. CÁC API PUBLIC
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers("/api/configs/**").permitAll()
                        .requestMatchers("/api/subjects/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll()

                        // 3. PHÂN QUYỀN
                        .requestMatchers("/api/staff/**").hasRole("STAFF")
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // 4. CÁC API CÒN LẠI CẦN ĐĂNG NHẬP
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

    // 4. Cấu hình CORS (Cho phép Frontend gọi API)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép TẤT CẢ các nguồn (Vercel, Localhost,...)
        configuration.setAllowedOrigins(List.of("*"));

        // Cho phép đầy đủ các method (Thêm HEAD cho chuẩn)
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));

        // Cho phép mọi header
        configuration.setAllowedHeaders(List.of("*"));

        // (Mới) Cho phép Frontend đọc được header trả về (VD: Authorization)
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));

        // Khi AllowedOrigins là "*" thì AllowCredentials PHẢI là false (hoặc không set)
        // configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}