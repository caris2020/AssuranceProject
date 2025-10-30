package com.assurance.web;

import com.assurance.domain.InsuranceCase;
// import com.assurance.domain.Report; // TEMPORAIRE: Désactivé
import com.assurance.repo.ReportRepository;
import com.assurance.repo.InsuranceCaseRepository;
import com.assurance.service.CaseService;
import com.assurance.service.InAppNotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/cases")
// CORS géré par WebConfig.java
    public class CaseController {
        private final CaseService caseService;
        private final ReportRepository reportRepository;
        private final InsuranceCaseRepository insuranceCaseRepository;
        private final InAppNotificationService notificationService;

        public CaseController(CaseService caseService, ReportRepository reportRepository, InsuranceCaseRepository insuranceCaseRepository, InAppNotificationService notificationService) {
			this.caseService = caseService;
			this.reportRepository = reportRepository;
			this.insuranceCaseRepository = insuranceCaseRepository;
            this.notificationService = notificationService;
		}

    @GetMapping
    public List<InsuranceCase> list(@RequestParam(required = false) String creator) { 
        if (creator != null && !creator.trim().isEmpty()) {
            return caseService.listByCreator(creator);
        }
        return caseService.list(); 
    }

    @GetMapping("/my-cases")
    public List<InsuranceCase> myCases(@RequestParam String actorName) {
        return caseService.listByCreator(actorName);
    }

    @GetMapping("/{id}/permissions")
    public Map<String, Boolean> getPermissions(@PathVariable Long id, @RequestParam String actorName) {
        Map<String, Boolean> permissions = new HashMap<>();
        permissions.put("canEdit", caseService.canEdit(id, actorName));
        permissions.put("canDelete", caseService.canDelete(id, actorName));
        return permissions;
    }

    @GetMapping("/reference/{reference}")
    public InsuranceCase findByReference(@PathVariable String reference) {
        // Nettoyer la référence en supprimant les espaces
        String cleanReference = reference.trim();
        return insuranceCaseRepository.findByReference(cleanReference)
            .orElseThrow(() -> new IllegalArgumentException("Dossier non trouvé avec la référence: " + cleanReference));
    }

    	@PostMapping
	public InsuranceCase create(@RequestBody InsuranceCase item, @RequestParam String actorName, @RequestParam(required = false) Long reportId) {
		// Validation de l'actorName
		if (actorName == null || actorName.trim().isEmpty()) {
			throw new IllegalArgumentException("Le paramètre actorName est obligatoire et ne peut pas être vide");
		}
		
		// TEMPORAIRE: Désactiver la liaison avec les rapports pour éviter les erreurs LOB
		// if (reportId != null) {
		//     Report report = reportRepository.findById(reportId).orElseThrow();
		//     item.setReport(report);
		// }
		return caseService.create(item, actorName.trim());
	}

    @PutMapping("/{id}")
    public InsuranceCase update(@PathVariable Long id, @RequestBody InsuranceCase updateData, @RequestParam String actorName) {
        System.out.println("=== APPEL DU PUT /cases/" + id + " PAR : " + actorName + ", NOUVEAU STATUS : " + (updateData.getStatus() != null ? updateData.getStatus() : "null"));
        InsuranceCase existingCase = insuranceCaseRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Dossier non trouvé avec l'ID: " + id));
        
        // Vérifier que seul le créateur peut modifier le dossier
        if (!existingCase.getCreatedBy().equals(actorName)) {
            throw new IllegalArgumentException("Seul le créateur du dossier peut le modifier");
        }
        
        // Mettre à jour les champs autorisés
        InsuranceCase.CaseStatus oldStatus = existingCase.getStatus();
        if (updateData.getStatus() != null) {
            existingCase.setStatus(updateData.getStatus());
        }
        if (updateData.getDataJson() != null) {
            existingCase.setDataJson(updateData.getDataJson());
        }

        InsuranceCase saved = insuranceCaseRepository.save(existingCase);

        // Envoyer une notification si le statut a changé
        try {
            InsuranceCase.CaseStatus newStatus = saved.getStatus();
            if (oldStatus != null && newStatus != null && oldStatus != newStatus) {
                System.out.println("Changement réellement détecté sur le statut : " + oldStatus + " → " + newStatus);
                // Extraire un titre lisible: essayer dataJson.title ou caseTitle, sinon utiliser la référence
                String caseTitle = saved.getReference();
                try {
                    String json = saved.getDataJson();
                    if (json != null && !json.isBlank()) {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode node = mapper.readTree(json);
                        JsonNode titleNode = node.get("title");
                        if (titleNode == null || titleNode.asText().isBlank()) {
                            titleNode = node.get("caseTitle");
                        }
                        if (titleNode != null && !titleNode.asText().isBlank()) {
                            caseTitle = titleNode.asText();
                        }
                    }
                } catch (Exception ignore) {}

                java.util.Map<String, Object> notificationData = new java.util.HashMap<>();
                notificationData.put("title", "📁 Statut du dossier mis à jour");
                notificationData.put("message", "Le dossier \"" + caseTitle + "\" est passé de " + oldStatus + " à " + newStatus + ".");
                notificationData.put("type", "CASE_STATUS_CHANGED");
                notificationData.put("action", "VIEW_CASE");
                notificationData.put("url", "/dossiers");
                notificationData.put("caseId", saved.getId());
                notificationData.put("caseReference", saved.getReference());
                notificationData.put("caseTitle", caseTitle);

                System.out.println("==== DEBUG NOTIF STATUT ====");
                System.out.println("Acteur ayant changé le statut: " + actorName);
                System.out.println("CaseId: " + saved.getId() + ", Ancien statut: " + oldStatus + ", Nouveau statut: " + saved.getStatus());
                System.out.println("NotificationData: " + notificationData);
                System.out.println("Appel de sendNotificationToAllUsersExcluding...");
                // Notifier uniquement les utilisateurs actifs connectés au moins une fois, en excluant l'acteur
                notificationService.sendNotificationToAllUsersExcluding(actorName, notificationData);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de la notification de changement de statut: " + e.getMessage());
        }

        return saved;
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id, @RequestParam String actorName) {
        InsuranceCase existingCase = insuranceCaseRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Dossier non trouvé avec l'ID: " + id));
        
        // Vérifier que seul le créateur peut supprimer le dossier
        if (!existingCase.getCreatedBy().equals(actorName)) {
            throw new IllegalArgumentException("Seul le créateur du dossier peut le supprimer");
        }
        
        // Sauvegarder la référence avant la suppression pour la notification
        String caseReference = existingCase.getReference();
        
        		insuranceCaseRepository.delete(existingCase);
		return "Dossier supprimé avec succès";
    }

    @PostMapping("/cleanup-duplicates")
    public String cleanupDuplicates() {
        int deletedCount = caseService.cleanupDuplicateCases();
        return "Nettoyage terminé. " + deletedCount + " dossiers dupliqués supprimés.";
    }
}


