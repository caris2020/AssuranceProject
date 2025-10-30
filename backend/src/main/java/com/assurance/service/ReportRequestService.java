package com.assurance.service;

import com.assurance.entity.ReportRequest;
import com.assurance.repository.ReportRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class ReportRequestService {
    
    @Autowired
    private ReportRequestRepository repository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ReportService reportService;
    
    /**
     * Crée une nouvelle demande de rapport
     */
    public ReportRequest createReportRequest(Long reportId, String reportTitle, String requesterId,
                                           String requesterName, String requesterEmail, String requesterCompany,
                                           String requesterPhone, String reason) {
        
        // Vérifier s'il n'y a pas déjà une demande en attente
        if (repository.existsByRequesterIdAndReportIdAndStatus(
                requesterId, reportId, ReportRequest.ReportRequestStatus.PENDING)) {
            throw new IllegalStateException("Une demande de rapport est déjà en attente pour ce rapport");
        }
        
        ReportRequest request = new ReportRequest(reportId, reportTitle, requesterId, 
                                                requesterName, requesterEmail, requesterCompany, requesterPhone, reason);
        
        ReportRequest savedRequest = repository.save(request);
        
        // Récupérer le propriétaire du rapport
        String ownerName = getReportOwner(reportId);
        
        // Envoyer notification au propriétaire du rapport
        notificationService.sendReportRequestToOwner(ownerName, requesterName, requesterCompany, 
                                                    requesterEmail, requesterPhone, reportTitle, reason);
        
        // Envoyer confirmation au demandeur
        notificationService.sendReportRequestConfirmation(requesterName, requesterEmail, 
                                                         requesterPhone, reportTitle, ownerName);
        
        return savedRequest;
    }
    
    /**
     * Approuve une demande de rapport et génère un code de validation
     */
    public ReportRequest approveRequest(Long requestId, String processedBy) {
        ReportRequest request = repository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Demande de rapport non trouvée"));
        
        if (!request.isPending()) {
            throw new IllegalStateException("Cette demande ne peut plus être approuvée");
        }
        
        // Générer un code de validation
        String validationCode = generateValidationCode();
        
        // Approuver la demande
        request.approve(processedBy, validationCode);
        ReportRequest approvedRequest = repository.save(request);
        
        // Envoyer le code par notifications multi-canal
        notificationService.sendValidationCode(request.getRequesterName(), request.getRequesterEmail(), 
                                              request.getRequesterPhone(), request.getReportTitle(), 
                                              validationCode, request.getExpiresAt());
        
        return approvedRequest;
    }
    
    /**
     * Rejette une demande de rapport
     */
    public ReportRequest rejectRequest(Long requestId, String processedBy) {
        ReportRequest request = repository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Demande de rapport non trouvée"));
        
        if (!request.isPending()) {
            throw new IllegalStateException("Cette demande ne peut plus être rejetée");
        }
        
        request.reject(processedBy);
        ReportRequest rejectedRequest = repository.save(request);
        
        // TODO: Envoyer notification de rejet au demandeur
        // notificationService.sendReportRequestRejected(rejectedRequest);
        
        return rejectedRequest;
    }
    
    /**
     * Valide un code de validation et marque la demande comme téléchargée
     */
    public ReportRequest validateCodeAndDownload(String validationCode) {
        ReportRequest request = repository.findByValidationCode(validationCode)
                .orElseThrow(() -> new IllegalArgumentException("Code de validation invalide"));
        
        // Accepter les demandes APPROVED ou DOWNLOADED (pour permettre plusieurs téléchargements)
        if (!request.isApproved() && !request.isDownloaded()) {
            throw new IllegalStateException("Cette demande n'est pas approuvée");
        }
        
        if (request.isExpired()) {
            throw new IllegalStateException("Ce code de validation a expiré");
        }
        
        // Marquer comme téléchargée seulement si ce n'est pas déjà fait
        if (!request.isDownloaded()) {
            request.markAsDownloaded();
            ReportRequest downloadedRequest = repository.save(request);
            
            // Récupérer le propriétaire du rapport
            String ownerName = getReportOwner(request.getReportId());
            
            // Envoyer notification de téléchargement au propriétaire
            notificationService.sendDownloadNotification(ownerName, request.getRequesterName(), request.getReportTitle());
            
            return downloadedRequest;
        }
        
        // Si déjà téléchargée, retourner la demande sans modification
        return request;
    }
    
    /**
     * Récupère les demandes en attente pour un propriétaire de rapport
     */
    public List<ReportRequest> getPendingRequestsForOwner(String ownerId) {
        return repository.findPendingRequestsForOwner(ownerId);
    }
    
    /**
     * Récupère toutes les demandes pour un propriétaire de rapport
     */
    public List<ReportRequest> getRequestsForOwner(String ownerId) {
        return repository.findRequestsForOwner(ownerId);
    }
    
    /**
     * Compte le nombre de demandes en attente pour un propriétaire de rapport
     */
    public long countPendingRequestsForOwner(String ownerId) {
        return repository.countPendingRequestsForOwner(ownerId);
    }
    
    /**
     * Récupère toutes les demandes d'un utilisateur
     */
    public List<ReportRequest> getUserRequests(String userId) {
        return repository.findByRequesterIdOrderByRequestedAtDesc(userId);
    }
    
    /**
     * Récupère toutes les demandes pour un rapport
     */
    public List<ReportRequest> getReportRequests(Long reportId) {
        return repository.findByReportIdOrderByRequestedAtDesc(reportId);
    }
    
    /**
     * Récupère une demande par son ID
     */
    public Optional<ReportRequest> getRequestById(Long requestId) {
        return repository.findById(requestId);
    }
    
    /**
     * Récupère les demandes approuvées d'un utilisateur
     */
    public List<ReportRequest> getApprovedUserRequests(String userId) {
        return repository.findByRequesterIdAndStatusOrderByRequestedAtDesc(
                userId, ReportRequest.ReportRequestStatus.APPROVED);
    }
    
    /**
     * Vérifie si un utilisateur a une demande approuvée pour un rapport
     */
    public Optional<ReportRequest> getApprovedRequest(String userId, Long reportId) {
        return repository.findByRequesterIdAndReportIdAndStatus(
                userId, reportId, ReportRequest.ReportRequestStatus.APPROVED);
    }
    
    /**
     * Récupère les demandes urgentes (en attente depuis plus de 2h)
     */
    public List<ReportRequest> getUrgentRequests() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(2);
        return repository.findUrgentRequests(threshold);
    }
    
    /**
     * Récupère les demandes récentes (dernières 24h)
     */
    public List<ReportRequest> getRecentRequests() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return repository.findRecentRequests(since);
    }
    
    /**
     * Récupère les demandes expirées
     */
    public List<ReportRequest> getExpiredRequests() {
        return repository.findExpiredRequests(LocalDateTime.now());
    }
    
    /**
     * Compte le nombre de demandes en attente
     */
    public long countPendingRequests() {
        return repository.countByStatus(ReportRequest.ReportRequestStatus.PENDING);
    }
    
    /**
     * Compte le nombre total de demandes
     */
    public long count() {
        return repository.count();
    }
    
    /**
     * Compte le nombre de demandes d'un utilisateur
     */
    public long countUserRequests(String userId) {
        return repository.countByRequesterId(userId);
    }
    
    /**
     * Supprime une demande (seulement si elle est en attente)
     */
    public void deleteRequest(Long requestId) {
        ReportRequest request = repository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Demande de rapport non trouvée"));
        
        if (!request.isPending()) {
            throw new IllegalStateException("Seules les demandes en attente peuvent être supprimées");
        }
        
        repository.delete(request);
    }
    
    /**
     * Récupère une demande par son code de validation
     */
    public Optional<ReportRequest> findByValidationCode(String validationCode) {
        return repository.findByValidationCode(validationCode);
    }
    
    /**
     * Génère un code de validation unique
     */
    private String generateValidationCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        
        // Générer un code de 8 caractères alphanumériques
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return code.toString();
    }
    
    /**
     * Récupère le propriétaire d'un rapport
     */
    private String getReportOwner(Long reportId) {
        try {
            // Récupérer le rapport depuis le service
            var report = reportService.findById(reportId);
            if (report != null) {
                return report.getCreatedBy();
            }
            return "admin"; // Fallback si le rapport n'existe pas
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération du propriétaire du rapport: " + e.getMessage());
            return "admin"; // Fallback
        }
    }
}
