package com.example.dbmswarehouserentalmanagement.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class OutboundIssueDetailId implements Serializable {

    @Column(name = "IssueId", nullable = false)
    private Integer issueId;

    @Column(name = "ProductId", nullable = false)
    private Integer productId;

    @Column(name = "BatchNo", nullable = false, length = 100)
    private String batchNo;
}

