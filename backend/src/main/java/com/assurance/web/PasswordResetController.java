package com.assurance.web;

import com.assurance.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password-reset")
@CrossOrigin(origins = "*")
public class PasswordResetController {
    
    private final PasswordResetService passwordResetService;
    
    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }
    
    /**
     * Demande de réinitialisation de mot de passe
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String insuranceCompany = request.get("insuranceCompany");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean success = passwordResetService.requestPasswordReset(email, insuranceCompany);
            if (success) {
                response.put("success", true);
                response.put("message", "Un email de réinitialisation a été envoyé à votre adresse email");
            } else {
                response.put("success", false);
                response.put("message", "Aucun utilisateur trouvé avec cette adresse email et cette compagnie d'assurance");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la demande de réinitialisation");
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Vérifie si un token de réinitialisation est valide
     */
    @GetMapping("/verify/{token}")
    public ResponseEntity<Map<String, Object>> verifyResetToken(@PathVariable String token) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isValid = passwordResetService.isTokenValid(token);
            response.put("valid", isValid);
            if (isValid) {
                response.put("message", "Token valide");
            } else {
                response.put("message", "Token invalide ou expiré");
            }
        } catch (Exception e) {
            response.put("valid", false);
            response.put("message", "Erreur lors de la vérification du token");
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Réinitialise le mot de passe avec un token
     */
    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean success = passwordResetService.resetPassword(token, newPassword);
            if (success) {
                response.put("success", true);
                response.put("message", "Mot de passe réinitialisé avec succès");
            } else {
                response.put("success", false);
                response.put("message", "Token invalide ou expiré");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la réinitialisation du mot de passe");
        }
        
        return ResponseEntity.ok(response);
    }
}
