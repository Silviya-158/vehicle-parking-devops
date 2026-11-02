package com.parking.dto.response;

public class DashboardStatsDto {
    private long totalSlots;
    private long availableSlots;
    private long occupiedSlots;
    private long reservedSlots;
    private long totalVehiclesParked;
    private long todayEntries;
    private long todayExits;
    private double occupancyPercentage;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalSlots, long availableSlots, long occupiedSlots, long reservedSlots,
                             long totalVehiclesParked, long todayEntries, long todayExits, double occupancyPercentage) {
        this.totalSlots = totalSlots;
        this.availableSlots = availableSlots;
        this.occupiedSlots = occupiedSlots;
        this.reservedSlots = reservedSlots;
        this.totalVehiclesParked = totalVehiclesParked;
        this.todayEntries = todayEntries;
        this.todayExits = todayExits;
        this.occupancyPercentage = occupancyPercentage;
    }

    public long getTotalSlots() {
        return totalSlots;
    }

    public void setTotalSlots(long totalSlots) {
        this.totalSlots = totalSlots;
    }

    public long getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(long availableSlots) {
        this.availableSlots = availableSlots;
    }

    public long getOccupiedSlots() {
        return occupiedSlots;
    }

    public void setOccupiedSlots(long occupiedSlots) {
        this.occupiedSlots = occupiedSlots;
    }

    public long getReservedSlots() {
        return reservedSlots;
    }

    public void setReservedSlots(long reservedSlots) {
        this.reservedSlots = reservedSlots;
    }

    public long getTotalVehiclesParked() {
        return totalVehiclesParked;
    }

    public void setTotalVehiclesParked(long totalVehiclesParked) {
        this.totalVehiclesParked = totalVehiclesParked;
    }

    public long getTodayEntries() {
        return todayEntries;
    }

    public void setTodayEntries(long todayEntries) {
        this.todayEntries = todayEntries;
    }

    public long getTodayExits() {
        return todayExits;
    }

    public void setTodayExits(long todayExits) {
        this.todayExits = todayExits;
    }

    public double getOccupancyPercentage() {
        return occupancyPercentage;
    }

    public void setOccupancyPercentage(double occupancyPercentage) {
        this.occupancyPercentage = occupancyPercentage;
    }
}
