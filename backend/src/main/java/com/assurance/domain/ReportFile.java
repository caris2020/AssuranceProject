package com.assurance.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "report_files")
public class ReportFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(length = 100)
    private String contentType;

    @Column(name = "file_size")
    private Long sizeBytes;

    @Column(columnDefinition = "BYTEA")
    private byte[] iv; // 16 bytes IV pour le chiffrement

    @Column(columnDefinition = "BYTEA")
    private byte[] cipherText; // Contenu chiffré du fichier

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column
    private Instant updatedAt = Instant.now();

    // Métadonnées supplémentaires
    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String fileType; // pdf, image, document, etc.

    @Column
    private Boolean isPublic = false; // Si le fichier est accessible publiquement

    @Column(length = 50)
    private String category; // main, preview, etc.

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Constructeurs
    public ReportFile() {}

    public ReportFile(Report report, String fileName, String contentType, Long sizeBytes) {
        this.report = report;
        this.fileName = fileName;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Report getReport() { return report; }
    public void setReport(Report report) { this.report = report; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }

    public byte[] getIv() { return iv; }
    public void setIv(byte[] iv) { this.iv = iv; }

    public byte[] getCipherText() { return cipherText; }
    public void setCipherText(byte[] cipherText) { this.cipherText = cipherText; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    // Méthodes utilitaires
    public String getFileExtension() {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        }
        return "";
    }

    public String getFormattedSize() {
        if (sizeBytes == null) return "0 B";
        
        long bytes = sizeBytes;
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }

    @Override
    public String toString() {
        return "ReportFile{" +
                "id=" + id +
                ", fileName='" + fileName + '\'' +
                ", contentType='" + contentType + '\'' +
                ", sizeBytes=" + sizeBytes +
                ", createdAt=" + createdAt +
                '}';
    }
}
