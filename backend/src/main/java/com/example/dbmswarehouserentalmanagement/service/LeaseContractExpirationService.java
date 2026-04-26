package com.example.dbmswarehouserentalmanagement.service;

import com.example.dbmswarehouserentalmanagement.entity.enums.LeaseContractStatus;
import com.example.dbmswarehouserentalmanagement.repository.LeaseContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaseContractExpirationService {

    private static final List<LeaseContractStatus> EXPIRABLE_STATUSES = List.of(
            LeaseContractStatus.Pending,
            LeaseContractStatus.Active
    );

    private final LeaseContractRepository leaseContractRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int expireOverdueContracts() {
        return expireOverdueContracts(LocalDate.now());
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void expireOverdueContractsOnStartup() {
        expireOverdueContracts(LocalDate.now());
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void expireOverdueContractsDaily() {
        expireOverdueContracts(LocalDate.now());
    }

    private int expireOverdueContracts(LocalDate today) {
        return leaseContractRepository.expireOverdueContracts(
                today,
                LeaseContractStatus.Expired,
                EXPIRABLE_STATUSES
        );
    }
}
