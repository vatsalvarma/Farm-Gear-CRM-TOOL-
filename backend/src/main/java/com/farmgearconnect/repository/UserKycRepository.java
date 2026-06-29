package com.farmgearconnect.repository;

import com.farmgearconnect.entity.UserKyc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserKycRepository extends JpaRepository<UserKyc, UUID> {
    Optional<UserKyc> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
    long countByKycStatus(UserKyc.KycStatus status);
}
