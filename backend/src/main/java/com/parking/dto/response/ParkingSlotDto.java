package com.parking.dto.response;

import com.parking.entity.enums.SlotStatus;
import com.parking.entity.enums.VehicleType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ParkingSlotDto {
    private Long id;
    private String slotNumber;
    private SlotStatus status;
    private VehicleType slotType;
    private String floor;
    private String zone;
    private BigDecimal hourlyRate;
    private String currentVehicleNumber;
    private String currentDriverName;
    private LocalDateTime currentEntryTime;
    private Long activeParkingRecordId;
    private Long activeReservationId;

    public ParkingSlotDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
    }

    public VehicleType getSlotType() {
        return slotType;
    }

    public void setSlotType(VehicleType slotType) {
        this.slotType = slotType;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public String getCurrentVehicleNumber() {
        return currentVehicleNumber;
    }

    public void setCurrentVehicleNumber(String currentVehicleNumber) {
        this.currentVehicleNumber = currentVehicleNumber;
    }

    public String getCurrentDriverName() {
        return currentDriverName;
    }

    public void setCurrentDriverName(String currentDriverName) {
        this.currentDriverName = currentDriverName;
    }

    public LocalDateTime getCurrentEntryTime() {
        return currentEntryTime;
    }

    public void setCurrentEntryTime(LocalDateTime currentEntryTime) {
        this.currentEntryTime = currentEntryTime;
    }

    public Long getActiveParkingRecordId() {
        return activeParkingRecordId;
    }

    public void setActiveParkingRecordId(Long activeParkingRecordId) {
        this.activeParkingRecordId = activeParkingRecordId;
    }

    public Long getActiveReservationId() {
        return activeReservationId;
    }

    public void setActiveReservationId(Long activeReservationId) {
        this.activeReservationId = activeReservationId;
    }
}
