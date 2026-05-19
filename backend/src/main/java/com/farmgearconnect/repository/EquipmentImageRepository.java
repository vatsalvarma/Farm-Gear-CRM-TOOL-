package com.farmgearconnect.repository;

import com.farmgearconnect.entity.Equipment;
import com.farmgearconnect.entity.EquipmentImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EquipmentImageRepository extends JpaRepository<EquipmentImage, UUID> {

    List<EquipmentImage> findByEquipmentOrderBySortOrderAsc(Equipment equipment);

    long countByEquipment(Equipment equipment);
}
