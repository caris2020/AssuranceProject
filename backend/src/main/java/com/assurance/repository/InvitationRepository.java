package com.assurance.repository;

import com.assurance.domain.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    
    Optional<Invitation> findByToken(String token);
    
    Optional<Invitation> findByEmail(String email);
    
    List<Invitation> findByStatus(Invitation.InvitationStatus status);
    
    List<Invitation> findByInvitedBy(String invitedBy);
    
    @Query("SELECT i FROM Invitation i WHERE i.status = 'PENDING' AND i.expiresAt > :now ORDER BY i.createdAt DESC")
    List<Invitation> findValidPendingInvitations(@Param("now") LocalDateTime now);
    
    @Query("SELECT i FROM Invitation i WHERE i.status = 'PENDING' AND i.expiresAt <= :now ORDER BY i.createdAt DESC")
    List<Invitation> findExpiredInvitations(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(i) FROM Invitation i WHERE i.status = :status")
    long countByStatus(@Param("status") Invitation.InvitationStatus status);
    
    @Query("SELECT COUNT(i) FROM Invitation i WHERE i.createdAt >= :since")
    long countInvitationsCreatedSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT i FROM Invitation i ORDER BY i.createdAt DESC LIMIT :limit")
    List<Invitation> findRecentInvitations(@Param("limit") int limit);
    
    boolean existsByEmail(String email);
    
    boolean existsByToken(String token);
}
