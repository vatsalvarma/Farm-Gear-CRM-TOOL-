package com.farmgearconnect.repository;

import com.farmgearconnect.entity.Message;
import com.farmgearconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE m.deleted = false AND " +
           "((m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1)) " +
           "ORDER BY m.createdAt ASC")
    Page<Message> findConversation(
            @Param("user1") User user1,
            @Param("user2") User user2,
            Pageable pageable);

    @Query("SELECT DISTINCT CASE WHEN m.sender = :user THEN m.receiver ELSE m.sender END " +
           "FROM Message m WHERE (m.sender = :user OR m.receiver = :user) " +
           "AND m.deleted = false")
    List<User> findConversationParticipants(@Param("user") User user);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :user " +
           "AND m.read = false AND m.deleted = false")
    long countUnreadMessages(@Param("user") User user);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.read = true, m.readAt = CURRENT_TIMESTAMP " +
           "WHERE m.sender = :sender AND m.receiver = :receiver AND m.read = false")
    void markMessagesAsRead(@Param("sender") User sender,
                            @Param("receiver") User receiver);

    @Query("SELECT m FROM Message m WHERE " +
           "((m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1)) " +
           "AND m.deleted = false " +
           "ORDER BY m.createdAt DESC")
    List<Message> findLatestMessage(
            @Param("user1") User user1,
            @Param("user2") User user2,
            Pageable pageable);
}
