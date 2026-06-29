package com.farmgearconnect.dto.request;

import com.farmgearconnect.entity.Equipment;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Partial-update payload for PATCH /owner/equipment/{id}.
 * Only the fields the owner can change without re-submitting for admin approval:
 * prices, deposit, and operational availability status.
 *
 * All fields are nullable — only non-null values will be applied.
 */
@Data
public class EquipmentPatchRequest {

    /** Daily rental price. */
    private BigDecimal pricePerDay;

    /** Hourly rental price. */
    private BigDecimal pricePerHour;

    /** Security deposit amount. */
    private BigDecimal depositAmount;

    /**
     * Operational availability status:
     * AVAILABLE | IN_USE | UNDER_MAINTENANCE | UNAVAILABLE
     */
    private Equipment.AvailabilityStatus availabilityStatus;
}
