package com.assurance.repo;

import com.assurance.domain.ReportFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportFileRepository extends JpaRepository<ReportFile, Long> {
    
    // Trouver tous les fichiers d'un rapport
    List<ReportFile> findByReportIdOrderByCreatedAtDesc(Long reportId);
    
    // Trouver les fichiers par type
    List<ReportFile> findByReportIdAndFileTypeOrderByCreatedAtDesc(Long reportId, String fileType);
    
    // Trouver les fichiers publics d'un rapport
    List<ReportFile> findByReportIdAndIsPublicTrueOrderByCreatedAtDesc(Long reportId);
    
    // Recherche par nom de fichier (insensible à la casse)
    @Query("SELECT rf FROM ReportFile rf WHERE rf.report.id = :reportId AND LOWER(rf.fileName) LIKE LOWER(CONCAT('%', :fileName, '%'))")
    List<ReportFile> findByReportIdAndFileNameContainingIgnoreCase(@Param("reportId") Long reportId, @Param("fileName") String fileName);
    
    // Trouver un fichier par son nom exact dans un rapport
    Optional<ReportFile> findByReportIdAndFileName(Long reportId, String fileName);
    
    // Compter les fichiers d'un rapport
    long countByReportId(Long reportId);
    
    // Trouver les fichiers par extension
    @Query("SELECT rf FROM ReportFile rf WHERE rf.report.id = :reportId AND rf.fileName LIKE CONCAT('%.', :extension)")
    List<ReportFile> findByReportIdAndFileExtension(@Param("reportId") Long reportId, @Param("extension") String extension);
    
    // Trouver les fichiers récents (derniers 30 jours)
    @Query("SELECT rf FROM ReportFile rf WHERE rf.report.id = :reportId AND rf.createdAt >= :thirtyDaysAgo")
    List<ReportFile> findRecentFilesByReportId(@Param("reportId") Long reportId, @Param("thirtyDaysAgo") java.time.LocalDateTime thirtyDaysAgo);
    
    // Trouver les fichiers par taille (plus grands que)
    @Query("SELECT rf FROM ReportFile rf WHERE rf.report.id = :reportId AND rf.sizeBytes > :minSize ORDER BY rf.sizeBytes DESC")
    List<ReportFile> findByReportIdAndSizeGreaterThan(@Param("reportId") Long reportId, @Param("minSize") Long minSize);
}
