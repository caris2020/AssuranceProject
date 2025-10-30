package com.assurance.web;

import com.assurance.dto.CreateReportRequestDto;
import com.assurance.dto.ReportRequestDto;
import com.assurance.entity.ReportRequest;
import com.assurance.service.ReportRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/report-requests")
@CrossOrigin(origins = "*")
public class ReportRequestController {
    
    @Autowired
    private ReportRequestService reportRequestService;
    
    /**
     * Crée une nouvelle demande de rapport
     */
    @PostMapping
    public ResponseEntity<ReportRequestDto> createReportRequest(@RequestBody CreateReportRequestDto createDto) {
        try {
            ReportRequest request = reportRequestService.createReportRequest(
                createDto.getReportId(),
                createDto.getReportTitle(),
                createDto.getRequesterId(),
                createDto.getRequesterName(),
                createDto.getRequesterEmail(),
                createDto.getRequesterCompany(),
                createDto.getRequesterPhone(),
                createDto.getReason()
            );
            
            return ResponseEntity.ok(new ReportRequestDto(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Approuve une demande de rapport
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ReportRequestDto> approveRequest(@PathVariable Long id, @RequestParam String processedBy) {
        try {
            ReportRequest request = reportRequestService.approveRequest(id, processedBy);
            return ResponseEntity.ok(new ReportRequestDto(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Rejette une demande de rapport
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ReportRequestDto> rejectRequest(@PathVariable Long id, @RequestParam String processedBy) {
        try {
            ReportRequest request = reportRequestService.rejectRequest(id, processedBy);
            return ResponseEntity.ok(new ReportRequestDto(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Valide un code de validation et télécharge le rapport
     */
    @PostMapping("/validate-code")
    public ResponseEntity<ReportRequestDto> validateCodeAndDownload(@RequestParam String validationCode) {
        try {
            ReportRequest request = reportRequestService.validateCodeAndDownload(validationCode);
            return ResponseEntity.ok(new ReportRequestDto(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère les demandes en attente pour un propriétaire de rapport
     */
    @GetMapping("/owner/{ownerId}/pending")
    public ResponseEntity<List<ReportRequestDto>> getPendingRequestsForOwner(@PathVariable String ownerId) {
        try {
            List<ReportRequest> requests = reportRequestService.getPendingRequestsForOwner(ownerId);
            List<ReportRequestDto> dtos = requests.stream()
                .map(ReportRequestDto::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère toutes les demandes pour un propriétaire de rapport
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ReportRequestDto>> getRequestsForOwner(@PathVariable String ownerId) {
        try {
            List<ReportRequest> requests = reportRequestService.getRequestsForOwner(ownerId);
            List<ReportRequestDto> dtos = requests.stream()
                .map(ReportRequestDto::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Compte le nombre de demandes en attente pour un propriétaire de rapport
     */
    @GetMapping("/owner/{ownerId}/pending/count")
    public ResponseEntity<Long> countPendingRequestsForOwner(@PathVariable String ownerId) {
        try {
            long count = reportRequestService.countPendingRequestsForOwner(ownerId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère toutes les demandes d'un utilisateur
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReportRequestDto>> getUserRequests(@PathVariable String userId) {
        try {
            List<ReportRequest> requests = reportRequestService.getUserRequests(userId);
            List<ReportRequestDto> dtos = requests.stream()
                .map(ReportRequestDto::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère toutes les demandes pour un rapport
     */
    @GetMapping("/report/{reportId}")
    public ResponseEntity<List<ReportRequestDto>> getReportRequests(@PathVariable Long reportId) {
        try {
            List<ReportRequest> requests = reportRequestService.getReportRequests(reportId);
            List<ReportRequestDto> dtos = requests.stream()
                .map(ReportRequestDto::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère une demande par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportRequestDto> getRequestById(@PathVariable Long id) {
        try {
            return reportRequestService.getRequestById(id)
                .map(request -> ResponseEntity.ok(new ReportRequestDto(request)))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère les demandes approuvées d'un utilisateur
     */
    @GetMapping("/user/{userId}/approved")
    public ResponseEntity<List<ReportRequestDto>> getApprovedUserRequests(@PathVariable String userId) {
        try {
            List<ReportRequest> requests = reportRequestService.getApprovedUserRequests(userId);
            List<ReportRequestDto> dtos = requests.stream()
                .map(ReportRequestDto::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère les demandes urgentes
     */
    @GetMapping("/urgent")
    public ResponseEntity<List<ReportRequestDto>> getUrgentRequests() {
        try {
            List<ReportRequest> requests = reportRequestService.getUrgentRequests();
            List<ReportRequestDto> dtos = requests.stream()
                .map(ReportRequestDto::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Récupère les demandes récentes
     */
    @GetMapping("/recent")
    public ResponseEntity<List<ReportRequestDto>> getRecentRequests() {
        try {
            List<ReportRequest> requests = reportRequestService.getRecentRequests();
            List<ReportRequestDto> dtos = requests.stream()
                .map(ReportRequestDto::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Supprime une demande
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        try {
            reportRequestService.deleteRequest(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Endpoint temporaire pour déboguer - récupère une demande par son code de validation
     */
    @GetMapping("/debug/validation-code/{validationCode}")
    public ResponseEntity<ReportRequestDto> getRequestByValidationCode(@PathVariable String validationCode) {
        try {
            Optional<ReportRequest> request = reportRequestService.findByValidationCode(validationCode);
            if (request.isPresent()) {
                return ResponseEntity.ok(new ReportRequestDto(request.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
