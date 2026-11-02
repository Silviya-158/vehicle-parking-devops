package com.parking.entity;

import com.parking.entity.enums.SlotStatus;
import com.parking.entity.enums.VehicleType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_slots")
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_number", nullable = false, unique = true, length = 20)
    private String slotNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SlotStatus status = SlotStatus.AVAILABLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_type", nullable = false, length = 20)
    private VehicleType slotType = VehicleType.CAR;

    @Column(nullable = false, length = 30)
    private String floor = "Ground Floor";

    @Column(nullable = false, length = 30)
    private String zone = "Zone A";

    @Column(name = "hourly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate = new BigDecimal("5.00");

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ParkingSlot() {
    }

    public ParkingSlot(String slotNumber, SlotStatus status, VehicleType slotType, String floor, String zone, BigDecimal hourlyRate) {
        this.slotNumber = slotNumber;
        this.status = status;
        this.slotType = slotType;
        this.floor = floor;
        this.zone = zone;
        this.hourlyRate = hourlyRate;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
