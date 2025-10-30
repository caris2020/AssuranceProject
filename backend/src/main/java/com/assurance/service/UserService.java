package com.assurance.service;

import com.assurance.domain.User;
import com.assurance.domain.Invitation;
import com.assurance.repository.InvitationRepository;
import com.assurance.dto.UserDto;
import com.assurance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private InvitationRepository invitationRepository;
    
    /**
     * Crée un nouvel utilisateur
     */
    public User createUser(User user) {
        // Encoder le mot de passe
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Initialiser l'abonnement
        user.setSubscriptionStartDate(LocalDate.now());
        user.setSubscriptionActive(true);
        user.setSubscriptionStatus(User.SubscriptionStatus.ACTIVE);
        
        // Les administrateurs ont un abonnement qui ne expire jamais
        if (user.getRole() == User.UserRole.ADMIN) {
            user.setSubscriptionEndDate(LocalDate.now().plusYears(100)); // Date très éloignée
        } else {
            user.setSubscriptionEndDate(LocalDate.now().plusYears(1)); // Un an pour les utilisateurs normaux
        }
        
        return userRepository.save(user);
    }
    
    /**
     * Crée un utilisateur invité (sans mot de passe)
     */
    public User createInvitedUser(String email, String insuranceCompany) {
        User user = new User();
        user.setEmail(email);
        user.setInsuranceCompany(insuranceCompany);
        user.setStatus(User.UserStatus.INVITED);
        user.setUsername(generateUsername(email));
        user.setFirstName("À définir");
        user.setLastName("À définir");
        user.setPassword(""); // Sera défini lors de l'inscription
        user.setDateOfBirth(LocalDate.now()); // Temporaire
        return userRepository.save(user);
    }
    
    /**
     * Met à jour un utilisateur invité avec ses informations complètes
     */
    public User completeRegistration(String email, String username, String firstName, String lastName, 
                                   LocalDate dateOfBirth, String password, String companyLogo) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setUsername(username);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setDateOfBirth(dateOfBirth);
            user.setPassword(passwordEncoder.encode(password));
            user.setCompanyLogo(companyLogo);
            user.setStatus(User.UserStatus.REGISTERED);
            return userRepository.save(user);
        }
        throw new RuntimeException("Utilisateur non trouvé avec l'email: " + email);
    }
    
    /**
     * Authentifie un utilisateur
     * Les administrateurs peuvent toujours se connecter, même avec un abonnement expiré
     */
    public Optional<User> authenticateUser(String username, String insuranceCompany, String password) {
        // Normaliser les entrées: trim + insensibilité à la casse côté requête
        String normalizedUsername = username == null ? "" : username.trim();
        String normalizedCompany = insuranceCompany == null ? "" : insuranceCompany.trim();

        System.out.println("🔍 Tentative de connexion pour: " + normalizedUsername + " / " + normalizedCompany);
        
        Optional<User> userOpt = userRepository.findByUsernameAndInsuranceCompanyIgnoreCase(
            normalizedUsername, normalizedCompany
        );
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("✅ Utilisateur trouvé: " + user.getUsername() + " (actif: " + user.isActive() + ")");
            
            boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
            System.out.println("🔐 Vérification mot de passe: " + passwordMatches);
            
            if (passwordMatches && user.isActive()) {
                System.out.println("✅ Mot de passe et statut actif OK");
                
                // Vérifier l'abonnement seulement pour les utilisateurs non-administrateurs
                if (user.getRole() == User.UserRole.ADMIN || user.isSubscriptionActive()) {
                    System.out.println("✅ Abonnement OK - Connexion réussie");
                    // Mettre à jour la dernière connexion
                    user.setLastLoginAt(LocalDateTime.now());
                    userRepository.save(user);
                    return Optional.of(user);
                } else {
                    System.out.println("❌ Abonnement non actif");
                }
            } else {
                System.out.println("❌ Mot de passe incorrect ou utilisateur inactif");
            }
        } else {
            System.out.println("❌ Utilisateur non trouvé");
        }
        return Optional.empty();
    }
    
    /**
     * Déconnecte un utilisateur
     */
    public void logoutUser(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLogoutAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }
    
    /**
     * Récupère tous les utilisateurs
     */
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère un utilisateur par ID
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Récupère un utilisateur par username
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Récupère les utilisateurs récents
     */
    public List<UserDto> getRecentUsers(int limit) {
        return userRepository.findRecentUsers(limit).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les utilisateurs connectés récemment
     */
    public List<UserDto> getRecentlyLoggedIn(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return userRepository.findRecentlyLoggedIn(since).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les utilisateurs déconnectés récemment
     */
    public List<UserDto> getRecentlyLoggedOut(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return userRepository.findRecentlyLoggedOut(since).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les utilisateurs en ligne
     */
    public List<UserDto> getOnlineUsers(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return userRepository.findOnlineUsers(since).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Compte les utilisateurs par compagnie
     */
    public Map<String, Long> getUsersByCompany() {
        List<Object[]> results = userRepository.countUsersByCompany();
        return results.stream()
                .filter(row -> row[0] != null) // Filtrer les valeurs null
                .collect(Collectors.toMap(
                    row -> (String) row[0],
                    row -> (Long) row[1]
                ));
    }
    
    /**
     * Compte le nombre total d'utilisateurs
     */
    public long getTotalUsers() {
        return userRepository.count();
    }
    
    /**
     * Compte les utilisateurs par statut
     */
    public long getUsersByStatus(User.UserStatus status) {
        return userRepository.countUsersByStatus(status);
    }
    
    /**
     * Compte les utilisateurs par rôle
     */
    public long getUsersByRole(User.UserRole role) {
        return userRepository.countUsersByRole(role);
    }
    
    /**
     * Vérifie si un username existe
     */
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }
    
    /**
     * Vérifie si un email existe
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * Active un utilisateur
     */
    public void activateUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(true);
            userRepository.save(user);
            // Si une invitation existe pour cet email, la marquer comme utilisée
            try {
                invitationRepository.findByEmail(user.getEmail()).ifPresent(inv -> {
                    if (inv.getStatus() != Invitation.InvitationStatus.USED) {
                        inv.setStatus(Invitation.InvitationStatus.USED);
                        invitationRepository.save(inv);
                    }
                });
            } catch (Exception ignored) {}
        } else {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId);
        }
    }
    
    /**
     * Désactive un utilisateur
     */
    public void deactivateUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Empêcher l'administrateur de se désactiver lui-même
            if (user.getRole() == User.UserRole.ADMIN) {
                throw new RuntimeException("Un administrateur ne peut pas être désactivé");
            }
            
            user.setActive(false);
            userRepository.save(user);
        } else {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId);
        }
    }

    /**
     * Supprime logiquement un utilisateur: coupe l'accès mais garde les données.
     * Concrètement, on le désactive (isActive=false).
     */
    public void softDeleteUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getRole() == User.UserRole.ADMIN) {
                throw new RuntimeException("Un administrateur ne peut pas être supprimé");
            }
            user.setActive(false);
            userRepository.save(user);
            // Si une invitation existe pour cet email, la marquer comme annulée
            try {
                invitationRepository.findByEmail(user.getEmail()).ifPresent(inv -> {
                    if (inv.getStatus() != Invitation.InvitationStatus.CANCELLED) {
                        inv.setStatus(Invitation.InvitationStatus.CANCELLED);
                        invitationRepository.save(inv);
                    }
                });
            } catch (Exception ignored) {}
        } else {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId);
        }
    }
    
    /**
     * Bascule le statut d'un utilisateur (activer/désactiver)
     */
    public void toggleUserStatus(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Empêcher l'administrateur de se désactiver lui-même
            if (user.getRole() == User.UserRole.ADMIN && user.isActive()) {
                throw new RuntimeException("Un administrateur ne peut pas être désactivé");
            }
            
            user.setActive(!user.isActive());
            userRepository.save(user);
        } else {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId);
        }
    }
    
    /**
     * Génère un username unique basé sur l'email
     */
    private String generateUsername(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
}
