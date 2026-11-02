package com.parking.repository;

import com.parking.entity.ParkingSlot;
import com.parking.entity.enums.SlotStatus;
import com.parking.entity.enums.VehicleType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    Optional<ParkingSlot> findBySlotNumberIgnoreCase(String slotNumber);

    boolean existsBySlotNumberIgnoreCase(String slotNumber);

    List<ParkingSlot> findByStatus(SlotStatus status);

    List<ParkingSlot> findByStatusAndSlotType(SlotStatus status, VehicleType slotType);

    List<ParkingSlot> findByFloorIgnoreCase(String floor);

    List<ParkingSlot> findByZoneIgnoreCase(String zone);

    long countByStatus(SlotStatus status);

    long countBySlotType(VehicleType slotType);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ParkingSlot s WHERE s.id = :id")
    Optional<ParkingSlot> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT DISTINCT s.floor FROM ParkingSlot s ORDER BY s.floor")
    List<String> findDistinctFloors();

    @Query("SELECT DISTINCT s.zone FROM ParkingSlot s ORDER BY s.zone")
    List<String> findDistinctZones();
}
