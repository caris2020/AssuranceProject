package com.assurance.dto;

import com.assurance.domain.User;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String insuranceCompany;
    private String companyLogo;
    private String password;
    private String email;
    private User.UserStatus status;
    private User.UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private LocalDateTime lastLogoutAt;
    private boolean isActive;
    // Champs d'abonnement
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    private boolean subscriptionActive;
    private LocalDate lastRenewalRequestDate;
    private User.SubscriptionStatus subscriptionStatus;
    private long daysUntilExpiration;

    public UserDto() {}
    public UserDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.dateOfBirth = user.getDateOfBirth();
        this.insuranceCompany = user.getInsuranceCompany();
        this.companyLogo = user.getCompanyLogo();
        this.password = null; // jamais exposer le mot de passe hashé
        this.email = user.getEmail();
        this.status = user.getStatus();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
        this.lastLoginAt = user.getLastLoginAt();
        this.lastLogoutAt = user.getLastLogoutAt();
        this.isActive = user.isActive();
        this.subscriptionStartDate = user.getSubscriptionStartDate();
        this.subscriptionEndDate = user.getSubscriptionEndDate();
        this.subscriptionActive = user.isSubscriptionActive();
        this.lastRenewalRequestDate = user.getLastRenewalRequestDate();
        this.subscriptionStatus = user.getSubscriptionStatus();
        this.daysUntilExpiration = user.getDaysUntilExpiration();
    }
    // Getters/Setters pour tous les champs nécessaires
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
    public User.UserStatus getStatus() { return status; }
    public void setStatus(User.UserStatus status) { this.status = status; }
    public User.UserRole getRole() { return role; }
    public void setRole(User.UserRole role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public LocalDateTime getLastLogoutAt() { return lastLogoutAt; }
    public void setLastLogoutAt(LocalDateTime lastLogoutAt) { this.lastLogoutAt = lastLogoutAt; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public LocalDate getSubscriptionStartDate() { return subscriptionStartDate; }
    public void setSubscriptionStartDate(LocalDate subscriptionStartDate) { this.subscriptionStartDate = subscriptionStartDate; }
    public LocalDate getSubscriptionEndDate() { return subscriptionEndDate; }
    public void setSubscriptionEndDate(LocalDate subscriptionEndDate) { this.subscriptionEndDate = subscriptionEndDate; }
    public boolean isSubscriptionActive() { return subscriptionActive; }
    public void setSubscriptionActive(boolean subscriptionActive) { this.subscriptionActive = subscriptionActive; }
    public LocalDate getLastRenewalRequestDate() { return lastRenewalRequestDate; }
    public void setLastRenewalRequestDate(LocalDate lastRenewalRequestDate) { this.lastRenewalRequestDate = lastRenewalRequestDate; }
    public User.SubscriptionStatus getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(User.SubscriptionStatus subscriptionStatus) { this.subscriptionStatus = subscriptionStatus; }
    public long getDaysUntilExpiration() { return daysUntilExpiration; }
    public void setDaysUntilExpiration(long daysUntilExpiration) { this.daysUntilExpiration = daysUntilExpiration; }
}
