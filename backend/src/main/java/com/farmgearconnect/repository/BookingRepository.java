package com.farmgearconnect.repository;

import com.farmgearconnect.entity.Booking;
import com.farmgearconnect.entity.Equipment;
import com.farmgearconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findByFarmerOrderByCreatedAtDesc(User farmer, Pageable pageable);

    Page<Booking> findByOwnerOrderByCreatedAtDesc(User owner, Pageable pageable);

    /** All bookings for a specific piece of equipment, newest first (owner-scoped). */
    Page<Booking> findByEquipmentAndOwnerOrderByCreatedAtDesc(
            Equipment equipment, User owner, Pageable pageable);

    Page<Booking> findByEquipmentOrderByCreatedAtDesc(
            Equipment equipment, Pageable pageable);

    Optional<Booking> findByBookingReference(String reference);

    @Query("SELECT b FROM Booking b WHERE b.equipment = :equipment " +
           "AND b.status IN ('PENDING', 'APPROVED', 'ACTIVE') " +
           "AND (b.startDate <= :endDate AND b.endDate >= :startDate)")
    List<Booking> findConflictingBookings(
            @Param("equipment") Equipment equipment,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b " +
           "WHERE b.owner = :owner AND b.status = 'COMPLETED'")
    BigDecimal calculateTotalEarnings(@Param("owner") User owner);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(@Param("status") Booking.BookingStatus status);

    Page<Booking> findByOwnerAndStatusOrderByCreatedAtDesc(
            User owner, Booking.BookingStatus status, Pageable pageable);

    Page<Booking> findByFarmerAndStatusOrderByCreatedAtDesc(
            User farmer, Booking.BookingStatus status, Pageable pageable);
}
