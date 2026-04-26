package com.example.dbmswarehouserentalmanagement.repository;

import com.example.dbmswarehouserentalmanagement.entity.LeaseContract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaseContractRepository extends JpaRepository<LeaseContract, Integer> {

    List<LeaseContract> findByWarehouse_WarehouseId(Integer warehouseId);

    List<LeaseContract> findByCustomer_CustomerId(Integer customerId);

    List<LeaseContract> findByWarehouse_Admin_AdminId(Integer adminId);

    Optional<LeaseContract> findByContractIdAndWarehouse_Admin_AdminId(Integer contractId, Integer adminId);
}

