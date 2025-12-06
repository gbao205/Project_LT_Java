package com.cosre.backend.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // 1. Tạo Token từ Email (username)
    public String generateJwtToken(String email) {
        // Thời gian hết hạn của Token (ví dụ: 86400000 ms = 1 ngày)
        int jwtExpirationMs = 86400000;
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Lấy key để ký tên
    private Key key() {
        // Đây là chuỗi Base64 ngẫu nhiên (đủ dài để bảo mật 256-bit)
        String jwtSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // 3. Lấy Email từ Token
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // 4. Kiểm tra Token có hợp lệ không
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (Exception e) {
            System.err.println("JWT token không hợp lệ: " + e.getMessage());
        }
        return false;
    }
}