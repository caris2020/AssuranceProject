package com.assurance.web;

import com.assurance.domain.User;
import com.assurance.dto.UserDto;
import com.assurance.service.UserService;
import com.assurance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Authentifie un utilisateur
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
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
    }
    
    /**
     * Déconnecte un utilisateur
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
        userService.logoutUser(request.getUsername());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Finalise l'inscription d'un utilisateur invité
     */
    @PostMapping("/register")
    public ResponseEntity<?> completeRegistration(@RequestBody RegistrationRequest request) {
        try {
            User user = userService.completeRegistration(
                request.getEmail(),
                request.getUsername(),
                request.getFirstName(),
                request.getLastName(),
                request.getDateOfBirth(),
                request.getPassword(),
                request.getCompanyLogo()
            );
            return ResponseEntity.ok(new UserDto(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Vérifie si un username existe
     */
    @GetMapping("/check-username/{username}")
    public ResponseEntity<Boolean> checkUsername(@PathVariable String username) {
        boolean exists = userService.usernameExists(username);
        return ResponseEntity.ok(exists);
    }
    
    /**
     * Récupère tous les utilisateurs (admin seulement)
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * Récupère un utilisateur par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(new UserDto(userOpt.get()));
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Récupère les utilisateurs récents
     */
    @GetMapping("/recent")
    public ResponseEntity<List<UserDto>> getRecentUsers(@RequestParam(defaultValue = "10") int limit) {
        List<UserDto> users = userService.getRecentUsers(limit);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Récupère les utilisateurs connectés récemment
     */
    @GetMapping("/recently-logged-in")
    public ResponseEntity<List<UserDto>> getRecentlyLoggedIn(@RequestParam(defaultValue = "24") int hours) {
        List<UserDto> users = userService.getRecentlyLoggedIn(hours);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Récupère les utilisateurs déconnectés récemment
     */
    @GetMapping("/recently-logged-out")
    public ResponseEntity<List<UserDto>> getRecentlyLoggedOut(@RequestParam(defaultValue = "24") int hours) {
        List<UserDto> users = userService.getRecentlyLoggedOut(hours);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Récupère les utilisateurs en ligne
     */
    @GetMapping("/online")
    public ResponseEntity<List<UserDto>> getOnlineUsers(@RequestParam(defaultValue = "2") int hours) {
        List<UserDto> users = userService.getOnlineUsers(hours);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Récupère les statistiques des utilisateurs par compagnie
     */
    @GetMapping("/stats/by-company")
    public ResponseEntity<Map<String, Long>> getUsersByCompany() {
        Map<String, Long> stats = userService.getUsersByCompany();
        return ResponseEntity.ok(stats);
    }

    /**
     * Liste des compagnies d'assurance distinctes (pour listes déroulantes)
     */
    @GetMapping("/companies")
    public ResponseEntity<List<String>> listInsuranceCompanies() {
        List<String> companies = userRepository.findDistinctInsuranceCompanies();
        return ResponseEntity.ok(companies);
    }
    
    /**
     * Récupère les statistiques générales
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = Map.of(
            "totalUsers", userService.getTotalUsers(),
            "registeredUsers", userService.getUsersByStatus(User.UserStatus.REGISTERED),
            "invitedUsers", userService.getUsersByStatus(User.UserStatus.INVITED),
            "adminUsers", userService.getUsersByRole(User.UserRole.ADMIN)
        );
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Active un utilisateur
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        try {
            userService.activateUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Désactive un utilisateur
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        try {
            userService.deactivateUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Bascule le statut d'un utilisateur (activer/désactiver)
     */
    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        try {
            userService.toggleUserStatus(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Suppression logique (soft delete): désactive l'utilisateur pour bloquer l'accès
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> softDeleteUser(@PathVariable Long id) {
        try {
            userService.softDeleteUser(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
    
    public static class RegistrationRequest {
        private String email;
        private String username;
        private String firstName;
        private String lastName;
        private LocalDate dateOfBirth;
        private String password;
        private String companyLogo;
        
        // Getters et Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public LocalDate getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getCompanyLogo() { return companyLogo; }
        public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }
    }
}
