package com.assurance.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "temporary_access_codes")
public class TemporaryAccessCode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code", nullable = false, unique = true)
    private String code; // Format: XXX-XXX-XXX
    
    @Column(name = "report_id", nullable = false)
    private Long reportId;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "code_expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "used", nullable = false)
    private boolean used = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "used_at")
    private LocalDateTime usedAt;
    
    @Column(name = "created_by", nullable = false)
    private String createdBy; // Admin qui a généré le code
    
    // Constructeurs
    public TemporaryAccessCode() {
        this.createdAt = LocalDateTime.now();
    }
    
    public TemporaryAccessCode(String code, Long reportId, String userId, String createdBy) {
        this();
        this.code = code;
        this.reportId = reportId;
        this.userId = userId;
        this.createdBy = createdBy;
        this.expiresAt = LocalDateTime.now().plusHours(24); // 24h par défaut
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public Long getReportId() {
        return reportId;
    }
    
    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public boolean isUsed() {
        return used;
    }
    
    public void setUsed(boolean used) {
        this.used = used;
        if (used && this.usedAt == null) {
            this.usedAt = LocalDateTime.now();
        }
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUsedAt() {
        return usedAt;
    }
    
    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    // Méthodes utilitaires
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
    
    public boolean isValid() {
        return !this.used && !this.isExpired();
    }
    
    @Override
    public String toString() {
        return "TemporaryAccessCode{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", reportId=" + reportId +
                ", userId='" + userId + '\'' +
                ", expiresAt=" + expiresAt +
                ", used=" + used +
                ", createdAt=" + createdAt +
                '}';
    }
}
