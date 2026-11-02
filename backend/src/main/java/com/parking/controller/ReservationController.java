package com.parking.controller;

import com.parking.dto.request.CreateReservationRequest;
import com.parking.dto.response.ApiResponse;
import com.parking.dto.response.ParkingRecordDto;
import com.parking.dto.response.ReservationDto;
import com.parking.entity.enums.ReservationStatus;
import com.parking.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationDto>> createReservation(@Valid @RequestBody CreateReservationRequest request) {
        ReservationDto created = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slot " + created.getSlotNumber() + " reserved successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationDto>>> getAllReservations(
            @RequestParam(required = false) ReservationStatus status) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getAllReservations(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationDto>> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getReservationById(id)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReservationDto>> cancelReservation(@PathVariable Long id) {
        ReservationDto cancelled = reservationService.cancelReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation cancelled successfully", cancelled));
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<ParkingRecordDto>> checkInReservation(@PathVariable Long id) {
        ParkingRecordDto record = reservationService.checkInReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Reservation checked-in successfully. Slot " + record.getSlotNumber() + " assigned.", record));
    }
}
