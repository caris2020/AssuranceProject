package com.assurance.service;

import com.assurance.domain.PasswordResetToken;
import com.assurance.domain.User;
import com.assurance.repository.PasswordResetTokenRepository;
import com.assurance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Demande de réinitialisation de mot de passe
     */
    @Transactional
    public boolean requestPasswordReset(String email, String insuranceCompany) {
        Optional<User> userOpt = userRepository.findByEmailAndInsuranceCompany(email, insuranceCompany);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Supprimer les anciens tokens pour cet utilisateur
            tokenRepository.deleteByUserId(user.getId());
            
            // Créer un nouveau token
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(token);
            resetToken.setUserId(user.getId());
            resetToken.setExpiryDate(LocalDateTime.now().plusHours(24)); // Expire dans 24h
            resetToken.setUsed(false);
            
            tokenRepository.save(resetToken);
            
            // Envoyer l'email
            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            String subject = "Réinitialisation de votre mot de passe - Assurance Connect";
            String body = String.format(
                "Bonjour %s %s,\n\n" +
                "Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Assurance Connect.\n\n" +
                "Pour réinitialiser votre mot de passe, cliquez sur le lien suivant :\n" +
                "%s\n\n" +
                "Ce lien expirera dans 24 heures.\n\n" +
                "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\n" +
                "Cordialement,\n" +
                "L'équipe Assurance Connect",
                user.getFirstName(), user.getLastName(), resetLink
            );
            
            emailService.sendEmail(user.getEmail(), subject, body);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Vérifie si un token est valide
     */
    public boolean isTokenValid(String token) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        
        if (tokenOpt.isPresent()) {
            PasswordResetToken resetToken = tokenOpt.get();
            return !resetToken.isUsed() && resetToken.getExpiryDate().isAfter(LocalDateTime.now());
        }
        
        return false;
    }
    
    /**
     * Réinitialise le mot de passe avec un token
     */
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        
        if (tokenOpt.isPresent()) {
            PasswordResetToken resetToken = tokenOpt.get();
            
            // Vérifier que le token n'est pas expiré et pas utilisé
            if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                return false;
            }
            
            // Trouver l'utilisateur
            Optional<User> userOpt = userRepository.findById(resetToken.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // Mettre à jour le mot de passe
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                
                // Marquer le token comme utilisé
                resetToken.setUsed(true);
                tokenRepository.save(resetToken);
                
                return true;
            }
        }
        
        return false;
    }
}
