package com.assurance.repository;

import com.assurance.entity.TemporaryAccessCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TemporaryAccessCodeRepository extends JpaRepository<TemporaryAccessCode, Long> {
    
    /**
     * Trouve un code par sa valeur
     */
    Optional<TemporaryAccessCode> findByCode(String code);
    
    /**
     * Vérifie si un code existe
     */
    boolean existsByCode(String code);
    
    /**
     * Trouve un code par sa valeur et l'ID du rapport
     */
    Optional<TemporaryAccessCode> findByCodeAndReportId(String code, Long reportId);
    
    /**
     * Trouve tous les codes valides pour un utilisateur
     */
    List<TemporaryAccessCode> findByUserIdAndUsedFalseAndExpiresAtAfter(String userId, LocalDateTime now);
    
    /**
     * Trouve tous les codes valides pour un rapport
     */
    List<TemporaryAccessCode> findByReportIdAndUsedFalseAndExpiresAtAfter(Long reportId, LocalDateTime now);
    
    /**
     * Trouve tous les codes expirés
     */
    List<TemporaryAccessCode> findByExpiresAtBefore(LocalDateTime now);
    
    /**
     * Vérifie si un utilisateur a un code valide pour un rapport
     */
    boolean existsByUserIdAndReportIdAndUsedFalseAndExpiresAtAfter(String userId, Long reportId, LocalDateTime now);
    
    /**
     * Trouve le code valide le plus récent pour un utilisateur et un rapport
     */
    Optional<TemporaryAccessCode> findTopByUserIdAndReportIdAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String userId, Long reportId, LocalDateTime now);
    
    /**
     * Trouve tous les codes créés par un administrateur
     */
    List<TemporaryAccessCode> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    
    /**
     * Trouve tous les codes utilisés
     */
    List<TemporaryAccessCode> findByUsedTrue();
    
    /**
     * Trouve tous les codes non utilisés
     */
    List<TemporaryAccessCode> findByUsedFalse();
    
    /**
     * Compte le nombre de codes valides pour un utilisateur
     */
    @Query("SELECT COUNT(t) FROM TemporaryAccessCode t WHERE t.userId = :userId AND t.used = false AND t.expiresAt > :now")
    long countValidCodesForUser(@Param("userId") String userId, @Param("now") LocalDateTime now);
    
    /**
     * Compte le nombre de codes valides pour un rapport
     */
    @Query("SELECT COUNT(t) FROM TemporaryAccessCode t WHERE t.reportId = :reportId AND t.used = false AND t.expiresAt > :now")
    long countValidCodesForReport(@Param("reportId") Long reportId, @Param("now") LocalDateTime now);
    
    /**
     * Trouve tous les codes qui expirent dans les prochaines heures
     */
    @Query("SELECT t FROM TemporaryAccessCode t WHERE t.expiresAt BETWEEN :now AND :future AND t.used = false")
    List<TemporaryAccessCode> findCodesExpiringSoon(@Param("now") LocalDateTime now, @Param("future") LocalDateTime future);
}
