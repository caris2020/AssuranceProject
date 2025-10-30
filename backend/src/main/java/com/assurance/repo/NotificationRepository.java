package com.assurance.repo;

import com.assurance.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Trouve toutes les notifications d'un utilisateur, triées par date de création (plus récentes d'abord)
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Trouve les notifications non lues d'un utilisateur
     */
    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);
    
    /**
     * Compte les notifications non lues d'un utilisateur
     */
    long countByUserIdAndReadFalse(String userId);
    
    /**
     * Trouve les notifications d'un utilisateur par type
     */
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, Notification.NotificationType type);
    
    /**
     * Trouve les notifications non lues d'un utilisateur par type
     */
    List<Notification> findByUserIdAndTypeAndReadFalseOrderByCreatedAtDesc(String userId, Notification.NotificationType type);
    
    /**
     * Supprime toutes les notifications d'un utilisateur
     */
    void deleteByUserId(String userId);
    
    /**
     * Supprime les anciennes notifications (plus de 30 jours)
     */
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") java.time.Instant cutoffDate);
}
