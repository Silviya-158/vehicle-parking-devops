package com.parking.entity;

import com.parking.entity.enums.ParkingRecordStatus;
import com.parking.entity.enums.VehicleType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_records")
public class ParkingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "slot_id", nullable = false)
    private ParkingSlot slot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(name = "vehicle_number", nullable = false, length = 30)
    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 20)
    private VehicleType vehicleType = VehicleType.CAR;

    @Column(name = "driver_name", nullable = false, length = 100)
    private String driverName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "entry_time", nullable = false)
    private LocalDateTime entryTime;

    @Column(name = "exit_time")
    private LocalDateTime exitTime;

    @Column(name = "duration_minutes")
    private Long durationMinutes = 0L;

    @Column(name = "hourly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate = new BigDecimal("5.00");

    @Column(name = "total_fee", precision = 10, scale = 2)
    private BigDecimal totalFee = BigDecimal.ZERO;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod = "CASH";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ParkingRecordStatus status = ParkingRecordStatus.PARKED;

    @Column(length = 255)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ParkingRecord() {
    }

    public ParkingRecord(ParkingSlot slot, String vehicleNumber, VehicleType vehicleType, String driverName, String phoneNumber, LocalDateTime entryTime, BigDecimal hourlyRate) {
        this.slot = slot;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
        this.driverName = driverName;
        this.phoneNumber = phoneNumber;
        this.entryTime = entryTime;
        this.hourlyRate = hourlyRate;
        this.status = ParkingRecordStatus.PARKED;
    }

    @PrePersist
    protected void onCreate() {
        if (this.entryTime == null) {
            this.entryTime = LocalDateTime.now();
        }
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

    public ParkingSlot getSlot() {
        return slot;
    }

    public void setSlot(ParkingSlot slot) {
        this.slot = slot;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }

    public LocalDateTime getExitTime() {
        return exitTime;
    }

    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
    }

    public Long getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Long durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getTotalFee() {
        return totalFee;
    }

    public void setTotalFee(BigDecimal totalFee) {
        this.totalFee = totalFee;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public ParkingRecordStatus getStatus() {
        return status;
    }

    public void setStatus(ParkingRecordStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
