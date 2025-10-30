package com.assurance.dto;

import com.assurance.domain.Report;
import java.time.Instant;

public class ReportDto {
    private Long id;
    private String title;
    private Report.Status status;
    private String beneficiaries;
    private String insureds;
    private String initiator;
    private String subscriber;
    private String caseId;
    private String createdBy;
    private Instant createdAt;

    // Constructeur par défaut
    public ReportDto() {}

    // Constructeur avec paramètres
    public ReportDto(Long id, String title, Report.Status status, String beneficiaries, 
                    String insureds, String initiator, String subscriber, String caseId, 
                    String createdBy, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.beneficiaries = beneficiaries;
        this.insureds = insureds;
        this.initiator = initiator;
        this.subscriber = subscriber;
        this.caseId = caseId;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    // Méthode de conversion depuis l'entité Report
    public static ReportDto fromEntity(Report report) {
        return new ReportDto(
            report.getId(),
            report.getTitle(),
            report.getStatus(),
            report.getBeneficiaries(),
            report.getInsureds(),
            report.getInitiator(),
            report.getSubscriber(),
            report.getCaseId(),
            report.getCreatedBy(),
            report.getCreatedAt()
        );
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Report.Status getStatus() { return status; }
    public void setStatus(Report.Status status) { this.status = status; }

    public String getBeneficiaries() { return beneficiaries; }
    public void setBeneficiaries(String beneficiaries) { this.beneficiaries = beneficiaries; }

    public String getInsureds() { return insureds; }
    public void setInsureds(String insureds) { this.insureds = insureds; }

    public String getInitiator() { return initiator; }
    public void setInitiator(String initiator) { this.initiator = initiator; }

    public String getSubscriber() { return subscriber; }
    public void setSubscriber(String subscriber) { this.subscriber = subscriber; }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
