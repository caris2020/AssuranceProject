package com.assurance.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {
    
    public enum NotificationType {
        REPORT_REQUEST_TO_OWNER,
        REPORT_REQUEST_CONFIRMATION,
        VALIDATION_CODE_GENERATED,
        REPORT_DOWNLOADED,
        DOWNLOAD_COMPLETED,
        CASE_CREATED,
        REPORT_CREATED,
        CASE_STATUS_CHANGED
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 128)
    private String userId;
    
    @Column(nullable = false, length = 256)
    private String title;
    
    @Column(nullable = false, length = 512)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
    
    @Column(length = 64)
    private String action;
    
    @Column(length = 256)
    private String url;
    
    @Column(columnDefinition = "TEXT")
    private String metadata;
    
    @Column(nullable = false)
    private boolean read = false;
    
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
    
    @Column
    private Instant readAt;
    
    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
    
    // Constructeurs
    public Notification() {}
    
    public Notification(String userId, String title, String message, NotificationType type) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }
}
