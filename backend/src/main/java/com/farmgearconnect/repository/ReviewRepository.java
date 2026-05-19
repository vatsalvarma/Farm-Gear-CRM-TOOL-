package com.farmgearconnect.repository;

import com.farmgearconnect.entity.Equipment;
import com.farmgearconnect.entity.Review;
import com.farmgearconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Page<Review> findByEquipmentAndApprovedTrueOrderByCreatedAtDesc(
            Equipment equipment, Pageable pageable);

    Optional<Review> findByBookingId(UUID bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.equipment = :equipment AND r.approved = true")
    Double calculateAverageRating(@Param("equipment") Equipment equipment);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.equipment = :equipment AND r.approved = true")
    long countApprovedReviews(@Param("equipment") Equipment equipment);

    boolean existsByFarmerAndBookingId(User farmer, UUID bookingId);

    Page<Review> findByApprovedFalseOrderByCreatedAtDesc(Pageable pageable);
}
