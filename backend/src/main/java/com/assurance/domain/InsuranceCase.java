package com.assurance.domain;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "insurance_cases")
public class InsuranceCase {
    public enum CaseType { ENQUETE, FRAUDULEUX }
    public enum CaseStatus { SOUS_ENQUETE, FRAUDULEUX, PREUVE_INSUFFISANTE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Référence métier alphanumérique (unique)
    @Column(nullable = false, unique = true, length = 24)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status;

    // @Lob // TEMPORAIRE: Supprimé pour éviter les erreurs LOB
    // @Basic(fetch = FetchType.LAZY) // TEMPORAIRE: Supprimé pour éviter les erreurs LOB
    @Column(columnDefinition = "TEXT")
    private String dataJson;

    // TEMPORAIRE: Désactiver la relation avec Report pour éviter les erreurs LOB
    // @ManyToOne(fetch = FetchType.LAZY)
    // private Report report;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private String createdBy;

    // Relation avec les fichiers attachés (suppression en cascade)
    @OneToMany(mappedBy = "insuranceCase", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore // Exclure de la sérialisation JSON pour éviter les erreurs de lazy loading
    private List<CaseAttachment> attachments = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (createdBy == null || createdBy.trim().isEmpty()) createdBy = "system";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public CaseType getType() { return type; }
    public void setType(CaseType type) { this.type = type; }

    public CaseStatus getStatus() { return status; }
    public void setStatus(CaseStatus status) { this.status = status; }

    public String getDataJson() { return dataJson; }
    public void setDataJson(String dataJson) { this.dataJson = dataJson; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public List<CaseAttachment> getAttachments() { return attachments; }
    public void setAttachments(List<CaseAttachment> attachments) { this.attachments = attachments; }

    // TEMPORAIRE: Désactiver les getters/setters pour Report
    // public Report getReport() { return report; }
    // public void setReport(Report report) { this.report = report; }
}


