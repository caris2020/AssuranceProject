package com.assurance.repository;

import com.assurance.domain.RenewalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RenewalRequestRepository extends JpaRepository<RenewalRequest, Long> {
    
    /**
     * Trouve toutes les demandes en attente
     */
    List<RenewalRequest> findByStatusOrderByRequestDateDesc(RenewalRequest.Status status);
    
    /**
     * Trouve toutes les demandes d'un utilisateur
     */
    List<RenewalRequest> findByUserIdOrderByRequestDateDesc(Long userId);
    
    /**
     * Trouve la dernière demande en attente d'un utilisateur
     */
    @Query("SELECT r FROM RenewalRequest r WHERE r.user.id = :userId AND r.status = 'PENDING' ORDER BY r.requestDate DESC")
    RenewalRequest findLatestPendingRequestByUserId(@Param("userId") Long userId);
    
    /**
     * Compte les demandes en attente
     */
    long countByStatus(RenewalRequest.Status status);
    
    /**
     * Trouve toutes les demandes traitées par un administrateur
     */
    List<RenewalRequest> findByProcessedByIdOrderByProcessedDateDesc(Long adminId);
}
