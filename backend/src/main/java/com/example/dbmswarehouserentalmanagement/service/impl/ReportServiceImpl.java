package com.example.dbmswarehouserentalmanagement.service.impl;

import com.example.dbmswarehouserentalmanagement.dto.response.ExpiringBatchResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.InventoryValueResponse;
import com.example.dbmswarehouserentalmanagement.dto.response.TopProductResponse;
import com.example.dbmswarehouserentalmanagement.repository.DbmsJdbcRepository;
import com.example.dbmswarehouserentalmanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final DbmsJdbcRepository dbmsJdbcRepository;

    @Override
    @Transactional(readOnly = true)
    public InventoryValueResponse getInventoryValue(Integer customerId) {
        return new InventoryValueResponse(dbmsJdbcRepository.findCustomerInventoryValue(customerId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpiringBatchResponse> findExpiringBatches(Integer customerId, LocalDate expiresOnOrBefore) {
        LocalDate today = LocalDate.now();
        LocalDate toDate = expiresOnOrBefore == null ? today.plusDays(30) : expiresOnOrBefore;
        if (toDate.isBefore(today)) {
            return List.of();
        }
        int daysAhead = (int) java.time.temporal.ChronoUnit.DAYS.between(today, toDate);
        return dbmsJdbcRepository.findExpiringBatches(customerId, daysAhead);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductResponse> findTopProducts(Integer customerId, YearMonth month, int limit) {
        YearMonth targetMonth = month == null ? YearMonth.now() : month;
        int safeLimit = limit <= 0 ? 10 : Math.min(limit, 100);
        return dbmsJdbcRepository.findTopProducts(
                customerId,
                targetMonth.getYear(),
                targetMonth.getMonthValue(),
                safeLimit
        );
    }
}
