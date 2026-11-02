package com.parking.dto.request;

import com.parking.entity.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class VehicleEntryRequest {
    @NotBlank(message = "Vehicle registration number is required")
    @Pattern(regexp = "^[A-Z0-9 -]{4,20}$", message = "Please enter a valid vehicle registration number")
    private String vehicleNumber;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType = VehicleType.CAR;

    @NotBlank(message = "Driver name is required")
    private String driverName;

    private String phoneNumber;

    @NotNull(message = "Parking slot ID is required")
    private Long slotId;

    private Long reservationId;
    private String notes;

    public VehicleEntryRequest() {
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

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
