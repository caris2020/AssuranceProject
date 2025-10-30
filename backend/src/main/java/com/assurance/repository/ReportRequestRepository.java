package com.assurance.repository;

import com.assurance.entity.ReportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRequestRepository extends JpaRepository<ReportRequest, Long> {
    
    /**
     * Trouve toutes les demandes en attente pour un propriétaire de rapport
     */
    @Query("SELECT rr FROM ReportRequest rr WHERE rr.status = 'PENDING' AND rr.reportId IN (SELECT r.id FROM com.assurance.domain.Report r WHERE r.createdBy = :ownerId) ORDER BY rr.requestedAt DESC")
    List<ReportRequest> findPendingRequestsForOwner(@Param("ownerId") String ownerId);
    
    /**
     * Trouve toutes les demandes pour un propriétaire de rapport
     */
    @Query("SELECT rr FROM ReportRequest rr WHERE rr.reportId IN (SELECT r.id FROM com.assurance.domain.Report r WHERE r.createdBy = :ownerId) ORDER BY rr.requestedAt DESC")
    List<ReportRequest> findRequestsForOwner(@Param("ownerId") String ownerId);
    
    /**
     * Compte le nombre de demandes en attente pour un propriétaire de rapport
     */
    @Query("SELECT COUNT(rr) FROM ReportRequest rr WHERE rr.status = 'PENDING' AND rr.reportId IN (SELECT r.id FROM com.assurance.domain.Report r WHERE r.createdBy = :ownerId)")
    long countPendingRequestsForOwner(@Param("ownerId") String ownerId);
    
    /**
     * Trouve toutes les demandes d'un utilisateur
     */
    List<ReportRequest> findByRequesterIdOrderByRequestedAtDesc(String requesterId);
    
    /**
     * Trouve toutes les demandes pour un rapport
     */
    List<ReportRequest> findByReportIdOrderByRequestedAtDesc(Long reportId);
    
    /**
     * Trouve une demande par son ID
     */
    Optional<ReportRequest> findById(Long id);
    
    /**
     * Trouve les demandes approuvées d'un utilisateur
     */
    List<ReportRequest> findByRequesterIdAndStatusOrderByRequestedAtDesc(String requesterId, ReportRequest.ReportRequestStatus status);
    
    /**
     * Vérifie s'il existe une demande en attente pour un utilisateur et un rapport
     */
    boolean existsByRequesterIdAndReportIdAndStatus(String requesterId, Long reportId, ReportRequest.ReportRequestStatus status);
    
    /**
     * Trouve une demande par utilisateur, rapport et statut
     */
    Optional<ReportRequest> findByRequesterIdAndReportIdAndStatus(String requesterId, Long reportId, ReportRequest.ReportRequestStatus status);
    
    /**
     * Trouve une demande par code de validation
     */
    Optional<ReportRequest> findByValidationCode(String validationCode);
    
    /**
     * Trouve les demandes expirées
     */
    @Query("SELECT rr FROM ReportRequest rr WHERE rr.status = 'APPROVED' AND rr.expiresAt < :now")
    List<ReportRequest> findExpiredRequests(@Param("now") LocalDateTime now);
    
    /**
     * Trouve les demandes récentes (dernières 24h)
     */
    @Query("SELECT rr FROM ReportRequest rr WHERE rr.requestedAt >= :since ORDER BY rr.requestedAt DESC")
    List<ReportRequest> findRecentRequests(@Param("since") LocalDateTime since);
    
    /**
     * Trouve les demandes urgentes (demandes en attente depuis plus de 2h)
     */
    @Query("SELECT rr FROM ReportRequest rr WHERE rr.status = 'PENDING' AND rr.requestedAt <= :threshold ORDER BY rr.requestedAt ASC")
    List<ReportRequest> findUrgentRequests(@Param("threshold") LocalDateTime threshold);
    
    /**
     * Compte le nombre total de demandes
     */
    long count();
    
    /**
     * Compte le nombre de demandes par statut
     */
    long countByStatus(ReportRequest.ReportRequestStatus status);
    
    /**
     * Compte le nombre de demandes d'un utilisateur
     */
    long countByRequesterId(String requesterId);
}
