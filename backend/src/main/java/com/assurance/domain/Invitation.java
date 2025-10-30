package com.assurance.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invitations")
public class Invitation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String insuranceCompany;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;
    
    private LocalDateTime usedAt;
    
    @Column(nullable = false)
    private String invitedBy; // Username de l'admin qui a envoyé l'invitation
    
    // Constructeurs
    public Invitation() {}
    
    public Invitation(String token, String email, String insuranceCompany, String invitedBy) {
        this.token = token;
        this.email = email;
        this.insuranceCompany = insuranceCompany;
        this.invitedBy = invitedBy;
        this.expiresAt = LocalDateTime.now().plusDays(7); // Expire dans 7 jours
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getInsuranceCompany() { return insuranceCompany; }
    public void setInsuranceCompany(String insuranceCompany) { this.insuranceCompany = insuranceCompany; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }
    
    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
    
    public String getInvitedBy() { return invitedBy; }
    public void setInvitedBy(String invitedBy) { this.invitedBy = invitedBy; }
    
    // Énumération
    public enum InvitationStatus {
        PENDING,    // En attente
        USED,       // Utilisée
        EXPIRED,    // Expirée
        CANCELLED   // Annulée
    }
    
    // Méthodes utilitaires
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isValid() {
        return status == InvitationStatus.PENDING && !isExpired();
    }
    
    public void markAsUsed() {
        this.status = InvitationStatus.USED;
        this.usedAt = LocalDateTime.now();
    }
}
