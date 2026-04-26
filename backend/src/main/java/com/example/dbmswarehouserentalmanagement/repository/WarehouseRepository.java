package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {

    List<Warehouse> findByAdminAdminIdOrderByWarehouseIdDesc(Integer adminId);

    Optional<Warehouse> findByWarehouseIdAndAdminAdminId(Integer warehouseId, Integer adminId);
}
