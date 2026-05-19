package com.farmgearconnect.repository;

import com.farmgearconnect.entity.Subscription;
import com.farmgearconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByOwnerAndActiveTrue(User owner);

    @Query("SELECT s FROM Subscription s WHERE s.owner = :owner ORDER BY s.createdAt DESC")
    List<Subscription> findAllByOwner(@Param("owner") User owner);

    @Query("SELECT s FROM Subscription s WHERE s.active = true " +
           "AND s.expiryDate BETWEEN :from AND :to")
    List<Subscription> findExpiringSubscriptions(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.active = true")
    long countActiveSubscriptions();

    Page<Subscription> findByActiveTrueOrderByCreatedAtDesc(Pageable pageable);
}
