package com.assurance.web;

import com.assurance.domain.User;
import com.assurance.domain.RenewalRequest;
import com.assurance.service.SubscriptionService;
import com.assurance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {
    
    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;
    
    public SubscriptionController(SubscriptionService subscriptionService, UserRepository userRepository) {
        this.subscriptionService = subscriptionService;
        this.userRepository = userRepository;
    }
    
    /**
     * Renouvelle l'abonnement d'un utilisateur (admin seulement)
     */
    @PostMapping("/renew/{userId}")
    public ResponseEntity<Map<String, Object>> renewSubscription(@PathVariable Long userId) {
        boolean success = subscriptionService.renewUserSubscription(userId);
        
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("success", true);
            response.put("message", "Abonnement renouvelé avec succès");
        } else {
            response.put("success", false);
            response.put("message", "Impossible de renouveler l'abonnement");
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Demande de renouvellement d'abonnement (utilisateur)
     */
    @PostMapping("/request-renewal/{userId}")
    public ResponseEntity<Map<String, Object>> requestRenewal(@PathVariable Long userId) {
        boolean success = subscriptionService.requestSubscriptionRenewal(userId);
        
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("success", true);
            response.put("message", "Demande de renouvellement envoyée");
        } else {
            response.put("success", false);
            response.put("message", "Impossible d'envoyer la demande de renouvellement");
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Obtient les utilisateurs avec des abonnements expirés (admin seulement)
     */
    @GetMapping("/expired")
    public ResponseEntity<List<User>> getExpiredSubscriptions() {
        List<User> expiredUsers = subscriptionService.getExpiredSubscriptions();
        return ResponseEntity.ok(expiredUsers);
    }
    
    /**
     * Obtient les utilisateurs en attente de renouvellement (admin seulement)
     */
    @GetMapping("/pending-renewal")
    public ResponseEntity<List<User>> getPendingRenewalSubscriptions() {
        List<User> pendingUsers = subscriptionService.getPendingRenewalSubscriptions();
        return ResponseEntity.ok(pendingUsers);
    }
    
    /**
     * Obtient les utilisateurs avec des abonnements expirant bientôt (admin seulement)
     */
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<User>> getSubscriptionsExpiringSoon() {
        List<User> expiringUsers = subscriptionService.getSubscriptionsExpiringSoon();
        return ResponseEntity.ok(expiringUsers);
    }
    
    /**
     * Obtient les utilisateurs avec des abonnements actifs (admin seulement)
     */
    @GetMapping("/active")
    public ResponseEntity<List<User>> getActiveSubscriptions() {
        List<User> activeUsers = subscriptionService.getActiveSubscriptions();
        return ResponseEntity.ok(activeUsers);
    }
    
    /**
     * Vérifie si l'abonnement d'un utilisateur est actif
     */
    @GetMapping("/check/{userId}")
    public ResponseEntity<Map<String, Object>> checkSubscriptionStatus(@PathVariable Long userId) {
        boolean isActive = subscriptionService.isUserSubscriptionActive(userId);
        long daysUntilExpiration = subscriptionService.getDaysUntilExpiration(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("isActive", isActive);
        response.put("daysUntilExpiration", daysUntilExpiration);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Obtient les statistiques des abonnements (admin seulement)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSubscriptionStats() {
        List<User> expiredUsers = subscriptionService.getExpiredSubscriptions();
        List<User> pendingUsers = subscriptionService.getPendingRenewalSubscriptions();
        List<User> expiringUsers = subscriptionService.getSubscriptionsExpiringSoon();
        long pendingRequestsCount = subscriptionService.getPendingRenewalRequestsCount();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("expiredCount", expiredUsers.size());
        stats.put("pendingRenewalCount", pendingUsers.size());
        stats.put("expiringSoonCount", expiringUsers.size());
        stats.put("pendingRequestsCount", pendingRequestsCount);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Obtient les demandes de renouvellement en attente (admin seulement)
     */
    @GetMapping("/renewal-requests/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingRenewalRequests() {
        List<RenewalRequest> requests = subscriptionService.getPendingRenewalRequests();
        
        List<Map<String, Object>> response = requests.stream().map(request -> {
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("id", request.getId());
            requestData.put("userId", request.getUser().getId());
            requestData.put("username", request.getUser().getUsername());
            requestData.put("userEmail", request.getUser().getEmail());
            requestData.put("insuranceCompany", request.getUser().getInsuranceCompany());
            requestData.put("requestDate", request.getRequestDate());
            requestData.put("status", request.getStatus().name());
            requestData.put("subscriptionEndDate", request.getUser().getSubscriptionEndDate());
            requestData.put("daysUntilExpiration", request.getUser().getDaysUntilExpiration());
            return requestData;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Approuve une demande de renouvellement (admin seulement)
     */
    @PostMapping("/renewal-requests/{requestId}/approve")
    public ResponseEntity<Map<String, Object>> approveRenewalRequest(
            @PathVariable Long requestId,
            @RequestParam Long adminId) {
        
        boolean success = subscriptionService.approveRenewalRequest(requestId, adminId);
        
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("success", true);
            response.put("message", "Demande de renouvellement approuvée avec succès");
        } else {
            response.put("success", false);
            response.put("message", "Impossible d'approuver la demande de renouvellement");
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Rejette une demande de renouvellement (admin seulement)
     */
    @PostMapping("/renewal-requests/{requestId}/reject")
    public ResponseEntity<Map<String, Object>> rejectRenewalRequest(
            @PathVariable Long requestId,
            @RequestParam Long adminId,
            @RequestParam(required = false) String reason) {
        
        boolean success = subscriptionService.rejectRenewalRequest(requestId, adminId, reason);
        
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("success", true);
            response.put("message", "Demande de renouvellement rejetée");
        } else {
            response.put("success", false);
            response.put("message", "Impossible de rejeter la demande de renouvellement");
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/debug-dates")
    public ResponseEntity<Map<String, Object>> debugDates() {
        Map<String, Object> debugInfo = new HashMap<>();
        
        // Date actuelle du système
        LocalDate now = LocalDate.now();
        debugInfo.put("currentDate", now.toString());
        
        // Récupérer tous les utilisateurs avec leurs calculs
        List<User> users = subscriptionService.getActiveSubscriptions();
        users.addAll(subscriptionService.getExpiredSubscriptions());
        users.addAll(subscriptionService.getPendingRenewalSubscriptions());
        users.addAll(subscriptionService.getSubscriptionsExpiringSoon());
        
        // Supprimer les doublons
        users = users.stream().distinct().collect(Collectors.toList());
        
        List<Map<String, Object>> userDebugInfo = new ArrayList<>();
        
        for (User user : users) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", user.getUsername());
            userInfo.put("role", user.getRole());
            userInfo.put("subscriptionStartDate", user.getSubscriptionStartDate());
            userInfo.put("subscriptionEndDate", user.getSubscriptionEndDate());
            userInfo.put("daysUntilExpiration", user.getDaysUntilExpiration());
            userInfo.put("isExpired", user.isSubscriptionExpired());
            userInfo.put("subscriptionStatus", user.getSubscriptionStatus());
            userInfo.put("subscriptionActive", user.isSubscriptionActive());
            
            // Calcul manuel pour comparaison
            if (user.getRole() != User.UserRole.ADMIN && user.getSubscriptionEndDate() != null) {
                long manualDays = now.until(user.getSubscriptionEndDate()).getDays();
                userInfo.put("manualCalculation", manualDays);
                userInfo.put("isInconsistent", Math.abs(manualDays - user.getDaysUntilExpiration()) > 1);
            }
            
            userDebugInfo.add(userInfo);
        }
        
        debugInfo.put("users", userDebugInfo);
        
        return ResponseEntity.ok(debugInfo);
    }
    
    /**
     * Endpoint pour corriger les dates d'expiration incorrectes
     */
    @PostMapping("/fix-dates")
    public ResponseEntity<Map<String, Object>> fixSubscriptionDates() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Récupérer tous les utilisateurs
            List<User> allUsers = userRepository.findAll();
            LocalDate now = LocalDate.now();
            int correctedCount = 0;
            
            for (User user : allUsers) {
                if (user.getSubscriptionEndDate() != null && user.getRole() != User.UserRole.ADMIN) {
                    // Calculer manuellement les jours restants
                    long manualDays = now.until(user.getSubscriptionEndDate()).getDays();
                    
                    // Déterminer le statut correct basé sur les jours restants
                    boolean needsCorrection = false;
                    
                    if (manualDays > 0) {
                        // L'abonnement est actif
                        if (!user.isSubscriptionActive() || user.getSubscriptionStatus() != User.SubscriptionStatus.ACTIVE) {
                            user.setSubscriptionActive(true);
                            user.setSubscriptionStatus(User.SubscriptionStatus.ACTIVE);
                            needsCorrection = true;
                        }
                    } else {
                        // L'abonnement est expiré
                        if (user.isSubscriptionActive() || user.getSubscriptionStatus() != User.SubscriptionStatus.EXPIRED) {
                            user.setSubscriptionActive(false);
                            user.setSubscriptionStatus(User.SubscriptionStatus.EXPIRED);
                            needsCorrection = true;
                        }
                    }
                    
                    // Forcer la correction si les jours restants ne correspondent pas
                    if (user.getDaysUntilExpiration() != manualDays) {
                        needsCorrection = true;
                    }
                    
                    if (needsCorrection) {
                        userRepository.save(user);
                        correctedCount++;
                    }
                }
            }
            
            response.put("success", true);
            response.put("message", correctedCount + " utilisateurs corrigés");
            response.put("correctedCount", correctedCount);
            response.put("currentDate", now.toString());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la correction: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Endpoint pour corriger un utilisateur spécifique
     */
    @PutMapping("/fix-user/{userId}")
    public ResponseEntity<Map<String, Object>> fixUserSubscription(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                response.put("success", false);
                response.put("message", "Utilisateur non trouvé");
                return ResponseEntity.ok(response);
            }
            
            if (user.getRole() == User.UserRole.ADMIN) {
                response.put("success", true);
                response.put("message", "Administrateur - aucune correction nécessaire");
                return ResponseEntity.ok(response);
            }
            
            LocalDate now = LocalDate.now();
            long manualDays = 0;
            
            if (user.getSubscriptionEndDate() != null) {
                manualDays = now.until(user.getSubscriptionEndDate()).getDays();
            }
            
            boolean needsCorrection = false;
            
            if (manualDays > 0) {
                // L'abonnement est actif
                if (!user.isSubscriptionActive() || user.getSubscriptionStatus() != User.SubscriptionStatus.ACTIVE) {
                    user.setSubscriptionActive(true);
                    user.setSubscriptionStatus(User.SubscriptionStatus.ACTIVE);
                    needsCorrection = true;
                }
            } else {
                // L'abonnement est expiré
                if (user.isSubscriptionActive() || user.getSubscriptionStatus() != User.SubscriptionStatus.EXPIRED) {
                    user.setSubscriptionActive(false);
                    user.setSubscriptionStatus(User.SubscriptionStatus.EXPIRED);
                    needsCorrection = true;
                }
            }
            
            if (needsCorrection) {
                userRepository.save(user);
                response.put("success", true);
                response.put("message", "Utilisateur corrigé");
                response.put("daysUntilExpiration", manualDays);
                response.put("subscriptionStatus", user.getSubscriptionStatus());
                response.put("subscriptionActive", user.isSubscriptionActive());
            } else {
                response.put("success", true);
                response.put("message", "Aucune correction nécessaire");
                response.put("daysUntilExpiration", manualDays);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la correction: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}
