package com.parking.config;

import com.parking.entity.ParkingRecord;
import com.parking.entity.ParkingSlot;
import com.parking.entity.Reservation;
import com.parking.entity.User;
import com.parking.entity.enums.*;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ParkingSlotRepository slotRepository;
    private final ReservationRepository reservationRepository;
    private final ParkingRecordRepository recordRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ParkingSlotRepository slotRepository,
                           ReservationRepository reservationRepository,
                           ParkingRecordRepository recordRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.slotRepository = slotRepository;
        this.reservationRepository = reservationRepository;
        this.recordRepository = recordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initUsers();
        initParkingSlotsAndRecords();
    }

    private void initUsers() {
        createOrUpdateDefaultUser("admin", "admin123", "System Administrator", "admin@parkflow.io", Role.ADMIN);
        createOrUpdateDefaultUser("staff", "staff123", "Sarah Jenkins", "sarah.staff@parkflow.io", Role.STAFF);
    }

    private void createOrUpdateDefaultUser(String username, String rawPassword, String fullName, String email, Role role) {
        userRepository.findByUsername(username).ifPresentOrElse(
                user -> {
                    boolean matches = false;
                    try {
                        matches = passwordEncoder.matches(rawPassword, user.getPassword());
                    } catch (Exception e) {
                        matches = false;
                    }
                    if (!matches) {
                        user.setPassword(passwordEncoder.encode(rawPassword));
                        user.setActive(true);
                        userRepository.save(user);
                        System.out.println(">>> Updated password with valid BCrypt hash for user: " + username);
                    }
                },
                () -> {
                    User newUser = new User(
                            username,
                            passwordEncoder.encode(rawPassword),
                            fullName,
                            email,
                            role,
                            true
                    );
                    userRepository.save(newUser);
                    System.out.println(">>> Seeded default user: " + username);
                }
        );
    }

    private void initParkingSlotsAndRecords() {
        if (slotRepository.count() == 0) {
            // Ground Floor - Zone A (Cars)
            ParkingSlot a01 = slotRepository.save(new ParkingSlot("A-01", SlotStatus.OCCUPIED, VehicleType.CAR, "Ground Floor", "Zone A", new BigDecimal("5.00")));
            ParkingSlot a02 = slotRepository.save(new ParkingSlot("A-02", SlotStatus.AVAILABLE, VehicleType.CAR, "Ground Floor", "Zone A", new BigDecimal("5.00")));
            ParkingSlot a03 = slotRepository.save(new ParkingSlot("A-03", SlotStatus.AVAILABLE, VehicleType.CAR, "Ground Floor", "Zone A", new BigDecimal("5.00")));
            ParkingSlot a04 = slotRepository.save(new ParkingSlot("A-04", SlotStatus.RESERVED, VehicleType.CAR, "Ground Floor", "Zone A", new BigDecimal("5.00")));
            ParkingSlot a05 = slotRepository.save(new ParkingSlot("A-05", SlotStatus.OCCUPIED, VehicleType.CAR, "Ground Floor", "Zone A", new BigDecimal("5.00")));
            ParkingSlot a06 = slotRepository.save(new ParkingSlot("A-06", SlotStatus.AVAILABLE, VehicleType.CAR, "Ground Floor", "Zone A", new BigDecimal("5.00")));

            // Ground Floor - Zone B (Bikes)
            ParkingSlot b01 = slotRepository.save(new ParkingSlot("B-01", SlotStatus.OCCUPIED, VehicleType.BIKE, "Ground Floor", "Zone B", new BigDecimal("2.50")));
            ParkingSlot b02 = slotRepository.save(new ParkingSlot("B-02", SlotStatus.AVAILABLE, VehicleType.BIKE, "Ground Floor", "Zone B", new BigDecimal("2.50")));
            ParkingSlot b03 = slotRepository.save(new ParkingSlot("B-03", SlotStatus.AVAILABLE, VehicleType.BIKE, "Ground Floor", "Zone B", new BigDecimal("2.50")));
            ParkingSlot b04 = slotRepository.save(new ParkingSlot("B-04", SlotStatus.AVAILABLE, VehicleType.BIKE, "Ground Floor", "Zone B", new BigDecimal("2.50")));

            // Level 1 - Zone C (EV Charging & Standard Cars)
            ParkingSlot c01 = slotRepository.save(new ParkingSlot("C-01", SlotStatus.OCCUPIED, VehicleType.EV, "Level 1", "Zone C (EV)", new BigDecimal("7.50")));
            ParkingSlot c02 = slotRepository.save(new ParkingSlot("C-02", SlotStatus.AVAILABLE, VehicleType.EV, "Level 1", "Zone C (EV)", new BigDecimal("7.50")));
            ParkingSlot c03 = slotRepository.save(new ParkingSlot("C-03", SlotStatus.RESERVED, VehicleType.EV, "Level 1", "Zone C (EV)", new BigDecimal("7.50")));
            ParkingSlot c04 = slotRepository.save(new ParkingSlot("C-04", SlotStatus.AVAILABLE, VehicleType.CAR, "Level 1", "Zone C", new BigDecimal("5.00")));
            ParkingSlot c05 = slotRepository.save(new ParkingSlot("C-05", SlotStatus.AVAILABLE, VehicleType.CAR, "Level 1", "Zone C", new BigDecimal("5.00")));
            ParkingSlot c06 = slotRepository.save(new ParkingSlot("C-06", SlotStatus.AVAILABLE, VehicleType.CAR, "Level 1", "Zone C", new BigDecimal("5.00")));

            // Basement - VIP Zone
            ParkingSlot v01 = slotRepository.save(new ParkingSlot("V-01", SlotStatus.OCCUPIED, VehicleType.CAR, "Basement", "VIP Zone", new BigDecimal("10.00")));
            ParkingSlot v02 = slotRepository.save(new ParkingSlot("V-02", SlotStatus.AVAILABLE, VehicleType.CAR, "Basement", "VIP Zone", new BigDecimal("10.00")));

            // Seed active reservations
            reservationRepository.save(new Reservation(
                    a04,
                    "KA-05-MJ-4412",
                    VehicleType.CAR,
                    "Robert Langdon",
                    "+1-555-0192",
                    LocalDateTime.now().plusHours(1),
                    LocalDateTime.now().plusHours(5),
                    ReservationStatus.CONFIRMED,
                    "Client board meeting at HQ"
            ));

            reservationRepository.save(new Reservation(
                    c03,
                    "DL-01-EV-9820",
                    VehicleType.EV,
                    "Dr. Evelyn Reed",
                    "+1-555-0144",
                    LocalDateTime.now().plusMinutes(30),
                    LocalDateTime.now().plusHours(4),
                    ReservationStatus.CONFIRMED,
                    "Requires level 2 fast charging"
            ));

            // Seed active parked vehicles
            ParkingRecord pr1 = new ParkingRecord(a01, "MH-02-CB-1029", VehicleType.CAR, "David Miller", "+1-555-0101", LocalDateTime.now().minusHours(3).minusMinutes(15), new BigDecimal("5.00"));
            pr1.setNotes("Visitor pass #A01");
            recordRepository.save(pr1);

            ParkingRecord pr2 = new ParkingRecord(a05, "KA-01-EQ-7788", VehicleType.CAR, "Priya Sharma", "+1-555-0102", LocalDateTime.now().minusHours(1).minusMinutes(45), new BigDecimal("5.00"));
            pr2.setNotes("Staff regular slot");
            recordRepository.save(pr2);

            ParkingRecord pr3 = new ParkingRecord(b01, "MH-12-BK-5521", VehicleType.BIKE, "Alex Morgan", "+1-555-0103", LocalDateTime.now().minusHours(4).minusMinutes(20), new BigDecimal("2.50"));
            pr3.setNotes("Courier delivery batch");
            recordRepository.save(pr3);

            ParkingRecord pr4 = new ParkingRecord(c01, "KA-03-EV-3301", VehicleType.EV, "Michael Chang", "+1-555-0104", LocalDateTime.now().minusHours(2).minusMinutes(10), new BigDecimal("7.50"));
            pr4.setNotes("Tesla Model 3 fast charge");
            recordRepository.save(pr4);

            ParkingRecord pr5 = new ParkingRecord(v01, "MH-01-VP-0007", VehicleType.CAR, "Sophia Loren", "+1-555-0105", LocalDateTime.now().minusHours(5).minusMinutes(50), new BigDecimal("10.00"));
            pr5.setNotes("Executive VIP visitor");
            recordRepository.save(pr5);

            // Seed completed records for history and dashboard analytics
            seedHistoricalRecord(a02, "KA-04-TR-1199", VehicleType.CAR, "James Wilson", "+1-555-0201", 1, 4, 1, 180, "15.00", "CARD");
            seedHistoricalRecord(a03, "DL-03-XY-8844", VehicleType.CAR, "Anita Desai", "+1-555-0202", 1, 6, 3, 180, "15.00", "UPI");
            seedHistoricalRecord(b02, "MH-04-BK-4422", VehicleType.BIKE, "Kevin Peterson", "+1-555-0203", 2, 3, 1, 120, "5.00", "CASH");
            seedHistoricalRecord(c02, "KA-02-EV-9090", VehicleType.EV, "Vikram Seth", "+1-555-0204", 2, 7, 4, 180, "22.50", "CARD");
            seedHistoricalRecord(a01, "MH-02-AA-9988", VehicleType.CAR, "Lisa Kudrow", "+1-555-0205", 3, 5, 2, 180, "15.00", "CARD");
            seedHistoricalRecord(a06, "KA-01-BB-3322", VehicleType.CAR, "Carlos Santana", "+1-555-0206", 4, 8, 3, 300, "25.00", "CASH");
            seedHistoricalRecord(b03, "MH-14-BK-8811", VehicleType.BIKE, "Rohan Mehta", "+1-555-0207", 5, 4, 2, 120, "5.00", "UPI");

            System.out.println(">>> Seeded parking slots, reservations, and history records");
        }
    }

    private void seedHistoricalRecord(ParkingSlot slot, String plate, VehicleType type, String driver, String phone,
                                      int daysAgo, int entryHoursAgo, int exitHoursAgo, long durationMin, String fee, String payment) {
        ParkingRecord r = new ParkingRecord();
        r.setSlot(slot);
        r.setVehicleNumber(plate);
        r.setVehicleType(type);
        r.setDriverName(driver);
        r.setPhoneNumber(phone);
        r.setEntryTime(LocalDateTime.now().minusDays(daysAgo).minusHours(entryHoursAgo));
        r.setExitTime(LocalDateTime.now().minusDays(daysAgo).minusHours(exitHoursAgo));
        r.setDurationMinutes(durationMin);
        r.setHourlyRate(slot.getHourlyRate());
        r.setTotalFee(new BigDecimal(fee));
        r.setPaymentMethod(payment);
        r.setStatus(ParkingRecordStatus.COMPLETED);
        recordRepository.save(r);
    }
}
