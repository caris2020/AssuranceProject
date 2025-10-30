package com.assurance.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_events")
public class AuditEvent {
    public enum EventType {
        ACCESS_REQUEST_CREATED,
        ACCESS_REQUEST_APPROVED,
        ACCESS_REQUEST_REJECTED,
        REPORT_CREATED,
        REPORT_DOWNLOADED,
        CASE_CREATED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    @Column(nullable = false, length = 512)
    private String message;

    @Column(nullable = false, length = 128)
    private String actor;

    @Column(nullable = false)
    private Instant atISO = Instant.now();

    @PrePersist
    public void onCreate() {
        if (atISO == null) atISO = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public EventType getType() { return type; }
    public void setType(EventType type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public Instant getAtISO() { return atISO; }
    public void setAtISO(Instant atISO) { this.atISO = atISO; }
}


