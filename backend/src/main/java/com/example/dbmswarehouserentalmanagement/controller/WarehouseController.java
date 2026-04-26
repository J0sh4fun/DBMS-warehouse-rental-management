package com.example.dbmswarehouserentalmanagement.controller;

import com.example.dbmswarehouserentalmanagement.dto.request.WarehouseRequest;
import com.example.dbmswarehouserentalmanagement.dto.response.WarehouseResponse;
import com.example.dbmswarehouserentalmanagement.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/warehouses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    public ResponseEntity<WarehouseResponse> createWarehouse(@Valid @RequestBody WarehouseRequest request,
                                                             Principal principal) {
        WarehouseResponse response = warehouseService.createWarehouse(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<WarehouseResponse>> getWarehouses(Principal principal) {
        return ResponseEntity.ok(warehouseService.getWarehousesByCurrentAdmin(principal.getName()));
    }

    @GetMapping("/{warehouseId}")
    public ResponseEntity<WarehouseResponse> getWarehouseById(@PathVariable Integer warehouseId,
                                                              Principal principal) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(warehouseId, principal.getName()));
    }

    @PutMapping("/{warehouseId}")
    public ResponseEntity<WarehouseResponse> updateWarehouse(@PathVariable Integer warehouseId,
                                                             @Valid @RequestBody WarehouseRequest request,
                                                             Principal principal) {
        WarehouseResponse response = warehouseService.updateWarehouse(warehouseId, request, principal.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{warehouseId}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Integer warehouseId,
                                                Principal principal) {
        warehouseService.deleteWarehouse(warehouseId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}

