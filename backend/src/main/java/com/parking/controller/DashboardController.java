package com.parking.controller;

import com.parking.dto.response.*;
import com.parking.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardStats()));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<ApiResponse<OccupancyStatsDto>> getOccupancy() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getOccupancyStats()));
    }

    @GetMapping("/traffic")
    public ResponseEntity<ApiResponse<List<DailyTrafficDto>>> getDailyTraffic() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDailyTraffic()));
    }

    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<ActivityDto>>> getRecentActivities() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRecentActivities()));
    }
}
