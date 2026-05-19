package com.farmgearconnect.dto.request;

import com.farmgearconnect.entity.Equipment;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EquipmentRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be 5-200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 5, message = "Description must be at least 5 characters")
    private String description;

    @NotNull(message = "Category is required")
    private Equipment.EquipmentCategory category;

    @NotBlank(message = "Brand is required")
    private String brand;

    private Equipment.FuelType fuelType;

    private String modelNumber;

    private BigDecimal pricePerHour;

    @NotNull(message = "Price per day is required")
    @DecimalMin(value = "0.01", message = "Price per day must be greater than 0")
    private BigDecimal pricePerDay;

    private BigDecimal depositAmount;

    @Min(value = 1, message = "Minimum rental duration must be at least 1 hour")
    private Integer minRentalDurationHours;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "District is required")
    private String district;

    private String village;

    private Double latitude;
    private Double longitude;

    @NotBlank(message = "Address is required")
    private String address;

    private String specifications;

    private LocalDate availableFrom;
    private LocalDate availableTo;
}
