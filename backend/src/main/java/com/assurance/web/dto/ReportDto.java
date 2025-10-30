package com.assurance.web.dto;

import com.assurance.domain.Report;

import java.time.Instant;

public class ReportDto {
    public Long id;
    public String title;
    public String status;
    public String beneficiary;
    public String initiator;
    public String insured;
    public String subscriber;
    public String createdBy; // Nom de l'utilisateur qui a créé le rapport
    public String ownerLogo; // Logo compagnie du propriétaire
    public Instant createdAt;
    public String caseReference;
    public String caseCode; // affichage front

    	public static ReportDto from(Report r) {
		ReportDto dto = new ReportDto();
		dto.id = r.getId();
		dto.title = r.getTitle();
		dto.status = r.getStatus() == null ? null : r.getStatus().name();
		dto.beneficiary = r.getBeneficiary();
		dto.initiator = r.getInitiator();
		dto.insured = r.getInsured();
		dto.subscriber = r.getSubscriber();
		dto.createdBy = r.getCreatedBy();
		dto.createdAt = r.getCreatedAt();
		// Mapper le caseId vers caseCode pour l'affichage frontend
		dto.caseCode = r.getCaseId();
		dto.caseReference = r.getCaseId();
		return dto;
	}
}


