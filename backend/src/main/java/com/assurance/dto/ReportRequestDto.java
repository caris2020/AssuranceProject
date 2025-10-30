package com.assurance.dto;

import com.assurance.entity.ReportRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ReportRequestDto {
    private Long id;
    private Long reportId;
    private String reportTitle;
    private String requesterId;
    private String requesterName;
    private String requesterEmail;
    private String requesterCompany;
    private String requesterPhone;
    private String reason;
    private String status;
    private String validationCode;
    private String expiresAt;
    private String requestedAt;
    private String processedAt;
    private String processedBy;
    private String downloadedAt;
    
    // Constructeur par défaut
    public ReportRequestDto() {}
    
    // Constructeur avec entité
    public ReportRequestDto(ReportRequest request) {
        this.id = request.getId();
        this.reportId = request.getReportId();
        this.reportTitle = request.getReportTitle();
        this.requesterId = request.getRequesterId();
        this.requesterName = request.getRequesterName();
        this.requesterEmail = request.getRequesterEmail();
        this.requesterCompany = request.getRequesterCompany();
        this.requesterPhone = request.getRequesterPhone();
        this.reason = request.getReason();
        this.status = request.getStatus().name();
        this.validationCode = request.getValidationCode();
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        if (request.getExpiresAt() != null) {
            this.expiresAt = request.getExpiresAt().format(formatter);
        }
        
        if (request.getRequestedAt() != null) {
            this.requestedAt = request.getRequestedAt().format(formatter);
        }
        
        if (request.getProcessedAt() != null) {
            this.processedAt = request.getProcessedAt().format(formatter);
        }
        
        this.processedBy = request.getProcessedBy();
        
        if (request.getDownloadedAt() != null) {
            this.downloadedAt = request.getDownloadedAt().format(formatter);
        }
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getValidationCode() {
        return validationCode;
    }
    
    public void setValidationCode(String validationCode) {
        this.validationCode = validationCode;
    }
    
    public String getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public String getRequestedAt() {
        return requestedAt;
    }
    
    public void setRequestedAt(String requestedAt) {
        this.requestedAt = requestedAt;
    }
    
    public String getProcessedAt() {
        return processedAt;
    }
    
    public void setProcessedAt(String processedAt) {
        this.processedAt = processedAt;
    }
    
    public String getProcessedBy() {
        return processedBy;
    }
    
    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
    }
    
    public String getDownloadedAt() {
        return downloadedAt;
    }
    
    public void setDownloadedAt(String downloadedAt) {
        this.downloadedAt = downloadedAt;
    }
}
