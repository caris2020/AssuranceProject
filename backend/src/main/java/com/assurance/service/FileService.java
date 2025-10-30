package com.assurance.service;

import com.assurance.domain.*;
import com.assurance.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class FileService {
    private final ReportRepository reportRepository;
    private final ReportFileRepository reportFileRepository;
    private final InsuranceCaseRepository insuranceCaseRepository;
    private final CaseAttachmentRepository caseAttachmentRepository;
    private final CryptoService cryptoService;

    // Configuration
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final boolean ENABLE_ENCRYPTION = false; // Désactivé temporairement

    public FileService(ReportRepository reportRepository, 
                      ReportFileRepository reportFileRepository,
                      InsuranceCaseRepository insuranceCaseRepository,
                      CaseAttachmentRepository caseAttachmentRepository,
                      CryptoService cryptoService) {
        this.reportRepository = reportRepository;
        this.reportFileRepository = reportFileRepository;
        this.insuranceCaseRepository = insuranceCaseRepository;
        this.caseAttachmentRepository = caseAttachmentRepository;
        this.cryptoService = cryptoService;
    }

    // ===== GESTION DES FICHIERS DE RAPPORTS =====

    @Transactional
    public ReportFile uploadReportFile(Long reportId, MultipartFile file, String description, String fileType) throws IOException {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("Rapport introuvable avec l'ID: " + reportId));
        
        validateFile(file);
        
        // Si on remplace le fichier principal ou le fichier de prévisualisation,
        // supprimer d'abord les fichiers existants de cette catégorie
        if (fileType != null) {
            String category = fileType.trim().toLowerCase();
            List<ReportFile> existing = getReportFiles(reportId);
            for (ReportFile f : existing) {
                String existingCategory = f.getCategory() != null ? f.getCategory().toLowerCase() : "";
                boolean isPreviewDesc = f.getDescription() != null && f.getDescription().toLowerCase().contains("prévisualisation");
                if (("main".equals(category) && "main".equals(existingCategory)) ||
                    ("preview".equals(category) && ("preview".equals(existingCategory) || isPreviewDesc))) {
                    reportFileRepository.delete(f);
                }
            }
        }
        
        byte[] fileBytes = file.getBytes();
        ReportFile reportFile = new ReportFile(report, file.getOriginalFilename(), file.getContentType(), file.getSize());
        reportFile.setDescription(description);
        reportFile.setFileType(determineFileType(file.getOriginalFilename(), file.getContentType()));
        
        // Définir la catégorie du fichier (le paramètre fileType contient en fait la catégorie)
        reportFile.setCategory(fileType);
        
        // Marquer les fichiers de prévisualisation comme publics
        boolean isPreviewFile = "preview".equals(fileType) || 
                               (description != null && description.toLowerCase().contains("prévisualisation"));
        reportFile.setIsPublic(isPreviewFile);
        
        if (ENABLE_ENCRYPTION) {
            byte[] iv = cryptoService.randomIv();
            byte[] cipher = cryptoService.encrypt(iv, fileBytes);
            reportFile.setIv(iv);
            reportFile.setCipherText(cipher);
        } else {
            reportFile.setIv(new byte[16]);
            reportFile.setCipherText(fileBytes);
        }
        
        return reportFileRepository.save(reportFile);
    }

    @Transactional
    public CaseAttachment uploadCaseAttachment(Long caseId, MultipartFile file, String description, String category) throws IOException {
        InsuranceCase insuranceCase = insuranceCaseRepository.findById(caseId)
            .orElseThrow(() -> new IllegalArgumentException("Dossier introuvable avec l'ID: " + caseId));
        
        validateFile(file);
        
        byte[] fileBytes = file.getBytes();
        CaseAttachment attachment = new CaseAttachment(insuranceCase, file.getOriginalFilename(), file.getContentType(), file.getSize());
        attachment.setDescription(description);
        attachment.setCategory(category);
        attachment.setFileType(determineFileType(file.getOriginalFilename(), file.getContentType()));
        
        if (ENABLE_ENCRYPTION) {
            byte[] iv = cryptoService.randomIv();
            byte[] cipher = cryptoService.encrypt(iv, fileBytes);
            attachment.setIv(iv);
            attachment.setCipherText(cipher);
        } else {
            attachment.setIv(new byte[16]);
            attachment.setCipherText(fileBytes);
        }
        
        return caseAttachmentRepository.save(attachment);
    }

    // ===== TÉLÉCHARGEMENT DES FICHIERS =====

    public byte[] downloadReportFile(Long fileId) throws IOException {
        ReportFile reportFile = reportFileRepository.findById(fileId)
            .orElseThrow(() -> new IllegalArgumentException("Fichier introuvable avec l'ID: " + fileId));
        
        if (ENABLE_ENCRYPTION) {
            return cryptoService.decrypt(reportFile.getIv(), reportFile.getCipherText());
        } else {
            return reportFile.getCipherText();
        }
    }

    public byte[] downloadCaseAttachment(Long attachmentId) throws IOException {
        CaseAttachment attachment = caseAttachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new IllegalArgumentException("Pièce jointe introuvable avec l'ID: " + attachmentId));
        
        if (ENABLE_ENCRYPTION) {
            return cryptoService.decrypt(attachment.getIv(), attachment.getCipherText());
        } else {
            return attachment.getCipherText();
        }
    }

    // ===== RECHERCHE ET LISTAGE =====

    public List<ReportFile> getReportFiles(Long reportId) {
        return reportFileRepository.findByReportIdOrderByCreatedAtDesc(reportId);
    }

    public List<CaseAttachment> getCaseAttachments(Long caseId) {
        return caseAttachmentRepository.findByInsuranceCaseIdOrderByCreatedAtDesc(caseId);
    }

    public List<ReportFile> searchReportFiles(Long reportId, String fileName) {
        return reportFileRepository.findByReportIdAndFileNameContainingIgnoreCase(reportId, fileName);
    }

    public List<CaseAttachment> searchCaseAttachments(Long caseId, String fileName) {
        return caseAttachmentRepository.findByCaseIdAndFileNameContainingIgnoreCase(caseId, fileName);
    }

    public List<ReportFile> getReportFilesByType(Long reportId, String fileType) {
        return reportFileRepository.findByReportIdAndFileTypeOrderByCreatedAtDesc(reportId, fileType);
    }

    public List<CaseAttachment> getCaseAttachmentsByCategory(Long caseId, String category) {
        return caseAttachmentRepository.findByInsuranceCaseIdAndCategoryOrderByCreatedAtDesc(caseId, category);
    }

    // ===== SUPPRESSION =====

    @Transactional
    public void deleteReportFile(Long fileId) {
        ReportFile reportFile = reportFileRepository.findById(fileId)
            .orElseThrow(() -> new IllegalArgumentException("Fichier introuvable avec l'ID: " + fileId));
        reportFileRepository.delete(reportFile);
    }

    @Transactional
    public void deleteCaseAttachment(Long attachmentId) {
        CaseAttachment attachment = caseAttachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new IllegalArgumentException("Pièce jointe introuvable avec l'ID: " + attachmentId));
        caseAttachmentRepository.delete(attachment);
    }

    // ===== MÉTHODES UTILITAIRES =====

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier manquant ou vide");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Le fichier est trop volumineux. Taille maximale: " + (MAX_FILE_SIZE / 1024 / 1024) + "MB");
        }
        
        // Vérifier les types de fichiers autorisés
        String fileName = file.getOriginalFilename();
        if (fileName != null && !isAllowedFileType(fileName)) {
            throw new IllegalArgumentException("Type de fichier non autorisé: " + fileName);
        }
    }

    private String determineFileType(String fileName, String contentType) {
        if (fileName == null) return "unknown";
        
        String extension = "";
        if (fileName.contains(".")) {
            extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        }
        
        // Déterminer le type basé sur l'extension
        switch (extension) {
            case "pdf": return "pdf";
            case "doc":
            case "docx": return "document";
            case "jpg":
            case "jpeg":
            case "png":
            case "gif": return "image";
            case "xls":
            case "xlsx": return "spreadsheet";
            case "txt": return "text";
            default: return "other";
        }
    }

    private boolean isAllowedFileType(String fileName) {
        if (fileName == null) return false;
        
        String extension = "";
        if (fileName.contains(".")) {
            extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        }
        
        // Types de fichiers autorisés
        String[] allowedExtensions = {"pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "xls", "xlsx", "txt"};
        
        for (String allowed : allowedExtensions) {
            if (allowed.equals(extension)) {
                return true;
            }
        }
        
        return false;
    }

    // ===== STATISTIQUES =====

    public long getReportFileCount(Long reportId) {
        return reportFileRepository.countByReportId(reportId);
    }

    public long getCaseAttachmentCount(Long caseId) {
        return caseAttachmentRepository.countByInsuranceCaseId(caseId);
    }

    public List<ReportFile> getRecentReportFiles(Long reportId) {
        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
        return reportFileRepository.findRecentFilesByReportId(reportId, thirtyDaysAgo);
    }

    public List<CaseAttachment> getRecentCaseAttachments(Long caseId) {
        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
        return caseAttachmentRepository.findRecentAttachmentsByCaseId(caseId, thirtyDaysAgo);
    }
}
