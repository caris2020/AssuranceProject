package com.assurance.dto;

public class CreateReportRequestDto {
    private Long reportId;
    private String reportTitle;
    private String requesterId;
    private String requesterName;
    private String requesterEmail;
    private String requesterCompany;
    private String requesterPhone;
    private String reason;
    
    // Constructeur par défaut
    public CreateReportRequestDto() {}
    
    // Constructeur avec paramètres
    public CreateReportRequestDto(Long reportId, String reportTitle, String requesterId, String requesterName,
                                 String requesterEmail, String requesterCompany, String requesterPhone, String reason) {
        this.reportId = reportId;
        this.reportTitle = reportTitle;
        this.requesterId = requesterId;
        this.requesterName = requesterName;
        this.requesterEmail = requesterEmail;
        this.requesterCompany = requesterCompany;
        this.requesterPhone = requesterPhone;
        this.reason = reason;
    }
    
    // Getters et Setters
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
}
