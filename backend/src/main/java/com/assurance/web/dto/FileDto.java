package com.assurance.web.dto;

import com.assurance.domain.ReportFile;
import com.assurance.domain.CaseAttachment;

import java.time.Instant;

public class FileDto {
    
    // DTO pour les fichiers de rapports
    public static class ReportFileDto {
        private Long id;
        private String fileName;
        private String contentType;
        private Long sizeBytes;
        private String formattedSize;
        private String fileType;
        private String fileExtension;
        private String description;
        private Boolean isPublic;
        private Instant createdAt;
        private Instant updatedAt;
        private Long reportId;

        public ReportFileDto() {}

        public ReportFileDto(ReportFile file) {
            this.id = file.getId();
            this.fileName = file.getFileName();
            this.contentType = file.getContentType();
            this.sizeBytes = file.getSizeBytes();
            this.formattedSize = file.getFormattedSize();
            this.fileType = file.getFileType();
            this.fileExtension = file.getFileExtension();
            this.description = file.getDescription();
            this.isPublic = file.getIsPublic();
            this.createdAt = file.getCreatedAt();
            this.updatedAt = file.getUpdatedAt();
            this.reportId = file.getReport().getId();
        }

        // Getters et Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }

        public Long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }

        public String getFormattedSize() { return formattedSize; }
        public void setFormattedSize(String formattedSize) { this.formattedSize = formattedSize; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public String getFileExtension() { return fileExtension; }
        public void setFileExtension(String fileExtension) { this.fileExtension = fileExtension; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Boolean getIsPublic() { return isPublic; }
        public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

        public Long getReportId() { return reportId; }
        public void setReportId(Long reportId) { this.reportId = reportId; }
    }

    // DTO pour les pièces jointes des dossiers
    public static class CaseAttachmentDto {
        private Long id;
        private String fileName;
        private String contentType;
        private Long sizeBytes;
        private String formattedSize;
        private String fileType;
        private String fileExtension;
        private String description;
        private String category;
        private Boolean isPublic;
        private Instant createdAt;
        private Instant updatedAt;
        private Long caseId;

        public CaseAttachmentDto() {}

        public CaseAttachmentDto(CaseAttachment attachment) {
            this.id = attachment.getId();
            this.fileName = attachment.getFileName();
            this.contentType = attachment.getContentType();
            this.sizeBytes = attachment.getSizeBytes();
            this.formattedSize = attachment.getFormattedSize();
            this.fileType = attachment.getFileType();
            this.fileExtension = attachment.getFileExtension();
            this.description = attachment.getDescription();
            this.category = attachment.getCategory();
            this.isPublic = attachment.getIsPublic();
            this.createdAt = attachment.getCreatedAt();
            this.updatedAt = attachment.getUpdatedAt();
            this.caseId = attachment.getInsuranceCase().getId();
        }

        // Getters et Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }

        public Long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }

        public String getFormattedSize() { return formattedSize; }
        public void setFormattedSize(String formattedSize) { this.formattedSize = formattedSize; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public String getFileExtension() { return fileExtension; }
        public void setFileExtension(String fileExtension) { this.fileExtension = fileExtension; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public Boolean getIsPublic() { return isPublic; }
        public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

        public Long getCaseId() { return caseId; }
        public void setCaseId(Long caseId) { this.caseId = caseId; }
    }

    // DTO pour les requêtes d'upload
    public static class UploadRequestDto {
        private String description;
        private String fileType;
        private String category;
        private Boolean isPublic;

        public UploadRequestDto() {}

        // Getters et Setters
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public Boolean getIsPublic() { return isPublic; }
        public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    }

    // DTO pour les réponses d'upload
    public static class UploadResponseDto {
        private boolean success;
        private String message;
        private Object file;
        private String error;

        public UploadResponseDto() {}

        public UploadResponseDto(boolean success, String message, Object file) {
            this.success = success;
            this.message = message;
            this.file = file;
        }

        public UploadResponseDto(boolean success, String error) {
            this.success = success;
            this.error = error;
        }

        // Getters et Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public Object getFile() { return file; }
        public void setFile(Object file) { this.file = file; }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }

    // DTO pour les listes de fichiers
    public static class FileListResponseDto {
        private boolean success;
        private Object files;
        private long totalCount;
        private String message;
        private String error;

        public FileListResponseDto() {}

        public FileListResponseDto(boolean success, Object files, long totalCount) {
            this.success = success;
            this.files = files;
            this.totalCount = totalCount;
        }

        public FileListResponseDto(boolean success, String error) {
            this.success = success;
            this.error = error;
        }

        // Getters et Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public Object getFiles() { return files; }
        public void setFiles(Object files) { this.files = files; }

        public long getTotalCount() { return totalCount; }
        public void setTotalCount(long totalCount) { this.totalCount = totalCount; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
}
