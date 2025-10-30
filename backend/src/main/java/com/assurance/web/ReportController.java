package com.assurance.web;

import com.assurance.domain.Report;
import com.assurance.domain.ReportFile;
import com.assurance.service.ReportService;
import com.assurance.service.FileService;
import com.assurance.web.dto.ReportDto;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.assurance.repo.InsuranceCaseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
// CORS géré par WebConfig.java
public class ReportController {
    private final ReportService reportService;
    private final FileService fileService;
    private final InsuranceCaseRepository insuranceCaseRepository;
    private final com.assurance.repository.UserRepository userRepository;
    
    public ReportController(ReportService reportService, FileService fileService, InsuranceCaseRepository insuranceCaseRepository, com.assurance.repository.UserRepository userRepository) { 
        this.reportService = reportService; 
        this.fileService = fileService;
        this.insuranceCaseRepository = insuranceCaseRepository; 
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<ReportDto> list() {
        return reportService.list().stream().map(r -> {
            ReportDto dto = ReportDto.from(r);
            // Ajouter le logo du propriétaire si disponible
            try {
                com.assurance.repository.UserRepository userRepo = (com.assurance.repository.UserRepository) new org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor().getEarlyBeanReference(null, "userRepository");
            } catch (Exception ignored) {}
            // Ajouter le logo du propriétaire si disponible
            try {
                dto.ownerLogo = userRepository.findByUsername(r.getCreatedBy()).map(u -> u.getCompanyLogo()).orElse(null);
            } catch (Exception ignored) {}
            // TEMPORAIRE: Désactiver la recherche par rapport pour éviter les erreurs LOB
            // insuranceCaseRepository.findTopByReportOrderByCreatedAtDesc(r).ifPresent(ic -> {
            //     dto.caseReference = ic.getReference();
            //     // caseCode optionnel: si vous calculez un code différent côté backend, mappez-le ici
            //     dto.caseCode = ic.getReference();
            // });
            return dto;
        }).toList();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Report payload, @RequestParam(defaultValue = "false") boolean hasFile, @RequestParam String createdBy) {
        try {
            System.out.println("Création de rapport - hasFile: " + hasFile);
            Report createdReport = reportService.create(payload, createdBy);
            
            // TEMPORAIRE: Désactiver la liaison avec les dossiers pour éviter les erreurs LOB
            // Si un caseId est fourni, essayer de lier le rapport au dossier
            // if (payload.getCaseId() != null) {
            //     try {
            //         // Essayer d'abord comme ID numérique
            //         Long caseId = Long.parseLong(payload.getCaseId());
            //         insuranceCaseRepository.findById(caseId).ifPresent(case_ -> {
            //             case_.setReport(createdReport);
            //             insuranceCaseRepository.save(case_);
            //         });
            //     } catch (NumberFormatException e) {
            //         // Si ce n'est pas un nombre, essayer comme code de référence
            //         insuranceCaseRepository.findByReference(payload.getCaseId()).ifPresent(case_ -> {
            //             case_.setReport(createdReport);
            //             insuranceCaseRepository.save(case_);
            //         });
            //     }
            // }
            
            return ResponseEntity.ok(ReportDto.from(createdReport));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erreur interne du serveur: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ReportDto update(@PathVariable("id") Long id, @RequestBody Report payload) {
        Report existingReport = reportService.findById(id);
        if (existingReport == null) {
            throw new IllegalArgumentException("Rapport introuvable");
        }
        
        // Mettre à jour les champs
        existingReport.setTitle(payload.getTitle());
        existingReport.setStatus(payload.getStatus());
        existingReport.setBeneficiary(payload.getBeneficiary());
        existingReport.setInitiator(payload.getInitiator());
        existingReport.setInsured(payload.getInsured());
        existingReport.setSubscriber(payload.getSubscriber());
        existingReport.setCaseId(payload.getCaseId());
        
        Report updatedReport = reportService.update(existingReport);
        
        // TEMPORAIRE: Désactiver la liaison avec les dossiers pour éviter les erreurs LOB
        // Si un caseId est fourni, lier le rapport au dossier
        // if (payload.getCaseId() != null) {
        //     try {
        //         Long caseId = Long.parseLong(payload.getCaseId());
        //         insuranceCaseRepository.findById(caseId).ifPresent(case_ -> {
        //             case_.setReport(updatedReport);
        //             insuranceCaseRepository.save(case_);
        //         });
        //     } catch (NumberFormatException e) {
        //         // Ignorer si le caseId n'est pas un nombre valide
        //     }
        // }
        
        return ReportDto.from(updatedReport);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        Report existingReport = reportService.findById(id);
        if (existingReport == null) {
            return ResponseEntity.notFound().build();
        }
        
        reportService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Aperçu inline: renvoie les premiers octets du fichier s'il existe (ou 204 si absent)
    @GetMapping("/{id}/preview")
    public ResponseEntity<byte[]> preview(@PathVariable("id") Long id) {
        return ResponseEntity.status(501).body("Preview non implémenté côté fichier".getBytes());
    }

    // Endpoint pour prévisualiser un fichier spécifique d'un rapport
    @GetMapping("/{reportId}/files/{fileId}/preview")
    public ResponseEntity<byte[]> previewFile(@PathVariable("reportId") Long reportId, @PathVariable("fileId") Long fileId) {
        try {
            // Vérifier que le rapport existe
            Report report = reportService.findById(reportId);
            if (report == null) {
                return ResponseEntity.notFound().build();
            }

            // Récupérer le fichier via le FileService
            byte[] fileContent = fileService.downloadReportFile(fileId);
            
            // Récupérer les métadonnées du fichier pour définir le Content-Type
            var reportFiles = fileService.getReportFiles(reportId);
            var targetFile = reportFiles.stream()
                .filter(f -> f.getId().equals(fileId))
                .findFirst();
            
            if (targetFile.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ReportFile file = targetFile.get();
            
            // Définir les headers appropriés
            HttpHeaders headers = new HttpHeaders();
            if (file.getContentType() != null) {
                headers.setContentType(MediaType.parseMediaType(file.getContentType()));
            } else {
                // Fallback basé sur l'extension du fichier
                String fileName = file.getFileName().toLowerCase();
                if (fileName.endsWith(".pdf")) {
                    headers.setContentType(MediaType.APPLICATION_PDF);
                } else if (fileName.endsWith(".png")) {
                    headers.setContentType(MediaType.IMAGE_PNG);
                } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                    headers.setContentType(MediaType.IMAGE_JPEG);
                } else if (fileName.endsWith(".gif")) {
                    headers.setContentType(MediaType.IMAGE_GIF);
                } else if (fileName.endsWith(".txt")) {
                    headers.setContentType(MediaType.TEXT_PLAIN);
                } else {
                    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                }
            }
            
            // Pour la prévisualisation, on affiche inline plutôt qu'en téléchargement
            headers.set("Content-Disposition", "inline; filename=\"" + file.getFileName() + "\"");
            headers.setContentLength(fileContent.length);
            
            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de la prévisualisation du fichier: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint pour récupérer les permissions d'un utilisateur sur un rapport
    @GetMapping("/{id}/permissions")
    public ResponseEntity<Map<String, Boolean>> getPermissions(@PathVariable("id") Long id, @RequestParam String userName) {
        boolean canEdit = reportService.canEditReport(id, userName);
        boolean canDelete = reportService.canDeleteReport(id, userName);
        
        return ResponseEntity.ok(Map.of(
            "canEdit", canEdit,
            "canDelete", canDelete
        ));
    }
}


