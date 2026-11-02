package com.parking.service;

import com.parking.dto.request.CreateReservationRequest;
import com.parking.dto.request.VehicleEntryRequest;
import com.parking.dto.response.ParkingRecordDto;
import com.parking.dto.response.ReservationDto;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.enums.ReservationStatus;
import com.parking.entity.enums.SlotStatus;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository slotRepository;
    private final VehicleService vehicleService;

    public ReservationService(ReservationRepository reservationRepository,
                              ParkingSlotRepository slotRepository,
                              @Lazy VehicleService vehicleService) {
        this.reservationRepository = reservationRepository;
        this.slotRepository = slotRepository;
        this.vehicleService = vehicleService;
    }

    @Transactional
    public ReservationDto createReservation(CreateReservationRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new BadRequestException("Start time cannot be in the past");
        }

        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + request.getSlotId()));

        // Check for overlapping reservations for this slot
        List<Reservation> overlaps = reservationRepository.findOverlappingReservations(
                slot.getId(), request.getStartTime(), request.getEndTime()
        );

        if (!overlaps.isEmpty()) {
            throw new BadRequestException("Slot " + slot.getSlotNumber() +
                    " is already reserved between " + overlaps.get(0).getStartTime() + " and " + overlaps.get(0).getEndTime());
        }

        // If reservation starts within the next 2 hours and slot is currently available, mark slot as RESERVED
        if (slot.getStatus() == SlotStatus.AVAILABLE &&
                request.getStartTime().isBefore(LocalDateTime.now().plusHours(2))) {
            slot.setStatus(SlotStatus.RESERVED);
            slotRepository.save(slot);
        }

        Reservation reservation = new Reservation();
        reservation.setSlot(slot);
        reservation.setVehicleNumber(request.getVehicleNumber().trim().toUpperCase());
        reservation.setVehicleType(request.getVehicleType());
        reservation.setDriverName(request.getDriverName().trim());
        reservation.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);
        reservation.setStartTime(request.getStartTime());
        reservation.setEndTime(request.getEndTime());
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setNotes(request.getNotes());

        Reservation savedReservation = reservationRepository.save(reservation);
        return mapToDto(savedReservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getAllReservations(ReservationStatus status) {
        List<Reservation> list;
        if (status != null) {
            list = reservationRepository.findByStatusOrderByStartTimeAsc(status);
        } else {
            list = reservationRepository.findAll();
        }

        return list.stream()
                .sorted(Comparator.comparing(Reservation::getStartTime).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservationDto getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
        return mapToDto(reservation);
    }

    @Transactional
    public ReservationDto cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
            throw new BadRequestException("Cannot cancel an already checked-in reservation");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation updated = reservationRepository.save(reservation);

        // Check if slot was marked RESERVED, and restore to AVAILABLE if no other active reservation
        ParkingSlot slot = reservation.getSlot();
        if (slot.getStatus() == SlotStatus.RESERVED) {
            List<Reservation> activeReservations = reservationRepository.findOverlappingReservationsExcludingSelf(
                    slot.getId(), id, LocalDateTime.now(), LocalDateTime.now().plusHours(2)
            );
            if (activeReservations.isEmpty()) {
                slot.setStatus(SlotStatus.AVAILABLE);
                slotRepository.save(slot);
            }
        }

        return mapToDto(updated);
    }

    @Transactional
    public ParkingRecordDto checkInReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        if (reservation.getStatus() != ReservationStatus.CONFIRMED && reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BadRequestException("Reservation is not active (status: " + reservation.getStatus() + ")");
        }

        VehicleEntryRequest entryRequest = new VehicleEntryRequest();
        entryRequest.setVehicleNumber(reservation.getVehicleNumber());
        entryRequest.setVehicleType(reservation.getVehicleType());
        entryRequest.setDriverName(reservation.getDriverName());
        entryRequest.setPhoneNumber(reservation.getPhoneNumber());
        entryRequest.setSlotId(reservation.getSlot().getId());
        entryRequest.setReservationId(reservation.getId());
        entryRequest.setNotes("Checked in from reservation #" + reservation.getId());

        return vehicleService.parkVehicle(entryRequest);
    }

    public ReservationDto mapToDto(Reservation reservation) {
        ReservationDto dto = new ReservationDto();
        dto.setId(reservation.getId());
        dto.setSlotId(reservation.getSlot().getId());
        dto.setSlotNumber(reservation.getSlot().getSlotNumber());
        dto.setFloor(reservation.getSlot().getFloor());
        dto.setZone(reservation.getSlot().getZone());
        dto.setVehicleNumber(reservation.getVehicleNumber());
        dto.setVehicleType(reservation.getVehicleType());
        dto.setDriverName(reservation.getDriverName());
        dto.setPhoneNumber(reservation.getPhoneNumber());
        dto.setStartTime(reservation.getStartTime());
        dto.setEndTime(reservation.getEndTime());
        dto.setStatus(reservation.getStatus());
        dto.setNotes(reservation.getNotes());
        dto.setCreatedAt(reservation.getCreatedAt());
        return dto;
    }
}
