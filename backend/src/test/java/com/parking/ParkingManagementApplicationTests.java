package com.parking;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("h2")
class ParkingManagementApplicationTests {

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Autowired
    private com.parking.repository.UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;

    @Test
    void contextLoads() {
        org.junit.jupiter.api.Assertions.assertNotNull(userRepository);
        org.junit.jupiter.api.Assertions.assertNotNull(passwordEncoder);
    }

    @Test
    void testAdminAndStaffAuthentication() {
        var adminAuth = authenticationManager.authenticate(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("admin", "admin123")
        );
        org.junit.jupiter.api.Assertions.assertTrue(adminAuth.isAuthenticated());

        var staffAuth = authenticationManager.authenticate(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("staff", "staff123")
        );
        org.junit.jupiter.api.Assertions.assertTrue(staffAuth.isAuthenticated());
    }
}
