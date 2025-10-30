package com.assurance.web;

import com.assurance.domain.User;
import com.assurance.dto.UserDto;
import com.assurance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    /**
     * Authentifie un utilisateur
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Optional<User> userOpt = userService.authenticateUser(
                request.getUsername(), 
                request.getInsuranceCompany(), 
                request.getPassword()
            );
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return ResponseEntity.ok(new UserDto(user));
            } else {
                return ResponseEntity.badRequest().body("Identifiants incorrects");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'authentification: " + e.getMessage());
        }
    }
    
    /**
     * Déconnecte un utilisateur
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
        try {
            userService.logoutUser(request.getUsername());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la déconnexion: " + e.getMessage());
        }
    }
    
    // Classes de requête
    public static class LoginRequest {
        private String username;
        private String insuranceCompany;
        private String password;
        
        // Getters et Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getInsuranceCompany() { return insuranceCompany; }
        public void setInsuranceCompany(String insuranceCompany) { this.insuranceCompany = insuranceCompany; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class LogoutRequest {
        private String username;
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
}
