package com.assurance.web;

import com.assurance.domain.Invitation;
import com.assurance.dto.InvitationDto;
import com.assurance.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {
    
    @Autowired
    private InvitationService invitationService;
    
    /**
     * Crée et envoie une invitation
     */
    @PostMapping
    public ResponseEntity<?> createInvitation(@RequestBody CreateInvitationRequest request) {
        try {
            Invitation invitation = invitationService.createAndSendInvitation(
                request.getEmail(),
                request.getInsuranceCompany(),
                request.getInvitedBy()
            );
            return ResponseEntity.ok(new InvitationDto(invitation));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Valide un token d'invitation
     */
    @GetMapping("/validate/{token}")
    public ResponseEntity<?> validateInvitation(@PathVariable String token) {
        Optional<Invitation> invitationOpt = invitationService.validateInvitation(token);
        if (invitationOpt.isPresent()) {
            return ResponseEntity.ok(new InvitationDto(invitationOpt.get()));
        } else {
            return ResponseEntity.badRequest().body("Token d'invitation invalide ou expiré");
        }
    }
    
    /**
     * Marque une invitation comme utilisée
     */
    @PostMapping("/{token}/use")
    public ResponseEntity<?> useInvitation(@PathVariable String token) {
        invitationService.markInvitationAsUsed(token);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Récupère toutes les invitations
     */
    @GetMapping
    public ResponseEntity<List<InvitationDto>> getAllInvitations() {
        List<InvitationDto> invitations = invitationService.getAllInvitations();
        return ResponseEntity.ok(invitations);
    }
    
    /**
     * Récupère les invitations en attente
     */
    @GetMapping("/pending")
    public ResponseEntity<List<InvitationDto>> getPendingInvitations() {
        List<InvitationDto> invitations = invitationService.getPendingInvitations();
        return ResponseEntity.ok(invitations);
    }
    
    /**
     * Récupère les invitations valides en attente
     */
    @GetMapping("/valid-pending")
    public ResponseEntity<List<InvitationDto>> getValidPendingInvitations() {
        List<InvitationDto> invitations = invitationService.getValidPendingInvitations();
        return ResponseEntity.ok(invitations);
    }
    
    /**
     * Récupère les invitations expirées
     */
    @GetMapping("/expired")
    public ResponseEntity<List<InvitationDto>> getExpiredInvitations() {
        List<InvitationDto> invitations = invitationService.getExpiredInvitations();
        return ResponseEntity.ok(invitations);
    }
    
    /**
     * Récupère les invitations récentes
     */
    @GetMapping("/recent")
    public ResponseEntity<List<InvitationDto>> getRecentInvitations(@RequestParam(defaultValue = "10") int limit) {
        List<InvitationDto> invitations = invitationService.getRecentInvitations(limit);
        return ResponseEntity.ok(invitations);
    }
    
    /**
     * Annule une invitation
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelInvitation(@PathVariable Long id) {
        try {
            invitationService.cancelInvitation(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Renouvelle une invitation expirée
     */
    @PostMapping("/{id}/renew")
    public ResponseEntity<?> renewInvitation(@PathVariable Long id) {
        try {
            Invitation invitation = invitationService.renewInvitation(id);
            return ResponseEntity.ok(new InvitationDto(invitation));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Récupère les statistiques des invitations
     */
    @GetMapping("/stats")
    public ResponseEntity<InvitationStats> getStats() {
        InvitationStats stats = new InvitationStats();
        stats.setTotalInvitations(invitationService.getTotalInvitations());
        stats.setPendingInvitations(invitationService.getPendingInvitationsCount());
        stats.setUsedInvitations(invitationService.getInvitationsByStatus(Invitation.InvitationStatus.USED));
        stats.setExpiredInvitations(invitationService.getInvitationsByStatus(Invitation.InvitationStatus.EXPIRED));
        return ResponseEntity.ok(stats);
    }
    
    // Classes de requête et réponse
    public static class CreateInvitationRequest {
        private String email;
        private String insuranceCompany;
        private String invitedBy;
        
        // Getters et Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getInsuranceCompany() { return insuranceCompany; }
        public void setInsuranceCompany(String insuranceCompany) { this.insuranceCompany = insuranceCompany; }
        
        public String getInvitedBy() { return invitedBy; }
        public void setInvitedBy(String invitedBy) { this.invitedBy = invitedBy; }
    }
    
    public static class InvitationStats {
        private long totalInvitations;
        private long pendingInvitations;
        private long usedInvitations;
        private long expiredInvitations;
        
        // Getters et Setters
        public long getTotalInvitations() { return totalInvitations; }
        public void setTotalInvitations(long totalInvitations) { this.totalInvitations = totalInvitations; }
        
        public long getPendingInvitations() { return pendingInvitations; }
        public void setPendingInvitations(long pendingInvitations) { this.pendingInvitations = pendingInvitations; }
        
        public long getUsedInvitations() { return usedInvitations; }
        public void setUsedInvitations(long usedInvitations) { this.usedInvitations = usedInvitations; }
        
        public long getExpiredInvitations() { return expiredInvitations; }
        public void setExpiredInvitations(long expiredInvitations) { this.expiredInvitations = expiredInvitations; }
    }
}
