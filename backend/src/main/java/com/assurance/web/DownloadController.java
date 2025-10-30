package com.assurance.web;

import com.assurance.domain.Report;
import com.assurance.domain.ReportFile;
import com.assurance.service.ReportService;
import com.assurance.service.FileService;
import com.assurance.service.ReportRequestService;
import com.assurance.service.NotificationService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/download")
// CORS géré par WebConfig.java
public class DownloadController {
    private final ReportService reportService;
    private final FileService fileService;
    private final ReportRequestService reportRequestService;
    private final NotificationService notificationService;

    public DownloadController(ReportService reportService, FileService fileService, 
                            ReportRequestService reportRequestService, NotificationService notificationService) {
        this.reportService = reportService;
        this.fileService = fileService;
        this.reportRequestService = reportRequestService;
        this.notificationService = notificationService;
    }

    // Endpoint sécurisé avec validation du code de validation (nouveau workflow)
    @GetMapping("/{reportId}")
    public ResponseEntity<ByteArrayResource> downloadSecured(
            @PathVariable("reportId") Long reportId,
            @RequestParam("validationCode") String validationCode) {
        
        try {
            // Valider le code de validation et marquer comme téléchargée
            var request = reportRequestService.validateCodeAndDownload(validationCode);
            
            // Vérifier que la demande correspond au bon rapport
            if (!request.getReportId().equals(reportId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ByteArrayResource("Code de validation invalide pour ce rapport".getBytes()));
            }

            // Récupérer le rapport
            Report report = reportService.findById(reportId);
            if (report == null) {
                return ResponseEntity.notFound().build();
            }

            // Récupérer les fichiers du rapport
            List<ReportFile> files = fileService.getReportFiles(reportId);
            if (files.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ByteArrayResource("Aucun fichier trouvé pour ce rapport".getBytes()));
            }

            // Prendre le premier fichier (ou le plus récent)
            ReportFile reportFile = files.get(0);

            // Télécharger le fichier
            byte[] fileContent = fileService.downloadReportFile(reportFile.getId());
            
            ByteArrayResource resource = new ByteArrayResource(fileContent);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + reportFile.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(reportFile.getContentType()))
                    .contentLength(fileContent.length)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ByteArrayResource(("Erreur lors du téléchargement: " + e.getMessage()).getBytes()));
        }
    }

    // Endpoint de démonstration (sans validation de code pour les tests)
    @GetMapping("/demo/{reportId}")
    public ResponseEntity<ByteArrayResource> downloadDemo(
            @PathVariable("reportId") Long reportId) {
        
        try {
            // Récupérer le rapport
            Report report = reportService.findById(reportId);
            if (report == null) {
                return ResponseEntity.notFound().build();
            }

            // Récupérer les fichiers du rapport
            List<ReportFile> files = fileService.getReportFiles(reportId);
            if (files.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ByteArrayResource("Aucun fichier trouvé pour ce rapport".getBytes()));
            }

            // Prendre le premier fichier (ou le plus récent)
            ReportFile reportFile = files.get(0);

            // Télécharger le fichier
            byte[] fileContent = fileService.downloadReportFile(reportFile.getId());
            
            ByteArrayResource resource = new ByteArrayResource(fileContent);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + reportFile.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(reportFile.getContentType()))
                    .contentLength(fileContent.length)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ByteArrayResource(("Erreur lors du téléchargement: " + e.getMessage()).getBytes()));
        }
    }

    // Télécharger tous les fichiers d'un rapport (réservé au propriétaire)
    @GetMapping("/reports/{reportId}/all")
    public ResponseEntity<ByteArrayResource> downloadAllReportFiles(
            @PathVariable("reportId") Long reportId,
            @RequestParam("owner") String ownerName) {
        try {
            // Vérifier l'existence du rapport
            Report report = reportService.findById(reportId);
            if (report == null) {
                return ResponseEntity.notFound().build();
            }

            // Vérifier le propriétaire
            String createdBy = report.getCreatedBy();
            if (createdBy == null || ownerName == null || !createdBy.equals(ownerName)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ByteArrayResource("Accès refusé: seul le propriétaire peut télécharger tous les fichiers".getBytes()));
            }

            // Récupérer tous les fichiers du rapport
            List<ReportFile> files = fileService.getReportFiles(reportId);
            if (files.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ByteArrayResource("Aucun fichier trouvé pour ce rapport".getBytes()));
            }

            // Créer une archive ZIP en mémoire
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);
            Set<String> usedNames = new HashSet<>();

            for (ReportFile file : files) {
                byte[] content = fileService.downloadReportFile(file.getId());

                // Éviter les conflits de noms dans l'archive
                String entryName = file.getFileName() != null ? file.getFileName() : ("file-" + file.getId());
                String baseName = entryName;
                String name = baseName;
                int duplicateIndex = 1;
                while (usedNames.contains(name)) {
                    // Insérer un suffixe avant l'extension si présente
                    int dot = baseName.lastIndexOf('.');
                    if (dot > 0) {
                        name = baseName.substring(0, dot) + " (" + duplicateIndex + ")" + baseName.substring(dot);
                    } else {
                        name = baseName + " (" + duplicateIndex + ")";
                    }
                    duplicateIndex++;
                }
                usedNames.add(name);

                ZipEntry entry = new ZipEntry(name);
                zos.putNextEntry(entry);
                zos.write(content);
                zos.closeEntry();
            }

            zos.finish();
            zos.close();

            byte[] zipBytes = baos.toByteArray();
            ByteArrayResource resource = new ByteArrayResource(zipBytes);

            String fileName = (report.getTitle() != null && !report.getTitle().isBlank() ? report.getTitle().trim().replaceAll("[\\r\\n]+", " ") : ("rapport-" + reportId)) + ".zip";

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .contentLength(zipBytes.length)
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ByteArrayResource(("Erreur lors de la création de l'archive: " + e.getMessage()).getBytes()));
        }
    }
}
