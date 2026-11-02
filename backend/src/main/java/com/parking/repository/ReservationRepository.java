package com.parking.repository;

import com.parking.entity.Reservation;
import com.parking.entity.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByStatusOrderByStartTimeAsc(ReservationStatus status);

    List<Reservation> findByVehicleNumberIgnoreCase(String vehicleNumber);

    List<Reservation> findBySlotId(Long slotId);

    Optional<Reservation> findFirstBySlotIdAndStatus(Long slotId, ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.slot.id = :slotId " +
           "AND r.status IN ('CONFIRMED', 'PENDING') " +
           "AND (:startTime < r.endTime AND :endTime > r.startTime)")
    List<Reservation> findOverlappingReservations(
            @Param("slotId") Long slotId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT r FROM Reservation r WHERE r.slot.id = :slotId " +
           "AND r.id != :reservationId " +
           "AND r.status IN ('CONFIRMED', 'PENDING') " +
           "AND (:startTime < r.endTime AND :endTime > r.startTime)")
    List<Reservation> findOverlappingReservationsExcludingSelf(
            @Param("slotId") Long slotId,
            @Param("reservationId") Long reservationId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    long countByStatus(ReservationStatus status);

    List<Reservation> findTop5ByOrderByCreatedAtDesc();
}
