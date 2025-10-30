package com.assurance.web;

import com.assurance.domain.CaseAttachment;
import com.assurance.domain.ReportFile;
import com.assurance.service.FileService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
// CORS géré par WebConfig.java
public class FileController {
    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // ===== UPLOAD DE FICHIERS =====

    @PostMapping(value = "/reports/{reportId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadReportFile(
            @PathVariable("reportId") Long reportId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "fileType", required = false) String fileType) {
        
        try {
            ReportFile uploadedFile = fileService.uploadReportFile(reportId, file, description, fileType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Fichier téléchargé avec succès");
            response.put("file", createFileResponse(uploadedFile));
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors du téléchargement du fichier: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping(value = "/cases/{caseId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadCaseAttachment(
            @PathVariable("caseId") Long caseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category) {
        
        try {
            CaseAttachment uploadedFile = fileService.uploadCaseAttachment(caseId, file, description, category);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pièce jointe téléchargée avec succès");
            response.put("file", createAttachmentResponse(uploadedFile));
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors du téléchargement de la pièce jointe: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ===== TÉLÉCHARGEMENT DE FICHIERS =====

    @GetMapping("/reports/{reportId}/files/{fileId}/download")
    public ResponseEntity<ByteArrayResource> downloadReportFile(
            @PathVariable("reportId") Long reportId,
            @PathVariable("fileId") Long fileId) {
        
        try {
            byte[] fileContent = fileService.downloadReportFile(fileId);
            ReportFile reportFile = fileService.getReportFiles(reportId).stream()
                    .filter(f -> f.getId().equals(fileId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Fichier introuvable"));
            
            ByteArrayResource resource = new ByteArrayResource(fileContent);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + reportFile.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(reportFile.getContentType()))
                    .contentLength(fileContent.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cases/{caseId}/attachments/{attachmentId}/download")
    public ResponseEntity<ByteArrayResource> downloadCaseAttachment(
            @PathVariable("caseId") Long caseId,
            @PathVariable("attachmentId") Long attachmentId) {
        
        try {
            byte[] fileContent = fileService.downloadCaseAttachment(attachmentId);
            CaseAttachment attachment = fileService.getCaseAttachments(caseId).stream()
                    .filter(a -> a.getId().equals(attachmentId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Pièce jointe introuvable"));
            
            ByteArrayResource resource = new ByteArrayResource(fileContent);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(attachment.getContentType()))
                    .contentLength(fileContent.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ===== LISTAGE DES FICHIERS =====

    @GetMapping("/reports/{reportId}/files")
    public ResponseEntity<Map<String, Object>> getReportFiles(@PathVariable("reportId") Long reportId) {
        try {
            List<ReportFile> files = fileService.getReportFiles(reportId);
            long fileCount = fileService.getReportFileCount(reportId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("files", files.stream().map(this::createFileResponse).toList());
            response.put("totalCount", fileCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des fichiers: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/cases/{caseId}/attachments")
    public ResponseEntity<Map<String, Object>> getCaseAttachments(@PathVariable("caseId") Long caseId) {
        try {
            List<CaseAttachment> attachments = fileService.getCaseAttachments(caseId);
            long attachmentCount = fileService.getCaseAttachmentCount(caseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attachments", attachments.stream().map(this::createAttachmentResponse).toList());
            response.put("totalCount", attachmentCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération des pièces jointes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ===== RECHERCHE DE FICHIERS =====

    @GetMapping("/reports/{reportId}/files/search")
    public ResponseEntity<Map<String, Object>> searchReportFiles(
            @PathVariable("reportId") Long reportId,
            @RequestParam("fileName") String fileName) {
        
        try {
            List<ReportFile> files = fileService.searchReportFiles(reportId, fileName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("files", files.stream().map(this::createFileResponse).toList());
            response.put("searchTerm", fileName);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la recherche: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/cases/{caseId}/attachments/search")
    public ResponseEntity<Map<String, Object>> searchCaseAttachments(
            @PathVariable("caseId") Long caseId,
            @RequestParam("fileName") String fileName) {
        
        try {
            List<CaseAttachment> attachments = fileService.searchCaseAttachments(caseId, fileName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attachments", attachments.stream().map(this::createAttachmentResponse).toList());
            response.put("searchTerm", fileName);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la recherche: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ===== FILTRAGE PAR TYPE/CATÉGORIE =====

    @GetMapping("/reports/{reportId}/files/type/{fileType}")
    public ResponseEntity<Map<String, Object>> getReportFilesByType(
            @PathVariable("reportId") Long reportId,
            @PathVariable("fileType") String fileType) {
        
        try {
            List<ReportFile> files = fileService.getReportFilesByType(reportId, fileType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("files", files.stream().map(this::createFileResponse).toList());
            response.put("fileType", fileType);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors du filtrage: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/cases/{caseId}/attachments/category/{category}")
    public ResponseEntity<Map<String, Object>> getCaseAttachmentsByCategory(
            @PathVariable("caseId") Long caseId,
            @PathVariable("category") String category) {
        
        try {
            List<CaseAttachment> attachments = fileService.getCaseAttachmentsByCategory(caseId, category);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attachments", attachments.stream().map(this::createAttachmentResponse).toList());
            response.put("category", category);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors du filtrage: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ===== SUPPRESSION DE FICHIERS =====

    @DeleteMapping("/reports/{reportId}/files/{fileId}")
    public ResponseEntity<Map<String, Object>> deleteReportFile(
            @PathVariable("reportId") Long reportId,
            @PathVariable("fileId") Long fileId) {
        
        try {
            fileService.deleteReportFile(fileId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Fichier supprimé avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/cases/{caseId}/attachments/{attachmentId}")
    public ResponseEntity<Map<String, Object>> deleteCaseAttachment(
            @PathVariable("caseId") Long caseId,
            @PathVariable("attachmentId") Long attachmentId) {
        
        try {
            fileService.deleteCaseAttachment(attachmentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pièce jointe supprimée avec succès");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ===== MÉTHODES UTILITAIRES =====

    private Map<String, Object> createFileResponse(ReportFile file) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", file.getId());
        response.put("fileName", file.getFileName());
        response.put("contentType", file.getContentType());
        response.put("sizeBytes", file.getSizeBytes());
        response.put("formattedSize", file.getFormattedSize());
        response.put("fileType", file.getFileType());
        response.put("fileExtension", file.getFileExtension());
        response.put("description", file.getDescription());
        response.put("category", file.getCategory());
        response.put("isPublic", file.getIsPublic());
        response.put("createdAt", file.getCreatedAt());
        response.put("updatedAt", file.getUpdatedAt());
        response.put("reportId", file.getReport().getId());
        return response;
    }

    private Map<String, Object> createAttachmentResponse(CaseAttachment attachment) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", attachment.getId());
        response.put("fileName", attachment.getFileName());
        response.put("contentType", attachment.getContentType());
        response.put("sizeBytes", attachment.getSizeBytes());
        response.put("formattedSize", attachment.getFormattedSize());
        response.put("fileType", attachment.getFileType());
        response.put("fileExtension", attachment.getFileExtension());
        response.put("description", attachment.getDescription());
        response.put("category", attachment.getCategory());
        response.put("isPublic", attachment.getIsPublic());
        response.put("createdAt", attachment.getCreatedAt());
        response.put("updatedAt", attachment.getUpdatedAt());
        response.put("caseId", attachment.getInsuranceCase().getId());
        return response;
    }
}
