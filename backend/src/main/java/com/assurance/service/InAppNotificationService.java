package com.assurance.service;

import com.assurance.domain.Notification;
import com.assurance.domain.User;
import com.assurance.repo.NotificationRepository;
import com.assurance.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class InAppNotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    


    /**
     * Envoie une notification in-app à un utilisateur
     */
    public Notification sendNotification(String userId, Map<String, Object> notificationData) {
        try {
            String title = (String) notificationData.get("title");
            String message = (String) notificationData.get("message");
            String typeStr = (String) notificationData.get("type");
            String action = (String) notificationData.get("action");
            String url = (String) notificationData.get("url");
            
            Notification.NotificationType type = Notification.NotificationType.valueOf(typeStr);
            
            Notification notification = new Notification(userId, title, message, type);
            notification.setAction(action);
            notification.setUrl(url);
            
            // Convertir les métadonnées en JSON
            if (notificationData.size() > 5) { // Plus que les champs de base
                Map<String, Object> metadata = notificationData;
                metadata.remove("title");
                metadata.remove("message");
                metadata.remove("type");
                metadata.remove("action");
                metadata.remove("url");
                
                if (!metadata.isEmpty()) {
                    notification.setMetadata(objectMapper.writeValueAsString(metadata));
                }
            }
            
            Notification savedNotification = notificationRepository.save(notification);
            
            System.out.println("🔔 Notification in-app envoyée à l'utilisateur " + userId);
            System.out.println("ID: " + savedNotification.getId());
            System.out.println("Titre: " + title);
            System.out.println("Message: " + message);
            
            return savedNotification;
            
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de la notification in-app: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Envoie une notification à tous les administrateurs
     */
    public void sendNotificationToAdmins(Map<String, Object> notificationData) {
        // TODO: Implémenter l'envoi aux administrateurs
        // Pour l'instant, on envoie à un utilisateur "admin" par défaut
        sendNotification("admin", notificationData);
    }
    
    /**
     * Envoie une notification à tous les utilisateurs
     */
    public void sendNotificationToAllUsers(Map<String, Object> notificationData) {
        try {
            // Récupérer uniquement les utilisateurs actifs et ayant déjà été connectés au moins une fois
            List<User> allUsers = userRepository.findAll().stream()
                .filter(User::isActive)
                .filter(user -> user.getLastLoginAt() != null)
                .toList();
            
            System.out.println("🔔 Envoi de notification à " + allUsers.size() + " utilisateurs actifs connectés au moins une fois");
            
            // Envoyer la notification à chaque utilisateur
            for (User user : allUsers) {
                try {
                    sendNotification(user.getUsername(), notificationData);
                } catch (Exception e) {
                    System.err.println("Erreur lors de l'envoi à l'utilisateur " + user.getUsername() + ": " + e.getMessage());
                }
            }
            
            System.out.println("✅ Notifications envoyées à tous les utilisateurs");
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi des notifications à tous les utilisateurs: " + e.getMessage());
        }
    }
    
    /**
     * Envoie une notification à tous les utilisateurs actifs et connectés au moins une fois,
     * en excluant un utilisateur (par nom d'utilisateur), si fourni.
     */
    public void sendNotificationToAllUsersExcluding(String excludedUsername, Map<String, Object> notificationData) {
        try {
            List<User> allUsers = userRepository.findAll().stream()
                .filter(User::isActive)
                .filter(user -> user.getLastLoginAt() != null)
                .filter(user -> excludedUsername == null || !excludedUsername.equals(user.getUsername()))
                .toList();

            System.out.println("🔔 Envoi de notification (excluant " + excludedUsername + ") à " + allUsers.size() + " utilisateurs actifs connectés au moins une fois");
            System.out.println("🔔 [NOTIF] Utilisateurs qui recevront la notification de statut (exclusion: " + excludedUsername + "):");
            for (User user : allUsers) {
                System.out.println(" -> " + user.getUsername() + " (lastLoginAt=" + user.getLastLoginAt() + ", actif=" + user.isActive() + ")");
            }

            for (User user : allUsers) {
                try {
                    sendNotification(user.getUsername(), notificationData);
                } catch (Exception e) {
                    System.err.println("Erreur lors de l'envoi à l'utilisateur " + user.getUsername() + ": " + e.getMessage());
                }
            }
            System.out.println("✅ Notifications envoyées à tous les utilisateurs sauf exclus");
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi des notifications à tous les utilisateurs sauf exclus: " + e.getMessage());
        }
    }
    
    /**
     * Envoie une notification à tous les utilisateurs actifs et enregistrés,
     * en excluant un utilisateur (par nom d'utilisateur) si fourni.
     */
    public void sendNotificationToActiveRegisteredUsersExcluding(String excludedUsername, Map<String, Object> notificationData) {
        try {
            List<User> recipients = userRepository.findAll().stream()
                .filter(User::isActive)
                .filter(user -> user.getStatus() != User.UserStatus.DELETED)
                .filter(user -> user.getStatus() == User.UserStatus.REGISTERED || user.getRole() == User.UserRole.ADMIN)
                .filter(user -> excludedUsername == null || !excludedUsername.equals(user.getUsername()))
                .toList();

            System.out.println("🔔 Envoi de notification de changement de statut à " + recipients.size() + " utilisateurs (actifs/enregistrés/admins)");

            for (User user : recipients) {
                try {
                    sendNotification(user.getUsername(), notificationData);
                } catch (Exception e) {
                    System.err.println("Erreur lors de l'envoi à l'utilisateur " + user.getUsername() + ": " + e.getMessage());
                }
            }
            
            System.out.println("✅ Notifications de changement de statut envoyées");
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi des notifications (filtrées): " + e.getMessage());
        }
    }
    
    /**
     * Marque une notification comme lue
     */
    public boolean markAsRead(Long notificationId, String userId) {
        try {
            Notification notification = notificationRepository.findById(notificationId).orElse(null);
            if (notification != null && notification.getUserId().equals(userId)) {
                notification.setRead(true);
                notification.setReadAt(Instant.now());
                notificationRepository.save(notification);
                System.out.println("✅ Notification " + notificationId + " marquée comme lue par " + userId);
                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("Erreur lors du marquage de la notification: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Récupère les notifications d'un utilisateur
     */
    public List<Notification> getNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .filter(n -> n.getAction() == null || !"TRASHED".equalsIgnoreCase(n.getAction()))
            .toList();
    }
    
    /**
     * Récupère les notifications non lues d'un utilisateur
     */
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId).stream()
            .filter(n -> n.getAction() == null || !"TRASHED".equalsIgnoreCase(n.getAction()))
            .toList();
    }
    
    /**
     * Compte les notifications non lues d'un utilisateur
     */
    public long countUnreadNotifications(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }
    
    /**
     * Supprime une notification individuelle
     */
    public boolean deleteNotification(Long notificationId, String userId) {
        try {
            // Vérifier que la notification appartient à l'utilisateur
            Notification notification = notificationRepository.findById(notificationId).orElse(null);
            if (notification == null || !notification.getUserId().equals(userId)) {
                return false;
            }

            // Déplacer en corbeille (action = TRASHED)
            notification.setAction("TRASHED");
            notificationRepository.save(notification);
            System.out.println("🗑️ Notification " + notificationId + " déplacée en corbeille pour l'utilisateur " + userId);
            return true;
        } catch (Exception e) {
            System.err.println("Erreur lors de la suppression de la notification: " + e.getMessage());
            return false;
        }
    }

    /**
     * Restaure une notification depuis la corbeille
     */
    public boolean restoreNotification(Long notificationId, String userId) {
        try {
            Notification notification = notificationRepository.findById(notificationId).orElse(null);
            if (notification == null || !notification.getUserId().equals(userId)) {
                return false;
            }
            notification.setAction(null);
            notificationRepository.save(notification);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Retourne les notifications en corbeille
     */
    public List<Notification> getTrashedNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .filter(n -> "TRASHED".equalsIgnoreCase(n.getAction()))
            .toList();
    }
    
    /**
     * Supprime toutes les notifications d'un utilisateur
     */
    public boolean deleteAllUserNotifications(String userId) {
        try {
            // Soft delete: déplacer toutes les notifications de l'utilisateur dans la corbeille
            List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            for (Notification n : list) {
                n.setAction("TRASHED");
            }
            notificationRepository.saveAll(list);
            System.out.println("🗑️ Toutes les notifications déplacées dans la corbeille pour l'utilisateur " + userId);
            return true;
        } catch (Exception e) {
            System.err.println("Erreur lors du déplacement en corbeille des notifications: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Supprime les anciennes notifications (plus de 30 jours)
     */
    public void cleanupOldNotifications() {
        try {
            Instant cutoffDate = Instant.now().minusSeconds(30 * 24 * 60 * 60); // 30 jours
            notificationRepository.deleteOldNotifications(cutoffDate);
            System.out.println("🧹 Nettoyage des anciennes notifications effectué");
        } catch (Exception e) {
            System.err.println("Erreur lors du nettoyage des notifications: " + e.getMessage());
        }
    }
}
