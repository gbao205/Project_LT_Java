package com.cosre.backend.controller;

import com.cosre.backend.entity.SystemConfig;
import com.cosre.backend.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/configs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SystemConfigController {

    private final SystemConfigRepository configRepository;

    // Lấy tất cả cấu hình về dưới dạng Map {key: value}
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllConfigs() {
        List<SystemConfig> configs = configRepository.findAll();
        Map<String, String> configMap = configs.stream()
                .collect(Collectors.toMap(SystemConfig::getConfigKey, SystemConfig::getConfigValue));
        return ResponseEntity.ok(configMap);
    }

    // Lưu danh sách cấu hình
    @PostMapping
    public ResponseEntity<?> saveConfigs(@RequestBody Map<String, String> configs) {
        configs.forEach((key, value) -> {
            configRepository.save(new SystemConfig(key, value));
        });
        return ResponseEntity.ok(Map.of("message", "Lưu cấu hình thành công!"));
    }
}