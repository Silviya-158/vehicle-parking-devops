package com.parking.repository;

import com.parking.entity.ParkingRecord;
import com.parking.entity.enums.ParkingRecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingRecordRepository extends JpaRepository<ParkingRecord, Long> {

    List<ParkingRecord> findByStatus(ParkingRecordStatus status);

    Optional<ParkingRecord> findFirstByVehicleNumberIgnoreCaseAndStatus(String vehicleNumber, ParkingRecordStatus status);

    Optional<ParkingRecord> findFirstBySlotIdAndStatus(Long slotId, ParkingRecordStatus status);

    long countByStatus(ParkingRecordStatus status);

    @Query("SELECT COUNT(p) FROM ParkingRecord p WHERE p.entryTime >= :startOfDay AND p.entryTime <= :endOfDay")
    long countTodayEntries(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(p) FROM ParkingRecord p WHERE p.exitTime >= :startOfDay AND p.exitTime <= :endOfDay AND p.status = 'COMPLETED'")
    long countTodayExits(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT p FROM ParkingRecord p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:search IS NULL OR LOWER(p.vehicleNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(p.driverName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(p.slot.slotNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:startDate IS NULL OR p.entryTime >= :startDate) AND " +
           "(:endDate IS NULL OR p.entryTime <= :endDate)")
    Page<ParkingRecord> searchRecords(
            @Param("status") ParkingRecordStatus status,
            @Param("search") String search,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    List<ParkingRecord> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT p FROM ParkingRecord p WHERE p.entryTime >= :since ORDER BY p.entryTime ASC")
    List<ParkingRecord> findRecordsSince(@Param("since") LocalDateTime since);
}
