package com.parking.controller;

import com.parking.dto.request.CreateSlotRequest;
import com.parking.dto.request.UpdateSlotRequest;
import com.parking.dto.response.ApiResponse;
import com.parking.dto.response.ParkingSlotDto;
import com.parking.entity.enums.VehicleType;
import com.parking.service.ParkingSlotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
public class ParkingSlotController {

    private final ParkingSlotService slotService;

    public ParkingSlotController(ParkingSlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ParkingSlotDto>>> getAllSlots(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String slotType,
            @RequestParam(required = false) String floor,
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(slotService.getAllSlots(status, slotType, floor, zone, search)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<ParkingSlotDto>>> getAvailableSlots(
            @RequestParam(required = false) VehicleType slotType) {
        return ResponseEntity.ok(ApiResponse.success(slotService.getAvailableSlots(slotType)));
    }

    @GetMapping("/metadata")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getMetadata() {
        return ResponseEntity.ok(ApiResponse.success(slotService.getFloorsAndZones()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingSlotDto>> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(slotService.getSlotById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ParkingSlotDto>> createSlot(@Valid @RequestBody CreateSlotRequest request) {
        ParkingSlotDto created = slotService.createSlot(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Parking slot created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingSlotDto>> updateSlot(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSlotRequest request) {
        ParkingSlotDto updated = slotService.updateSlot(id, request);
        return ResponseEntity.ok(ApiResponse.success("Parking slot updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Parking slot deleted successfully", null));
    }
}
