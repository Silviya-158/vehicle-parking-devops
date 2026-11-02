package com.parking.controller;

import com.parking.dto.request.CreateUserRequest;
import com.parking.dto.request.UpdateUserRequest;
import com.parking.dto.response.ApiResponse;
import com.parking.dto.response.UserDto;
import com.parking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        UserDto updated = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable Long id) {
        UserDto updated = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status toggled successfully", updated));
    }
}
