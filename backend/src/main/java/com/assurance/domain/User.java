package com.assurance.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    @Column(nullable = false)
    private String insuranceCompany;
    
    @Column(columnDefinition = "TEXT")
    private String companyLogo;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.INVITED;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime lastLoginAt;
    
    private LocalDateTime lastLogoutAt;
    
    @Column(nullable = false)
    private boolean isActive = true;
    
    // Champs d'abonnement
    @Column(nullable = false)
    private LocalDate subscriptionStartDate = LocalDate.now();
    
    @Column(nullable = false)
    private LocalDate subscriptionEndDate = LocalDate.now().plusYears(1);
    
    @Column(nullable = false)
    private boolean subscriptionActive = true;
    
    @Column
    private LocalDate lastRenewalRequestDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus subscriptionStatus = SubscriptionStatus.ACTIVE;
    
    // Constructeurs
    public User() {}
    
    public User(String username, String firstName, String lastName, LocalDate dateOfBirth, 
                String insuranceCompany, String password, String email) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.insuranceCompany = insuranceCompany;
        this.password = password;
        this.email = email;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getInsuranceCompany() { return insuranceCompany; }
    public void setInsuranceCompany(String insuranceCompany) { this.insuranceCompany = insuranceCompany; }
    
    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    
    public LocalDateTime getLastLogoutAt() { return lastLogoutAt; }
    public void setLastLogoutAt(LocalDateTime lastLogoutAt) { this.lastLogoutAt = lastLogoutAt; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    // Getters et Setters pour l'abonnement
    public LocalDate getSubscriptionStartDate() { return subscriptionStartDate; }
    public void setSubscriptionStartDate(LocalDate subscriptionStartDate) { this.subscriptionStartDate = subscriptionStartDate; }
    
    public LocalDate getSubscriptionEndDate() { return subscriptionEndDate; }
    public void setSubscriptionEndDate(LocalDate subscriptionEndDate) { this.subscriptionEndDate = subscriptionEndDate; }
    
    public boolean isSubscriptionActive() { return subscriptionActive; }
    public void setSubscriptionActive(boolean subscriptionActive) { this.subscriptionActive = subscriptionActive; }
    
    public LocalDate getLastRenewalRequestDate() { return lastRenewalRequestDate; }
    public void setLastRenewalRequestDate(LocalDate lastRenewalRequestDate) { this.lastRenewalRequestDate = lastRenewalRequestDate; }
    
    public SubscriptionStatus getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(SubscriptionStatus subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }
    
    // Énumérations
    public enum UserStatus {
        INVITED,    // Invité mais pas encore inscrit
        REGISTERED, // Inscrit et actif
        SUSPENDED,  // Suspendu
        DELETED     // Supprimé
    }
    
    public enum UserRole {
        ADMIN,      // Administrateur
        USER        // Utilisateur normal
    }
    
    public enum SubscriptionStatus {
        ACTIVE,         // Abonnement actif
        EXPIRED,        // Abonnement expiré
        PENDING_RENEWAL, // En attente de renouvellement
        SUSPENDED       // Abonnement suspendu
    }
    
    // Méthodes utilitaires
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
    
    public boolean isRegistered() {
        return status == UserStatus.REGISTERED;
    }
    
    // Méthodes pour l'abonnement
    public boolean isSubscriptionExpired() {
        // Les administrateurs n'ont jamais d'abonnement expiré
        if (role == UserRole.ADMIN) {
            return false;
        }
        
        // Utiliser la date actuelle réelle
        LocalDate now = LocalDate.now();
        
        // Si l'abonnement n'a pas encore commencé, il n'est pas expiré
        if (now.isBefore(subscriptionStartDate)) {
            return false;
        }
        
        // Si l'abonnement est en cours, vérifier s'il a expiré
        return now.isAfter(subscriptionEndDate) || now.isEqual(subscriptionEndDate);
    }
    
    public long getDaysUntilExpiration() {
        // Les administrateurs ont toujours un nombre infini de jours restants
        if (role == UserRole.ADMIN) {
            return Long.MAX_VALUE;
        }
        
        // Vérifier que la date de fin existe
        if (subscriptionEndDate == null) {
            return 0;
        }
        
        // Utiliser la date actuelle réelle
        LocalDate now = LocalDate.now();
        
        // Calculer la différence en jours
        long daysDiff = now.until(subscriptionEndDate, java.time.temporal.ChronoUnit.DAYS);
        
        // Retourner le nombre de jours restants (minimum 0)
        return Math.max(0, daysDiff);
    }
    
    public boolean canRequestRenewal() {
        // Les administrateurs ne peuvent pas demander de renouvellement (ils n'en ont pas besoin)
        if (role == UserRole.ADMIN) {
            return false;
        }
        // Permettre la demande de renouvellement si l'abonnement est actif, expiré ou en attente
        // Mais pas si une demande est déjà en cours
        return subscriptionStatus == SubscriptionStatus.ACTIVE || 
               subscriptionStatus == SubscriptionStatus.EXPIRED || 
               subscriptionStatus == SubscriptionStatus.PENDING_RENEWAL;
    }
    
    public void renewSubscription() {
        // Si l'abonnement n'est pas encore expiré, calculer la nouvelle date de fin
        // à partir de la date de fin actuelle + 1 an + 3 jours
        LocalDate newEndDate;
        if (subscriptionEndDate != null && !isSubscriptionExpired()) {
            // L'abonnement n'est pas encore expiré, ajouter 1 an + 3 jours à la date de fin actuelle
            newEndDate = subscriptionEndDate.plusYears(1).plusDays(3);
        } else {
            // L'abonnement est expiré, commencer à partir de la date actuelle
            newEndDate = LocalDate.now().plusYears(1).plusDays(3);
        }
        
        this.subscriptionStartDate = LocalDate.now();
        this.subscriptionEndDate = newEndDate;
        this.subscriptionActive = true;
        this.subscriptionStatus = SubscriptionStatus.ACTIVE;
        this.lastRenewalRequestDate = null;
    }
    
    public void requestRenewal() {
        this.subscriptionStatus = SubscriptionStatus.PENDING_RENEWAL;
        this.lastRenewalRequestDate = LocalDate.now();
    }
    
    /**
     * Met à jour automatiquement le statut de l'abonnement basé sur la date actuelle
     */
    public void updateSubscriptionStatus() {
        if (role == UserRole.ADMIN) {
            // Les administrateurs ont toujours un statut ACTIVE
            this.subscriptionStatus = SubscriptionStatus.ACTIVE;
            this.subscriptionActive = true;
            return;
        }
        
        if (isSubscriptionExpired()) {
            this.subscriptionStatus = SubscriptionStatus.EXPIRED;
            this.subscriptionActive = false;
        } else {
            this.subscriptionStatus = SubscriptionStatus.ACTIVE;
            this.subscriptionActive = true;
        }
    }
}
