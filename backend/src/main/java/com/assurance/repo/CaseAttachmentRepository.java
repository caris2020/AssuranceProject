package com.assurance.repo;

import com.assurance.domain.CaseAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaseAttachmentRepository extends JpaRepository<CaseAttachment, Long> {
    
    // Trouver toutes les pièces jointes d'un dossier
    List<CaseAttachment> findByInsuranceCaseIdOrderByCreatedAtDesc(Long caseId);
    
    // Trouver les pièces jointes par catégorie
    List<CaseAttachment> findByInsuranceCaseIdAndCategoryOrderByCreatedAtDesc(Long caseId, String category);
    
    // Trouver les pièces jointes par type de fichier
    List<CaseAttachment> findByInsuranceCaseIdAndFileTypeOrderByCreatedAtDesc(Long caseId, String fileType);
    
    // Trouver les pièces jointes publiques d'un dossier
    List<CaseAttachment> findByInsuranceCaseIdAndIsPublicTrueOrderByCreatedAtDesc(Long caseId);
    
    // Recherche par nom de fichier (insensible à la casse)
    @Query("SELECT ca FROM CaseAttachment ca WHERE ca.insuranceCase.id = :caseId AND LOWER(ca.fileName) LIKE LOWER(CONCAT('%', :fileName, '%'))")
    List<CaseAttachment> findByCaseIdAndFileNameContainingIgnoreCase(@Param("caseId") Long caseId, @Param("fileName") String fileName);
    
    // Trouver une pièce jointe par son nom exact dans un dossier
    Optional<CaseAttachment> findByInsuranceCaseIdAndFileName(Long caseId, String fileName);
    
    // Compter les pièces jointes d'un dossier
    long countByInsuranceCaseId(Long caseId);
    
    // Trouver les pièces jointes par extension
    @Query("SELECT ca FROM CaseAttachment ca WHERE ca.insuranceCase.id = :caseId AND ca.fileName LIKE CONCAT('%.', :extension)")
    List<CaseAttachment> findByCaseIdAndFileExtension(@Param("caseId") Long caseId, @Param("extension") String extension);
    
    // Trouver les pièces jointes récentes (derniers 30 jours)
    @Query("SELECT ca FROM CaseAttachment ca WHERE ca.insuranceCase.id = :caseId AND ca.createdAt >= :thirtyDaysAgo")
    List<CaseAttachment> findRecentAttachmentsByCaseId(@Param("caseId") Long caseId, @Param("thirtyDaysAgo") java.time.LocalDateTime thirtyDaysAgo);
    
    // Trouver les pièces jointes par taille (plus grandes que)
    @Query("SELECT ca FROM CaseAttachment ca WHERE ca.insuranceCase.id = :caseId AND ca.sizeBytes > :minSize ORDER BY ca.sizeBytes DESC")
    List<CaseAttachment> findByCaseIdAndSizeGreaterThan(@Param("caseId") Long caseId, @Param("minSize") Long minSize);
    
    // Trouver les pièces jointes par description
    @Query("SELECT ca FROM CaseAttachment ca WHERE ca.insuranceCase.id = :caseId AND LOWER(ca.description) LIKE LOWER(CONCAT('%', :description, '%'))")
    List<CaseAttachment> findByCaseIdAndDescriptionContainingIgnoreCase(@Param("caseId") Long caseId, @Param("description") String description);
    
    // Trouver les pièces jointes par type de contenu
    @Query("SELECT ca FROM CaseAttachment ca WHERE ca.insuranceCase.id = :caseId AND ca.contentType LIKE CONCAT('%', :contentType, '%')")
    List<CaseAttachment> findByCaseIdAndContentTypeContaining(@Param("caseId") Long caseId, @Param("contentType") String contentType);
}
