package com.assurance.web;

import com.assurance.domain.Report;
import com.assurance.domain.InsuranceCase;
import com.assurance.domain.AuditEvent;
import com.assurance.repo.ReportRepository;
import com.assurance.repo.InsuranceCaseRepository;
import com.assurance.repo.AuditEventRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/report-stats")
@CrossOrigin(origins = "*")
public class ReportStatsController {
    
    private final ReportRepository reportRepository;
    private final InsuranceCaseRepository caseRepository;
    private final AuditEventRepository auditEventRepository;
    
    public ReportStatsController(ReportRepository reportRepository, 
                                InsuranceCaseRepository caseRepository,
                                AuditEventRepository auditEventRepository) {
        this.reportRepository = reportRepository;
        this.caseRepository = caseRepository;
        this.auditEventRepository = auditEventRepository;
    }
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getReportStats() {
        try {
            // Statistiques générales
            long totalCreated = reportRepository.count();
            long totalModified = countModifiedReports();
            long totalDeleted = 0; // Pas de soft delete implémenté pour l'instant
            long totalRequests = countAccessRequests();
            
            // Compagnies avec rapports
            List<Map<String, Object>> companiesWithReports = getCompaniesWithReports();
            
            // Compagnies avec demandes (simulation basée sur les événements d'audit)
            List<Map<String, Object>> companiesWithRequests = getCompaniesWithRequests();
            
            // Rapports récents
            List<Map<String, Object>> recentReports = getRecentReports();
            
            // Demandes récentes (simulation basée sur les événements d'audit)
            List<Map<String, Object>> recentRequests = getRecentRequests();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCreated", totalCreated);
            stats.put("totalModified", totalModified);
            stats.put("totalDeleted", totalDeleted);
            stats.put("totalRequests", totalRequests);
            stats.put("companiesWithReports", companiesWithReports);
            stats.put("companiesWithRequests", companiesWithRequests);
            stats.put("recentReports", recentReports);
            stats.put("recentRequests", recentRequests);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Erreur lors de la récupération des statistiques: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    private long countModifiedReports() {
        // Compter les rapports qui ont été modifiés (créés dans les 30 derniers jours)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        Instant thirtyDaysAgoInstant = thirtyDaysAgo.atStartOfDay(ZoneId.systemDefault()).toInstant();
        
        return reportRepository.findAll().stream()
                .filter(report -> report.getCreatedAt().isAfter(thirtyDaysAgoInstant))
                .count();
    }
    
    private long countDeletedReports() {
        // Pas de soft delete implémenté pour l'instant
        return 0;
    }
    
    private long countAccessRequests() {
        try {
            return auditEventRepository.findAll().stream()
                    .filter(event -> event.getType() == AuditEvent.EventType.ACCESS_REQUEST_CREATED)
                    .count();
        } catch (Exception e) {
            // Si pas d'événements d'audit, retourner 0
            return 0;
        }
    }
    
    private List<Map<String, Object>> getCompaniesWithReports() {
        List<Object[]> results = reportRepository.countReportsByCompany();
        return results.stream()
                .map(result -> {
                    Map<String, Object> company = new HashMap<>();
                    company.put("company", result[0] != null ? result[0].toString() : "Inconnu");
                    company.put("count", ((Number) result[1]).longValue());
                    return company;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getCompaniesWithRequests() {
        try {
            return auditEventRepository.findAll().stream()
                    .filter(event -> event.getType() == AuditEvent.EventType.ACCESS_REQUEST_CREATED)
                    .collect(Collectors.groupingBy(
                        event -> extractCompanyFromActor(event.getActor()),
                        Collectors.counting()
                    ))
                    .entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> company = new HashMap<>();
                        company.put("company", entry.getKey());
                        company.put("count", entry.getValue());
                        return company;
                    })
                    .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Si pas d'événements d'audit, retourner une liste vide
            return new ArrayList<>();
        }
    }
    
    private List<Map<String, Object>> getRecentReports() {
        return reportRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .limit(5)
                .map(report -> {
                    Map<String, Object> reportData = new HashMap<>();
                    reportData.put("id", report.getId());
                    reportData.put("title", report.getTitle());
                    reportData.put("createdBy", report.getCreatedBy() != null ? report.getCreatedBy() : "Inconnu");
                    reportData.put("createdAt", report.getCreatedAt().toString());
                    reportData.put("company", extractCompanyFromActor(report.getCreatedBy()));
                    return reportData;
                })
                .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getRecentRequests() {
        try {
            return auditEventRepository.findAll().stream()
                    .filter(event -> event.getType() == AuditEvent.EventType.ACCESS_REQUEST_CREATED)
                    .sorted(Comparator.comparing(AuditEvent::getAtISO).reversed())
                    .limit(5)
                    .map(event -> {
                        Map<String, Object> request = new HashMap<>();
                        request.put("id", event.getId());
                        request.put("requesterName", event.getActor());
                        request.put("reportTitle", extractReportTitleFromMessage(event.getMessage()));
                        request.put("company", extractCompanyFromActor(event.getActor()));
                        request.put("requestedAt", event.getAtISO().toString());
                        return request;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Si pas d'événements d'audit, retourner une liste vide
            return new ArrayList<>();
        }
    }
    
    private String extractCompanyFromActor(String actor) {
        if (actor == null) return "Inconnu";
        
        // Logique pour extraire la compagnie depuis l'acteur
        if (actor.contains("admin")) return "Administrateur";
        if (actor.contains("axa") || actor.contains("AXA")) return "AXA";
        if (actor.contains("allianz") || actor.contains("Allianz")) return "Allianz";
        if (actor.contains("generali") || actor.contains("Generali")) return "Generali";
        if (actor.contains("groupama") || actor.contains("Groupama")) return "Groupama";
        if (actor.contains("maif") || actor.contains("Maif")) return "Maif";
        if (actor.contains("macif") || actor.contains("Macif")) return "Macif";
        
        return actor;
    }
    
    private String extractReportTitleFromMessage(String message) {
        if (message == null) return "Rapport inconnu";
        
        // Logique pour extraire le titre du rapport depuis le message
        if (message.contains("Rapport")) {
            return message.substring(message.indexOf("Rapport"));
        }
        
        return "Rapport d'accident";
    }
}
