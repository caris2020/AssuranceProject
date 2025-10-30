package com.assurance.dto;

import com.assurance.domain.Invitation;
import java.time.LocalDateTime;

public class InvitationDto {
    private Long id;
    private String token;
    private String email;
    private String insuranceCompany;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Invitation.InvitationStatus status;
    private LocalDateTime usedAt;
    private String invitedBy;
    
    public InvitationDto() {}
    
    public InvitationDto(Invitation invitation) {
        this.id = invitation.getId();
        this.token = invitation.getToken();
        this.email = invitation.getEmail();
        this.insuranceCompany = invitation.getInsuranceCompany();
        this.createdAt = invitation.getCreatedAt();
        this.expiresAt = invitation.getExpiresAt();
        this.status = invitation.getStatus();
        this.usedAt = invitation.getUsedAt();
        this.invitedBy = invitation.getInvitedBy();
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
    
    public Invitation.InvitationStatus getStatus() { return status; }
    public void setStatus(Invitation.InvitationStatus status) { this.status = status; }
    
    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
    
    public String getInvitedBy() { return invitedBy; }
    public void setInvitedBy(String invitedBy) { this.invitedBy = invitedBy; }
}
