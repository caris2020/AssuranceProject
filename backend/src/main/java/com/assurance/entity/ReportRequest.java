package com.assurance.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_requests")
public class ReportRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "report_id", nullable = false)
    private Long reportId;
    
    @Column(name = "report_title", nullable = false)
    private String reportTitle;
    
    @Column(name = "requester_id", nullable = false)
    private String requesterId;
    
    @Column(name = "requester_name", nullable = false)
    private String requesterName;
    
    @Column(name = "requester_email", nullable = false)
    private String requesterEmail;
    
    @Column(name = "requester_company", nullable = false)
    private String requesterCompany;
    
    @Column(name = "requester_phone")
    private String requesterPhone;
    
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportRequestStatus status;
    
    @Column(name = "validation_code")
    private String validationCode;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Column(name = "processed_by")
    private String processedBy;
    
    @Column(name = "downloaded_at")
    private LocalDateTime downloadedAt;
    
    public enum ReportRequestStatus {
        PENDING,    // En attente de traitement
        APPROVED,   // Approuvée avec code généré
        REJECTED,   // Rejetée
        DOWNLOADED  // Téléchargée
    }
    
    // Constructeurs
    public ReportRequest() {}
    
    public ReportRequest(Long reportId, String reportTitle, String requesterId, String requesterName, 
                        String requesterEmail, String requesterCompany, String requesterPhone, String reason) {
        this.reportId = reportId;
        this.reportTitle = reportTitle;
        this.requesterId = requesterId;
        this.requesterName = requesterName;
        this.requesterEmail = requesterEmail;
        this.requesterCompany = requesterCompany;
        this.requesterPhone = requesterPhone;
        this.reason = reason;
        this.status = ReportRequestStatus.PENDING;
        this.requestedAt = LocalDateTime.now();
    }
    
    // Méthodes de statut
    public boolean isPending() {
        return status == ReportRequestStatus.PENDING;
    }
    
    public boolean isApproved() {
        return status == ReportRequestStatus.APPROVED;
    }
    
    public boolean isRejected() {
        return status == ReportRequestStatus.REJECTED;
    }
    
    public boolean isDownloaded() {
        return status == ReportRequestStatus.DOWNLOADED;
    }
    
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    // Méthodes d'action
    public void approve(String processedBy, String validationCode) {
        this.status = ReportRequestStatus.APPROVED;
        this.validationCode = validationCode;
        this.processedBy = processedBy;
        this.processedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(1); // Expire dans 1 jour
    }
    
    public void reject(String processedBy) {
        this.status = ReportRequestStatus.REJECTED;
        this.processedBy = processedBy;
        this.processedAt = LocalDateTime.now();
    }
    
    public void markAsDownloaded() {
        this.status = ReportRequestStatus.DOWNLOADED;
        this.downloadedAt = LocalDateTime.now();
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getReportId() {
        return reportId;
    }
    
    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }
    
    public String getReportTitle() {
        return reportTitle;
    }
    
    public void setReportTitle(String reportTitle) {
        this.reportTitle = reportTitle;
    }
    
    public String getRequesterId() {
        return requesterId;
    }
    
    public void setRequesterId(String requesterId) {
        this.requesterId = requesterId;
    }
    
    public String getRequesterName() {
        return requesterName;
    }
    
    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }
    
    public String getRequesterEmail() {
        return requesterEmail;
    }
    
    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }
    
    public String getRequesterCompany() {
        return requesterCompany;
    }
    
    public void setRequesterCompany(String requesterCompany) {
        this.requesterCompany = requesterCompany;
    }
    
    public String getRequesterPhone() {
        return requesterPhone;
    }
    
    public void setRequesterPhone(String requesterPhone) {
        this.requesterPhone = requesterPhone;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public ReportRequestStatus getStatus() {
        return status;
    }
    
    public void setStatus(ReportRequestStatus status) {
        this.status = status;
    }
    
    public String getValidationCode() {
        return validationCode;
    }
    
    public void setValidationCode(String validationCode) {
        this.validationCode = validationCode;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }
    
    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }
    
    public LocalDateTime getProcessedAt() {
        return processedAt;
    }
    
    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
    
    public String getProcessedBy() {
        return processedBy;
    }
    
    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
    }
    
    public LocalDateTime getDownloadedAt() {
        return downloadedAt;
    }
    
    public void setDownloadedAt(LocalDateTime downloadedAt) {
        this.downloadedAt = downloadedAt;
    }
}
