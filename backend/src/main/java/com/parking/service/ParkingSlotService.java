package com.parking.service;

import com.parking.dto.request.CreateSlotRequest;
import com.parking.dto.request.UpdateSlotRequest;
import com.parking.dto.response.ParkingSlotDto;
import com.parking.entity.ParkingRecord;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.enums.ParkingRecordStatus;
import com.parking.entity.enums.ReservationStatus;
import com.parking.entity.enums.SlotStatus;
import com.parking.entity.enums.VehicleType;
import com.parking.exception.BadRequestException;
import com.parking.exception.ResourceNotFoundException;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ParkingSlotService {

    private final ParkingSlotRepository slotRepository;
    private final ParkingRecordRepository recordRepository;
    private final ReservationRepository reservationRepository;

    public ParkingSlotService(ParkingSlotRepository slotRepository,
                              ParkingRecordRepository recordRepository,
                              ReservationRepository reservationRepository) {
        this.slotRepository = slotRepository;
        this.recordRepository = recordRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<ParkingSlotDto> getAllSlots(String status, String slotType, String floor, String zone, String search) {
        List<ParkingSlot> slots = slotRepository.findAll();

        return slots.stream()
                .filter(slot -> {
                    if (StringUtils.hasText(status) && !status.equalsIgnoreCase("ALL")) {
                        if (!slot.getStatus().name().equalsIgnoreCase(status)) return false;
                    }
                    if (StringUtils.hasText(slotType) && !slotType.equalsIgnoreCase("ALL")) {
                        if (!slot.getSlotType().name().equalsIgnoreCase(slotType)) return false;
                    }
                    if (StringUtils.hasText(floor) && !floor.equalsIgnoreCase("ALL")) {
                        if (!slot.getFloor().equalsIgnoreCase(floor)) return false;
                    }
                    if (StringUtils.hasText(zone) && !zone.equalsIgnoreCase("ALL")) {
                        if (!slot.getZone().equalsIgnoreCase(zone)) return false;
                    }
                    if (StringUtils.hasText(search)) {
                        String s = search.toLowerCase();
                        boolean matchSlot = slot.getSlotNumber().toLowerCase().contains(s);
                        boolean matchZone = slot.getZone().toLowerCase().contains(s);
                        boolean matchFloor = slot.getFloor().toLowerCase().contains(s);
                        if (!matchSlot && !matchZone && !matchFloor) return false;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(ParkingSlot::getSlotNumber))
                .map(this::mapToDtoWithOccupant)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ParkingSlotDto> getAvailableSlots(VehicleType slotType) {
        List<ParkingSlot> slots;
        if (slotType != null) {
            slots = slotRepository.findByStatusAndSlotType(SlotStatus.AVAILABLE, slotType);
        } else {
            slots = slotRepository.findByStatus(SlotStatus.AVAILABLE);
        }

        return slots.stream()
                .sorted(Comparator.comparing(ParkingSlot::getSlotNumber))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParkingSlotDto getSlotById(Long id) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));
        return mapToDtoWithOccupant(slot);
    }

    @Transactional
    public ParkingSlotDto createSlot(CreateSlotRequest request) {
        String slotNum = request.getSlotNumber().trim().toUpperCase();
        if (slotRepository.existsBySlotNumberIgnoreCase(slotNum)) {
            throw new BadRequestException("Slot number " + slotNum + " already exists");
        }

        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(slotNum);
        slot.setSlotType(request.getSlotType());
        slot.setFloor(request.getFloor().trim());
        slot.setZone(request.getZone().trim());
        slot.setHourlyRate(request.getHourlyRate());
        slot.setStatus(request.getStatus() != null ? request.getStatus() : SlotStatus.AVAILABLE);

        ParkingSlot savedSlot = slotRepository.save(slot);
        return mapToDto(savedSlot);
    }

    @Transactional
    public ParkingSlotDto updateSlot(Long id, UpdateSlotRequest request) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));

        String newSlotNum = request.getSlotNumber().trim().toUpperCase();
        if (!slot.getSlotNumber().equalsIgnoreCase(newSlotNum) &&
                slotRepository.existsBySlotNumberIgnoreCase(newSlotNum)) {
            throw new BadRequestException("Slot number " + newSlotNum + " already exists");
        }

        // Prevent setting to AVAILABLE if currently actively parked
        if (request.getStatus() == SlotStatus.AVAILABLE && slot.getStatus() == SlotStatus.OCCUPIED) {
            Optional<ParkingRecord> activeRecord = recordRepository.findFirstBySlotIdAndStatus(id, ParkingRecordStatus.PARKED);
            if (activeRecord.isPresent()) {
                throw new BadRequestException("Cannot set slot to AVAILABLE while vehicle " +
                        activeRecord.get().getVehicleNumber() + " is currently parked in it");
            }
        }

        slot.setSlotNumber(newSlotNum);
        slot.setStatus(request.getStatus());
        slot.setSlotType(request.getSlotType());
        slot.setFloor(request.getFloor().trim());
        slot.setZone(request.getZone().trim());
        slot.setHourlyRate(request.getHourlyRate());

        return mapToDtoWithOccupant(slotRepository.save(slot));
    }

    @Transactional
    public void deleteSlot(Long id) {
        ParkingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));

        if (slot.getStatus() == SlotStatus.OCCUPIED) {
            throw new BadRequestException("Cannot delete slot " + slot.getSlotNumber() + " because it is currently OCCUPIED");
        }

        if (slot.getStatus() == SlotStatus.RESERVED) {
            throw new BadRequestException("Cannot delete slot " + slot.getSlotNumber() + " because it has an active RESERVATION");
        }

        // Check if there are active parked records
        Optional<ParkingRecord> activeRecord = recordRepository.findFirstBySlotIdAndStatus(id, ParkingRecordStatus.PARKED);
        if (activeRecord.isPresent()) {
            throw new BadRequestException("Cannot delete slot with active parked vehicle: " + activeRecord.get().getVehicleNumber());
        }

        slotRepository.delete(slot);
    }

    @Transactional(readOnly = true)
    public Map<String, List<String>> getFloorsAndZones() {
        Map<String, List<String>> map = new HashMap<>();
        map.put("floors", slotRepository.findDistinctFloors());
        map.put("zones", slotRepository.findDistinctZones());
        return map;
    }

    public ParkingSlotDto mapToDto(ParkingSlot slot) {
        ParkingSlotDto dto = new ParkingSlotDto();
        dto.setId(slot.getId());
        dto.setSlotNumber(slot.getSlotNumber());
        dto.setStatus(slot.getStatus());
        dto.setSlotType(slot.getSlotType());
        dto.setFloor(slot.getFloor());
        dto.setZone(slot.getZone());
        dto.setHourlyRate(slot.getHourlyRate());
        return dto;
    }

    public ParkingSlotDto mapToDtoWithOccupant(ParkingSlot slot) {
        ParkingSlotDto dto = mapToDto(slot);

        if (slot.getStatus() == SlotStatus.OCCUPIED) {
            recordRepository.findFirstBySlotIdAndStatus(slot.getId(), ParkingRecordStatus.PARKED)
                    .ifPresent(record -> {
                        dto.setCurrentVehicleNumber(record.getVehicleNumber());
                        dto.setCurrentDriverName(record.getDriverName());
                        dto.setCurrentEntryTime(record.getEntryTime());
                        dto.setActiveParkingRecordId(record.getId());
                    });
        } else if (slot.getStatus() == SlotStatus.RESERVED) {
            reservationRepository.findFirstBySlotIdAndStatus(slot.getId(), ReservationStatus.CONFIRMED)
                    .ifPresent(res -> {
                        dto.setCurrentVehicleNumber(res.getVehicleNumber());
                        dto.setCurrentDriverName(res.getDriverName());
                        dto.setActiveReservationId(res.getId());
                    });
        }

        return dto;
    }
}
