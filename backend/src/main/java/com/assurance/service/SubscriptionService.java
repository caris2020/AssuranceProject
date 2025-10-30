package com.assurance.service;

import com.assurance.domain.User;
import com.assurance.domain.RenewalRequest;
import com.assurance.repository.UserRepository;
import com.assurance.repository.RenewalRequestRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubscriptionService {
    
    private final UserRepository userRepository;
    private final RenewalRequestRepository renewalRequestRepository;
    
    public SubscriptionService(UserRepository userRepository, RenewalRequestRepository renewalRequestRepository) {
        this.userRepository = userRepository;
        this.renewalRequestRepository = renewalRequestRepository;
    }
    
    /**
     * Vérifie et met à jour le statut des abonnements expirés
     * Exécuté quotidiennement à 00:00
     * Les administrateurs ne sont pas affectés par l'expiration d'abonnement
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void checkExpiredSubscriptions() {
        LocalDate today = LocalDate.now();
        List<User> users = userRepository.findBySubscriptionEndDateBeforeAndSubscriptionActiveTrue(today);
        
        int updatedCount = 0;
        for (User user : users) {
            // Les administrateurs ne sont pas affectés par l'expiration d'abonnement
            if (user.getRole() != User.UserRole.ADMIN) {
                user.setSubscriptionActive(false);
                user.setSubscriptionStatus(User.SubscriptionStatus.EXPIRED);
                userRepository.save(user);
                updatedCount++;
            }
        }
        
        if (updatedCount > 0) {
            System.out.println("Mise à jour de " + updatedCount + " abonnements expirés (administrateurs exclus)");
        }
    }
    
    /**
     * Renouvelle l'abonnement d'un utilisateur
     */
    @Transactional
    public boolean renewUserSubscription(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }
        
        user.renewSubscription();
        userRepository.save(user);
        return true;
    }
    
    /**
     * Demande de renouvellement d'abonnement
     */
    @Transactional
    public boolean requestSubscriptionRenewal(Long userId) {
        System.out.println("=== DEBUG: Début de requestSubscriptionRenewal pour userId: " + userId);
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            System.out.println("=== DEBUG: Utilisateur non trouvé pour userId: " + userId);
            return false;
        }
        
        System.out.println("=== DEBUG: Utilisateur trouvé: " + user.getUsername() + ", role: " + user.getRole() + ", status: " + user.getSubscriptionStatus());
        
        if (!user.canRequestRenewal()) {
            System.out.println("=== DEBUG: L'utilisateur ne peut pas demander de renouvellement");
            return false;
        }
        
        // Vérifier s'il n'y a pas déjà une demande en attente
        RenewalRequest existingRequest = renewalRequestRepository.findLatestPendingRequestByUserId(userId);
        if (existingRequest != null) {
            System.out.println("=== DEBUG: Demande déjà en attente pour userId: " + userId);
            return false; // Demande déjà en attente
        }
        
        System.out.println("=== DEBUG: Création de la nouvelle demande de renouvellement");
        
        // Créer une nouvelle demande de renouvellement
        RenewalRequest renewalRequest = new RenewalRequest(user);
        renewalRequestRepository.save(renewalRequest);
        
        System.out.println("=== DEBUG: Demande créée avec ID: " + renewalRequest.getId());
        
        // Mettre à jour le statut de l'utilisateur
        user.requestRenewal();
        userRepository.save(user);
        
        System.out.println("=== DEBUG: Statut utilisateur mis à jour");
        
        return true;
    }
    
    /**
     * Obtient les utilisateurs avec des abonnements expirés
     */
    public List<User> getExpiredSubscriptions() {
        return userRepository.findBySubscriptionStatus(User.SubscriptionStatus.EXPIRED);
    }
    
    /**
     * Obtient les utilisateurs en attente de renouvellement
     */
    public List<User> getPendingRenewalSubscriptions() {
        return userRepository.findBySubscriptionStatus(User.SubscriptionStatus.PENDING_RENEWAL);
    }
    
    /**
     * Obtient les utilisateurs avec des abonnements expirant dans les 30 prochains jours
     */
    public List<User> getSubscriptionsExpiringSoon() {
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return userRepository.findBySubscriptionEndDateBeforeAndSubscriptionStatus(
            thirtyDaysFromNow, User.SubscriptionStatus.ACTIVE);
    }
    
    /**
     * Obtient les utilisateurs avec des abonnements actifs
     */
    public List<User> getActiveSubscriptions() {
        return userRepository.findBySubscriptionStatus(User.SubscriptionStatus.ACTIVE);
    }
    
    /**
     * Vérifie si un utilisateur a un abonnement actif
     * Les administrateurs ont toujours un abonnement actif
     */
    public boolean isUserSubscriptionActive(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }
        
        // Les administrateurs ont toujours un abonnement actif
        if (user.getRole() == User.UserRole.ADMIN) {
            return true;
        }
        
        return user.isSubscriptionActive() && !user.isSubscriptionExpired();
    }
    
    /**
     * Obtient le nombre de jours restants pour un utilisateur
     */
    public long getDaysUntilExpiration(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            // Mettre à jour automatiquement le statut de l'abonnement
            user.updateSubscriptionStatus();
            userRepository.save(user);
            return user.getDaysUntilExpiration();
        }
        return 0;
    }
    
    /**
     * Obtient toutes les demandes de renouvellement en attente
     */
    public List<RenewalRequest> getPendingRenewalRequests() {
        return renewalRequestRepository.findByStatusOrderByRequestDateDesc(RenewalRequest.Status.PENDING);
    }
    
    /**
     * Approuve une demande de renouvellement
     */
    @Transactional
    public boolean approveRenewalRequest(Long requestId, Long adminId) {
        RenewalRequest request = renewalRequestRepository.findById(requestId).orElse(null);
        User admin = userRepository.findById(adminId).orElse(null);
        
        if (request == null || admin == null || !request.isPending()) {
            return false;
        }
        
        // Approuver la demande
        request.approve(admin);
        renewalRequestRepository.save(request);
        
        // Renouveler l'abonnement de l'utilisateur
        User user = request.getUser();
        user.renewSubscription();
        userRepository.save(user);
        
        return true;
    }
    
    /**
     * Rejette une demande de renouvellement
     */
    @Transactional
    public boolean rejectRenewalRequest(Long requestId, Long adminId, String reason) {
        RenewalRequest request = renewalRequestRepository.findById(requestId).orElse(null);
        User admin = userRepository.findById(adminId).orElse(null);
        
        if (request == null || admin == null || !request.isPending()) {
            return false;
        }
        
        // Rejeter la demande
        request.reject(admin, reason);
        renewalRequestRepository.save(request);
        
        return true;
    }
    
    /**
     * Obtient les statistiques des demandes de renouvellement
     */
    public long getPendingRenewalRequestsCount() {
        return renewalRequestRepository.countByStatus(RenewalRequest.Status.PENDING);
    }
}
