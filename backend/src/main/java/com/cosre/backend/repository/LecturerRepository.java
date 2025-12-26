package com.cosre.backend.repository;

import com.cosre.backend.entity.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LecturerRepository extends JpaRepository<Lecturer, Long> {
    Optional<Lecturer> findByCCCD(String cccd);
    boolean existsByCCCD(String cccd);
}