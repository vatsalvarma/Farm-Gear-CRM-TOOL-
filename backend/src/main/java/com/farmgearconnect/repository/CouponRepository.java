package com.farmgearconnect.repository;

import com.farmgearconnect.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    Optional<Coupon> findByCodeAndActiveTrueAndExpiryDateAfter(
            String code, LocalDate date);

    Optional<Coupon> findByCode(String code);

    Page<Coupon> findByActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    long countByActiveTrue();
}
