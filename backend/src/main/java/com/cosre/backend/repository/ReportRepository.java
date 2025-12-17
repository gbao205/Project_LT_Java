package com.cosre.backend.repository;

import com.cosre.backend.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    long countByIsResolvedFalse(); // Đếm số báo cáo chưa xử lý
}