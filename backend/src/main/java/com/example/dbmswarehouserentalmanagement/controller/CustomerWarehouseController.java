package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseResponse;
import com.example.dbmswarehouserentalmanagement.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/customer/warehouses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerWarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping("/available")
    public ResponseEntity<List<WarehouseResponse>> findAvailable(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(warehouseService.findAvailableForCustomers(startDate, endDate));
    }
}
