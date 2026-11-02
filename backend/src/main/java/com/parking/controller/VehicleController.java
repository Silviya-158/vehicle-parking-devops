package com.parking.controller;

import com.parking.dto.request.VehicleEntryRequest;
import com.parking.dto.request.VehicleExitRequest;
import com.parking.dto.response.ApiResponse;
import com.parking.dto.response.ParkingRecordDto;
import com.parking.entity.enums.ParkingRecordStatus;
import com.parking.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping("/entry")
    public ResponseEntity<ApiResponse<ParkingRecordDto>> parkVehicle(@Valid @RequestBody VehicleEntryRequest request) {
        ParkingRecordDto record = vehicleService.parkVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle entry recorded successfully. Slot " + record.getSlotNumber() + " assigned.", record));
    }

    @PutMapping("/exit")
    public ResponseEntity<ApiResponse<ParkingRecordDto>> exitVehicle(@RequestBody VehicleExitRequest request) {
        ParkingRecordDto record = vehicleService.exitVehicle(request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle exit processed successfully. Slot " + record.getSlotNumber() + " released.", record));
    }

    @PutMapping("/{id}/exit")
    public ResponseEntity<ApiResponse<ParkingRecordDto>> exitVehicleById(
            @PathVariable Long id,
            @RequestBody(required = false) VehicleExitRequest request) {
        if (request == null) {
            request = new VehicleExitRequest();
        }
        request.setRecordId(id);
        ParkingRecordDto record = vehicleService.exitVehicle(request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle exit processed successfully. Slot " + record.getSlotNumber() + " released.", record));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<List<ParkingRecordDto>>> getCurrentParkedVehicles(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getCurrentParkedVehicles(search)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<ParkingRecordDto>>> getParkingHistory(
            @RequestParam(required = false) ParkingRecordStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String timeRange,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("entryTime").descending());
        return ResponseEntity.ok(ApiResponse.success(vehicleService.getParkingHistory(status, search, timeRange, pageRequest)));
    }
}
