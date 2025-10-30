package com.assurance.web;

import com.assurance.domain.Notification;
import com.assurance.service.InAppNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private InAppNotificationService notificationService;
    
    /**
     * Récupère toutes les notifications d'un utilisateur
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        try {
            List<Notification> notifications = notificationService.getNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Récupère les notifications non lues d'un utilisateur
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String userId) {
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Compte les notifications non lues d'un utilisateur
     */
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        try {
            long count = notificationService.countUnreadNotifications(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Marque une notification comme lue
     */
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Boolean>> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam String userId) {
        try {
            boolean success = notificationService.markAsRead(notificationId, userId);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Marque toutes les notifications d'un utilisateur comme lues
     */
    @PostMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Boolean>> markAllAsRead(@PathVariable String userId) {
        try {
            List<Notification> unreadNotifications = notificationService.getUnreadNotifications(userId);
            for (Notification notification : unreadNotifications) {
                notificationService.markAsRead(notification.getId(), userId);
            }
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Supprime une notification individuelle
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, Boolean>> deleteNotification(
            @PathVariable Long notificationId,
            @RequestParam String userId) {
        try {
            boolean success = notificationService.deleteNotification(notificationId, userId);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Restaure une notification mise à la corbeille
     */
    @PostMapping("/{notificationId}/restore")
    public ResponseEntity<Map<String, Boolean>> restoreNotification(
            @PathVariable Long notificationId,
            @RequestParam String userId) {
        try {
            boolean success = notificationService.restoreNotification(notificationId, userId);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Liste les notifications en corbeille
     */
    @GetMapping("/user/{userId}/trash")
    public ResponseEntity<List<Notification>> getTrashed(@PathVariable String userId) {
        try {
            List<Notification> trashed = notificationService.getTrashedNotifications(userId);
            return ResponseEntity.ok(trashed);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Supprime toutes les notifications d'un utilisateur
     */
    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<Map<String, Boolean>> deleteAllUserNotifications(@PathVariable String userId) {
        try {
            boolean success = notificationService.deleteAllUserNotifications(userId);
            return ResponseEntity.ok(Map.of("success", success));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Supprime les anciennes notifications
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, String>> cleanupOldNotifications() {
        try {
            notificationService.cleanupOldNotifications();
            return ResponseEntity.ok(Map.of("message", "Nettoyage effectué"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
