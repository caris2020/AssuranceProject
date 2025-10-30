package com.assurance.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "renewal_requests")
public class RenewalRequest {
    
    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;
    
    @Column(nullable = false)
    private LocalDateTime requestDate = LocalDateTime.now();
    
    private LocalDateTime processedDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;
    
    private String rejectionReason;
    
    // Constructeurs
    public RenewalRequest() {}
    
    public RenewalRequest(User user) {
        this.user = user;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    
    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }
    
    public LocalDateTime getProcessedDate() { return processedDate; }
    public void setProcessedDate(LocalDateTime processedDate) { this.processedDate = processedDate; }
    
    public User getProcessedBy() { return processedBy; }
    public void setProcessedBy(User processedBy) { this.processedBy = processedBy; }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    
    // Méthodes utilitaires
    public boolean isPending() {
        return status == Status.PENDING;
    }
    
    public boolean isApproved() {
        return status == Status.APPROVED;
    }
    
    public boolean isRejected() {
        return status == Status.REJECTED;
    }
    
    public void approve(User admin) {
        this.status = Status.APPROVED;
        this.processedDate = LocalDateTime.now();
        this.processedBy = admin;
    }
    
    public void reject(User admin, String reason) {
        this.status = Status.REJECTED;
        this.processedDate = LocalDateTime.now();
        this.processedBy = admin;
        this.rejectionReason = reason;
    }
}
