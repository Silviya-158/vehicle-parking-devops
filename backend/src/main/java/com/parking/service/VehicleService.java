package com.parking.service;

import com.parking.dto.request.VehicleEntryRequest;
import com.parking.dto.request.VehicleExitRequest;
import com.parking.dto.response.ParkingRecordDto;
import com.parking.entity.ParkingRecord;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.enums.ParkingRecordStatus;
import com.parking.entity.enums.ReservationStatus;
import com.parking.entity.enums.SlotStatus;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.exception.SlotNotAvailableException;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final ParkingRecordRepository recordRepository;
    private final ParkingSlotRepository slotRepository;
    private final ReservationRepository reservationRepository;

    public VehicleService(ParkingRecordRepository recordRepository,
                          ParkingSlotRepository slotRepository,
                          ReservationRepository reservationRepository) {
        this.recordRepository = recordRepository;
        this.slotRepository = slotRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional
    public ParkingRecordDto parkVehicle(VehicleEntryRequest request) {
        String vehicleNumber = request.getVehicleNumber().trim().toUpperCase();

        // 1. Prevent duplicate entry for same vehicle if already parked
        Optional<ParkingRecord> existingParked = recordRepository
                .findFirstByVehicleNumberIgnoreCaseAndStatus(vehicleNumber, ParkingRecordStatus.PARKED);
        if (existingParked.isPresent()) {
            throw new BadRequestException("Vehicle " + vehicleNumber +
                    " is already parked in slot " + existingParked.get().getSlot().getSlotNumber() +
                    ". Must record exit first.");
        }

        // 2. Fetch slot with pessimistic write lock
        ParkingSlot slot = slotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + request.getSlotId()));

        // 3. Check slot availability
        if (slot.getStatus() == SlotStatus.OCCUPIED) {
            throw new SlotNotAvailableException("Slot " + slot.getSlotNumber() + " is already occupied");
        }

        Reservation linkedReservation = null;
        if (request.getReservationId() != null) {
            linkedReservation = reservationRepository.findById(request.getReservationId())
                    .orElse(null);
            if (linkedReservation != null) {
                linkedReservation.setStatus(ReservationStatus.CHECKED_IN);
                reservationRepository.save(linkedReservation);
            }
        } else if (slot.getStatus() == SlotStatus.RESERVED) {
            Optional<Reservation> res = reservationRepository.findFirstBySlotIdAndStatus(slot.getId(), ReservationStatus.CONFIRMED);
            if (res.isPresent()) {
                if (!res.get().getVehicleNumber().equalsIgnoreCase(vehicleNumber)) {
                    throw new SlotNotAvailableException("Slot " + slot.getSlotNumber() +
                            " is reserved for vehicle " + res.get().getVehicleNumber());
                }
                linkedReservation = res.get();
                linkedReservation.setStatus(ReservationStatus.CHECKED_IN);
                reservationRepository.save(linkedReservation);
            }
        }

        // 4. Update slot status to OCCUPIED
        slot.setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(slot);

        // 5. Create ParkingRecord
        ParkingRecord record = new ParkingRecord();
        record.setSlot(slot);
        record.setReservation(linkedReservation);
        record.setVehicleNumber(vehicleNumber);
        record.setVehicleType(request.getVehicleType());
        record.setDriverName(request.getDriverName().trim());
        record.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);
        record.setEntryTime(LocalDateTime.now());
        record.setHourlyRate(slot.getHourlyRate());
        record.setStatus(ParkingRecordStatus.PARKED);
        record.setNotes(request.getNotes());

        ParkingRecord savedRecord = recordRepository.save(record);
        return mapToDto(savedRecord);
    }

    @Transactional
    public ParkingRecordDto exitVehicle(VehicleExitRequest request) {
        ParkingRecord record;

        if (request.getRecordId() != null) {
            record = recordRepository.findById(request.getRecordId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parking record not found with id: " + request.getRecordId()));
        } else if (StringUtils.hasText(request.getVehicleNumber())) {
            String vNum = request.getVehicleNumber().trim().toUpperCase();
            record = recordRepository.findFirstByVehicleNumberIgnoreCaseAndStatus(vNum, ParkingRecordStatus.PARKED)
                    .orElseThrow(() -> new ResourceNotFoundException("No active parking record found for vehicle " + vNum));
        } else {
            throw new BadRequestException("Either vehicleNumber or recordId is required for exit");
        }

        if (record.getStatus() != ParkingRecordStatus.PARKED) {
            throw new BadRequestException("Vehicle is not currently parked (current status: " + record.getStatus() + ")");
        }

        LocalDateTime exitTime = LocalDateTime.now();
        record.setExitTime(exitTime);

        long minutes = Duration.between(record.getEntryTime(), exitTime).toMinutes();
        if (minutes < 1) {
            minutes = 1; // minimum 1 minute
        }
        record.setDurationMinutes(minutes);

        // Calculate fee: ceil(minutes / 60) * hourlyRate
        long billedHours = (long) Math.ceil(minutes / 60.0);
        if (billedHours < 1) billedHours = 1;
        BigDecimal totalFee = record.getHourlyRate().multiply(BigDecimal.valueOf(billedHours)).setScale(2, RoundingMode.HALF_UP);
        record.setTotalFee(totalFee);

        record.setPaymentMethod(StringUtils.hasText(request.getPaymentMethod()) ? request.getPaymentMethod().trim() : "CASH");
        record.setStatus(ParkingRecordStatus.COMPLETED);
        if (StringUtils.hasText(request.getNotes())) {
            record.setNotes(request.getNotes().trim());
        }

        // Release slot back to AVAILABLE
        ParkingSlot slot = record.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);

        ParkingRecord updatedRecord = recordRepository.save(record);
        return mapToDto(updatedRecord);
    }

    @Transactional(readOnly = true)
    public List<ParkingRecordDto> getCurrentParkedVehicles(String search) {
        List<ParkingRecord> parkedList = recordRepository.findByStatus(ParkingRecordStatus.PARKED);

        return parkedList.stream()
                .filter(rec -> {
                    if (StringUtils.hasText(search)) {
                        String s = search.toLowerCase();
                        boolean matchPlate = rec.getVehicleNumber().toLowerCase().contains(s);
                        boolean matchDriver = rec.getDriverName().toLowerCase().contains(s);
                        boolean matchSlot = rec.getSlot().getSlotNumber().toLowerCase().contains(s);
                        if (!matchPlate && !matchDriver && !matchSlot) return false;
                    }
                    return true;
                })
                .sorted((a, b) -> b.getEntryTime().compareTo(a.getEntryTime()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ParkingRecordDto> getParkingHistory(ParkingRecordStatus status, String search, String timeRange, Pageable pageable) {
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;

        if (StringUtils.hasText(timeRange)) {
            LocalDateTime now = LocalDateTime.now();
            switch (timeRange.toUpperCase()) {
                case "TODAY":
                    startDate = now.toLocalDate().atStartOfDay();
                    endDate = now.toLocalDate().atTime(23, 59, 59);
                    break;
                case "LAST_7_DAYS":
                    startDate = now.minusDays(7);
                    break;
                case "LAST_30_DAYS":
                    startDate = now.minusDays(30);
                    break;
                default:
                    break;
            }
        }

        String searchPattern = StringUtils.hasText(search) ? search.trim() : null;

        // Ensure sorted by entryTime desc by default
        Pageable sortedPageable = pageable;
        if (pageable.getSort().isUnsorted()) {
            sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("entryTime").descending());
        }

        Page<ParkingRecord> page = recordRepository.searchRecords(status, searchPattern, startDate, endDate, sortedPageable);
        return page.map(this::mapToDto);
    }

    public ParkingRecordDto mapToDto(ParkingRecord record) {
        ParkingRecordDto dto = new ParkingRecordDto();
        dto.setId(record.getId());
        dto.setSlotId(record.getSlot().getId());
        dto.setSlotNumber(record.getSlot().getSlotNumber());
        dto.setFloor(record.getSlot().getFloor());
        dto.setZone(record.getSlot().getZone());
        if (record.getReservation() != null) {
            dto.setReservationId(record.getReservation().getId());
        }
        dto.setVehicleNumber(record.getVehicleNumber());
        dto.setVehicleType(record.getVehicleType());
        dto.setDriverName(record.getDriverName());
        dto.setPhoneNumber(record.getPhoneNumber());
        dto.setEntryTime(record.getEntryTime());
        dto.setExitTime(record.getExitTime());
        dto.setDurationMinutes(record.getDurationMinutes());
        dto.setHourlyRate(record.getHourlyRate());
        dto.setTotalFee(record.getTotalFee());
        dto.setPaymentMethod(record.getPaymentMethod());
        dto.setStatus(record.getStatus());
        dto.setNotes(record.getNotes());
        return dto;
    }
}
