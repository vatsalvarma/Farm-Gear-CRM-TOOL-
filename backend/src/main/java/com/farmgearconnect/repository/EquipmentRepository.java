package com.farmgearconnect.repository;

import com.farmgearconnect.entity.Equipment;
import com.farmgearconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, UUID>,
        JpaSpecificationExecutor<Equipment> {

    Optional<Equipment> findByIdAndDeletedAtIsNull(UUID id);

    Page<Equipment> findByOwnerAndDeletedAtIsNull(User owner, Pageable pageable);

    Page<Equipment> findByStatusAndDeletedAtIsNull(
            Equipment.EquipmentStatus status, Pageable pageable);

    @Query("SELECT e FROM Equipment e WHERE e.status = 'APPROVED' " +
           "AND e.deletedAt IS NULL " +
           "AND (:category IS NULL OR e.category = :category) " +
           "AND (:brand IS NULL OR LOWER(e.brand) LIKE LOWER(CONCAT('%', :brand, '%'))) " +
           "AND (:fuelType IS NULL OR e.fuelType = :fuelType) " +
           "AND (:state IS NULL OR e.state = :state) " +
           "AND (:district IS NULL OR e.district = :district) " +
           "AND (:minPrice IS NULL OR e.pricePerDay >= :minPrice) " +
           "AND (:maxPrice IS NULL OR e.pricePerDay <= :maxPrice) " +
           "AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Equipment> searchEquipment(
            @Param("category") Equipment.EquipmentCategory category,
            @Param("brand") String brand,
            @Param("fuelType") Equipment.FuelType fuelType,
            @Param("state") String state,
            @Param("district") String district,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("search") String search,
            Pageable pageable);

    @Query(value = "SELECT e.* FROM equipment e " +
           "WHERE e.status = 'APPROVED' AND e.deleted_at IS NULL " +
           "AND e.latitude IS NOT NULL AND e.longitude IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(e.latitude)) * " +
           "cos(radians(e.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(e.latitude)))) < :radiusKm " +
           "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(e.latitude)) * " +
           "cos(radians(e.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(e.latitude)))) ASC",
           nativeQuery = true)
    List<Equipment> findNearbyEquipment(
            @Param("lat") double latitude,
            @Param("lng") double longitude,
            @Param("radiusKm") double radiusKm);

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.status = :status AND e.deletedAt IS NULL")
    long countByStatus(@Param("status") Equipment.EquipmentStatus status);

    boolean existsByTitleAndOwnerAndDeletedAtIsNull(String title, User owner);
}
