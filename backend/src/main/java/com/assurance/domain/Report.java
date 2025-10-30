package com.assurance.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "reports")
public class Report {
    public enum Status { DISPONIBLE, EN_ATTENTE, TRAITE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.DISPONIBLE;

    // Champ JSON pour stocker plusieurs bénéficiaires
    @Column(columnDefinition = "TEXT")
    private String beneficiaries; // JSON array: [{"nom": "...", "prenom": "...", "dateNaissance": "..."}]

    // Champ JSON pour stocker plusieurs assurés
    @Column(columnDefinition = "TEXT")
    private String insureds; // JSON array: [{"nom": "...", "prenom": "...", "dateNaissance": "..."}]

    private String initiator;
    private String subscriber;
    private String caseId;
    private String createdBy; // Nom de l'utilisateur qui a créé le rapport

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    // Méthodes pour gérer les bénéficiaires
    public String getBeneficiaries() { return beneficiaries; }
    public void setBeneficiaries(String beneficiaries) { this.beneficiaries = beneficiaries; }

    // Méthodes pour gérer les assurés
    public String getInsureds() { return insureds; }
    public void setInsureds(String insureds) { this.insureds = insureds; }

    // Méthode de compatibilité pour l'ancien champ beneficiary
    public String getBeneficiary() { 
        if (beneficiaries != null && !beneficiaries.isEmpty()) {
            try {
                // Retourner le premier bénéficiaire pour compatibilité
                return beneficiaries;
            } catch (Exception e) {
                return beneficiaries;
            }
        }
        return null;
    }
    
    public void setBeneficiary(String beneficiary) { 
        this.beneficiaries = beneficiary; // Pour compatibilité
    }

    // Méthode de compatibilité pour l'ancien champ insured
    public String getInsured() { 
        if (insureds != null && !insureds.isEmpty()) {
            try {
                // Retourner le premier assuré pour compatibilité
                return insureds;
            } catch (Exception e) {
                return insureds;
            }
        }
        return null;
    }
    
    public void setInsured(String insured) { 
        this.insureds = insured; // Pour compatibilité
    }

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


