package com.parking.dto.response;

import java.util.List;
import java.util.Map;

public class OccupancyStatsDto {
    private Map<String, Long> statusDistribution;
    private Map<String, Long> vehicleTypeDistribution;
    private List<Map<String, Object>> zoneOccupancy;

    public OccupancyStatsDto() {
    }

    public OccupancyStatsDto(Map<String, Long> statusDistribution, Map<String, Long> vehicleTypeDistribution, List<Map<String, Object>> zoneOccupancy) {
        this.statusDistribution = statusDistribution;
        this.vehicleTypeDistribution = vehicleTypeDistribution;
        this.zoneOccupancy = zoneOccupancy;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public Map<String, Long> getVehicleTypeDistribution() {
        return vehicleTypeDistribution;
    }

    public void setVehicleTypeDistribution(Map<String, Long> vehicleTypeDistribution) {
        this.vehicleTypeDistribution = vehicleTypeDistribution;
    }

    public List<Map<String, Object>> getZoneOccupancy() {
        return zoneOccupancy;
    }

    public void setZoneOccupancy(List<Map<String, Object>> zoneOccupancy) {
        this.zoneOccupancy = zoneOccupancy;
    }
}
