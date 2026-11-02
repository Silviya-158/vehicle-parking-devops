package com.parking.controller;

import com.parking.dto.request.LoginRequest;
import com.parking.dto.response.ApiResponse;
import com.parking.dto.response.JwtAuthResponse;
import com.parking.dto.response.UserDto;
import com.parking.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        UserDto userDto = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }
}
