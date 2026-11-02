package com.parking.service;

import com.parking.dto.response.ActivityDto;
import com.parking.dto.response.DailyTrafficDto;
import com.parking.dto.response.DashboardStatsDto;
import com.parking.dto.response.OccupancyStatsDto;
import com.parking.entity.ParkingRecord;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.enums.ParkingRecordStatus;
import com.parking.entity.enums.SlotStatus;
import com.parking.entity.enums.VehicleType;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ParkingSlotRepository slotRepository;
    private final ParkingRecordRepository recordRepository;
    private final ReservationRepository reservationRepository;

    public DashboardService(ParkingSlotRepository slotRepository,
                            ParkingRecordRepository recordRepository,
                            ReservationRepository reservationRepository) {
        this.slotRepository = slotRepository;
        this.recordRepository = recordRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalSlots = slotRepository.count();
        long availableSlots = slotRepository.countByStatus(SlotStatus.AVAILABLE);
        long occupiedSlots = slotRepository.countByStatus(SlotStatus.OCCUPIED);
        long reservedSlots = slotRepository.countByStatus(SlotStatus.RESERVED);

        long currentlyParked = recordRepository.countByStatus(ParkingRecordStatus.PARKED);

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(23, 59, 59);

        long todayEntries = recordRepository.countTodayEntries(startOfToday, endOfToday);
        long todayExits = recordRepository.countTodayExits(startOfToday, endOfToday);

        double occupancyPercentage = 0.0;
        if (totalSlots > 0) {
            occupancyPercentage = BigDecimal.valueOf((double) occupiedSlots / totalSlots * 100.0)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return new DashboardStatsDto(
                totalSlots,
                availableSlots,
                occupiedSlots,
                reservedSlots,
                currentlyParked,
                todayEntries,
                todayExits,
                occupancyPercentage
        );
    }

    @Transactional(readOnly = true)
    public OccupancyStatsDto getOccupancyStats() {
        // Status distribution
        Map<String, Long> statusDistribution = new LinkedHashMap<>();
        statusDistribution.put("AVAILABLE", slotRepository.countByStatus(SlotStatus.AVAILABLE));
        statusDistribution.put("OCCUPIED", slotRepository.countByStatus(SlotStatus.OCCUPIED));
        statusDistribution.put("RESERVED", slotRepository.countByStatus(SlotStatus.RESERVED));

        // Vehicle type distribution of currently parked vehicles
        List<ParkingRecord> parkedVehicles = recordRepository.findByStatus(ParkingRecordStatus.PARKED);
        Map<String, Long> vehicleTypeDistribution = new LinkedHashMap<>();
        for (VehicleType type : VehicleType.values()) {
            vehicleTypeDistribution.put(type.name(), 0L);
        }
        for (ParkingRecord rec : parkedVehicles) {
            String typeName = rec.getVehicleType().name();
            vehicleTypeDistribution.put(typeName, vehicleTypeDistribution.getOrDefault(typeName, 0L) + 1);
        }

        // Zone-wise breakdown
        List<ParkingSlot> allSlots = slotRepository.findAll();
        Map<String, List<ParkingSlot>> byZone = allSlots.stream()
                .collect(Collectors.groupingBy(ParkingSlot::getZone));

        List<Map<String, Object>> zoneOccupancy = new ArrayList<>();
        for (Map.Entry<String, List<ParkingSlot>> entry : byZone.entrySet()) {
            String zoneName = entry.getKey();
            List<ParkingSlot> zoneSlots = entry.getValue();
            long total = zoneSlots.size();
            long occupied = zoneSlots.stream().filter(s -> s.getStatus() == SlotStatus.OCCUPIED).count();
            long available = zoneSlots.stream().filter(s -> s.getStatus() == SlotStatus.AVAILABLE).count();
            long reserved = zoneSlots.stream().filter(s -> s.getStatus() == SlotStatus.RESERVED).count();

            Map<String, Object> zData = new HashMap<>();
            zData.put("zone", zoneName);
            zData.put("total", total);
            zData.put("occupied", occupied);
            zData.put("available", available);
            zData.put("reserved", reserved);
            double rate = total > 0 ? (double) occupied / total * 100.0 : 0.0;
            zData.put("occupancyRate", BigDecimal.valueOf(rate).setScale(1, RoundingMode.HALF_UP).doubleValue());
            zoneOccupancy.add(zData);
        }

        return new OccupancyStatsDto(statusDistribution, vehicleTypeDistribution, zoneOccupancy);
    }

    @Transactional(readOnly = true)
    public List<DailyTrafficDto> getDailyTraffic() {
        List<DailyTrafficDto> trafficList = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM dd");

        List<ParkingRecord> records = recordRepository.findRecordsSince(today.minusDays(6).atStartOfDay());

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(23, 59, 59);

            long entries = records.stream()
                    .filter(r -> r.getEntryTime() != null && !r.getEntryTime().isBefore(dayStart) && !r.getEntryTime().isAfter(dayEnd))
                    .count();

            long exits = records.stream()
                    .filter(r -> r.getExitTime() != null && !r.getExitTime().isBefore(dayStart) && !r.getExitTime().isAfter(dayEnd))
                    .count();

            trafficList.add(new DailyTrafficDto(
                    date.format(dateFormatter),
                    date.format(dayFormatter),
                    entries,
                    exits
            ));
        }

        return trafficList;
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getRecentActivities() {
        List<ActivityDto> activities = new ArrayList<>();

        // Add recent 6 parking records
        List<ParkingRecord> recentRecords = recordRepository.findTop10ByOrderByCreatedAtDesc();
        for (ParkingRecord r : recentRecords) {
            if (r.getStatus() == ParkingRecordStatus.PARKED) {
                activities.add(new ActivityDto(
                        "entry-" + r.getId(),
                        "ENTRY",
                        "Vehicle Checked In",
                        r.getVehicleNumber() + " (" + r.getVehicleType() + ") parked in " + r.getSlot().getSlotNumber() + " by " + r.getDriverName(),
                        r.getEntryTime(),
                        "blue"
                ));
            } else if (r.getStatus() == ParkingRecordStatus.COMPLETED && r.getExitTime() != null) {
                activities.add(new ActivityDto(
                        "exit-" + r.getId(),
                        "EXIT",
                        "Vehicle Checked Out",
                        r.getVehicleNumber() + " exited " + r.getSlot().getSlotNumber() + " • Paid $" + r.getTotalFee() + " (" + r.getPaymentMethod() + ")",
                        r.getExitTime(),
                        "emerald"
                ));
            }
        }

        // Add recent reservations
        List<Reservation> recentReservations = reservationRepository.findTop5ByOrderByCreatedAtDesc();
        for (Reservation res : recentReservations) {
            activities.add(new ActivityDto(
                    "res-" + res.getId(),
                    "RESERVATION",
                    "Slot Reserved: " + res.getSlot().getSlotNumber(),
                    "Reserved for " + res.getVehicleNumber() + " (" + res.getDriverName() + ") status: " + res.getStatus(),
                    res.getCreatedAt() != null ? res.getCreatedAt() : res.getStartTime(),
                    "amber"
            ));
        }

        return activities.stream()
                .sorted(Comparator.comparing(ActivityDto::getTimestamp).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }
}
