package com.cosre.backend.repository;

import com.cosre.backend.entity.TimeTable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeTableRepository extends JpaRepository<TimeTable, Long> {
    boolean existsByDayOfWeekAndSlotAndRoom(int day, int slot, String room);
}
