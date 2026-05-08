package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.repository.DbmsJdbcRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeaseContractExpirationService {

    private final DbmsJdbcRepository dbmsJdbcRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int expireOverdueContracts() {
        return dbmsJdbcRepository.expireOverdueContracts();
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void expireOverdueContractsDaily() {
        dbmsJdbcRepository.expireOverdueContracts();
    }
}
