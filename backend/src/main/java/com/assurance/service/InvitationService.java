package com.assurance.service;

import com.assurance.domain.Invitation;
import com.assurance.dto.InvitationDto;
import com.assurance.repository.InvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import com.assurance.domain.User;
import com.assurance.repository.UserRepository;

@Service
public class InvitationService {
    
    @Autowired
    private InvitationRepository invitationRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Crée et envoie une invitation
     */
    public Invitation createAndSendInvitation(String email, String insuranceCompany, String invitedBy) {
        // Vérifier si l'email n'est pas déjà invité (sauf si l'invitation est annulée)
        Optional<Invitation> existingInvitation = invitationRepository.findByEmail(email);
        if (existingInvitation.isPresent()) {
            Invitation invitation = existingInvitation.get();
            if (invitation.getStatus() != Invitation.InvitationStatus.CANCELLED) {
                throw new RuntimeException("Une invitation a déjà été envoyée à cet email: " + email);
            }
            // Si l'invitation est annulée, on la supprime pour en créer une nouvelle
            System.out.println("Suppression de l'invitation annulée pour: " + email);
            invitationRepository.delete(invitation);
        }
        
        // Vérifier si un utilisateur existe déjà
        if (userService.emailExists(email)) {
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                if (user.getStatus() == User.UserStatus.INVITED) {
                    // Un compte invité "fantôme" existe encore → le supprimer pour repartir propre
                    System.out.println("Suppression de l'utilisateur invité existant: " + email);
                    userRepository.delete(user);
                } else if (!user.isActive()) {
                    // Compte soft‑supprimé: bascule en INVITED et vide le mot de passe pour forcer réinscription
                    System.out.println("Réinvitation d'un utilisateur désactivé: " + email);
                    user.setStatus(User.UserStatus.INVITED);
                    user.setActive(false);
                    user.setPassword("");
                    userRepository.save(user);
                } else {
                    // Compte actif déjà enregistré → empêcher l'envoi d'une nouvelle invitation
                    throw new RuntimeException("Un utilisateur avec cet email existe déjà: " + email);
                }
            }
        }
        
        // Créer l'invitation
        String token = UUID.randomUUID().toString();
        Invitation invitation = new Invitation(token, email, insuranceCompany, invitedBy);
        invitation = invitationRepository.save(invitation);
        
        // Créer l'utilisateur invité
        userService.createInvitedUser(email, insuranceCompany);
        
        // Envoyer l'email d'invitation
        sendInvitationEmail(invitation);
        
        return invitation;
    }
    
    /**
     * Valide un token d'invitation
     */
    public Optional<Invitation> validateInvitation(String token) {
        Optional<Invitation> invitationOpt = invitationRepository.findByToken(token);
        if (invitationOpt.isPresent()) {
            Invitation invitation = invitationOpt.get();
            if (invitation.isValid()) {
                return Optional.of(invitation);
            }
        }
        return Optional.empty();
    }
    
    /**
     * Marque une invitation comme utilisée
     */
    public void markInvitationAsUsed(String token) {
        Optional<Invitation> invitationOpt = invitationRepository.findByToken(token);
        if (invitationOpt.isPresent()) {
            Invitation invitation = invitationOpt.get();
            invitation.markAsUsed();
            invitationRepository.save(invitation);
        }
    }
    
    /**
     * Récupère toutes les invitations
     */
    public List<InvitationDto> getAllInvitations() {
        return invitationRepository.findAll().stream()
                .map(InvitationDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les invitations en attente
     */
    public List<InvitationDto> getPendingInvitations() {
        return invitationRepository.findByStatus(Invitation.InvitationStatus.PENDING).stream()
                .map(InvitationDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les invitations valides en attente
     */
    public List<InvitationDto> getValidPendingInvitations() {
        return invitationRepository.findValidPendingInvitations(LocalDateTime.now()).stream()
                .map(InvitationDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les invitations expirées
     */
    public List<InvitationDto> getExpiredInvitations() {
        return invitationRepository.findExpiredInvitations(LocalDateTime.now()).stream()
                .map(InvitationDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les invitations récentes
     */
    public List<InvitationDto> getRecentInvitations(int limit) {
        return invitationRepository.findRecentInvitations(limit).stream()
                .map(InvitationDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Compte le nombre total d'invitations
     */
    public long getTotalInvitations() {
        return invitationRepository.count();
    }
    
    /**
     * Compte les invitations par statut
     */
    public long getInvitationsByStatus(Invitation.InvitationStatus status) {
        return invitationRepository.countByStatus(status);
    }
    
    /**
     * Compte les invitations en attente
     */
    public long getPendingInvitationsCount() {
        return invitationRepository.countByStatus(Invitation.InvitationStatus.PENDING);
    }
    
    /**
     * Annule une invitation
     */
    public void cancelInvitation(Long invitationId) {
        Optional<Invitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isPresent()) {
            Invitation invitation = invitationOpt.get();
            
            // Marquer l'invitation comme annulée
            invitation.setStatus(Invitation.InvitationStatus.CANCELLED);
            invitationRepository.save(invitation);
            
            System.out.println("Invitation annulée pour: " + invitation.getEmail());
            
            // Supprimer l'utilisateur invité correspondant s'il existe
            try {
                Optional<User> userOpt = userRepository.findByEmail(invitation.getEmail());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    if (user.getStatus() == User.UserStatus.INVITED) {
                        System.out.println("Suppression de l'utilisateur invité: " + user.getEmail());
                        userRepository.delete(user);
                        System.out.println("Utilisateur supprimé avec succès");
                    } else {
                        System.out.println("Utilisateur trouvé mais statut différent: " + user.getStatus());
                    }
                } else {
                    System.out.println("Aucun utilisateur trouvé pour l'email: " + invitation.getEmail());
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de la suppression de l'utilisateur: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            throw new RuntimeException("Invitation non trouvée avec l'ID: " + invitationId);
        }
    }
    
    /**
     * Renouvelle une invitation expirée
     */
    public Invitation renewInvitation(Long invitationId) {
        Optional<Invitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isPresent()) {
            Invitation invitation = invitationOpt.get();
            if (invitation.getStatus() == Invitation.InvitationStatus.EXPIRED) {
                invitation.setStatus(Invitation.InvitationStatus.PENDING);
                invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
                invitation = invitationRepository.save(invitation);
                
                // Renvoyer l'email
                sendInvitationEmail(invitation);
                
                return invitation;
            }
        }
        throw new RuntimeException("Impossible de renouveler cette invitation");
    }
    
    /**
     * Envoie l'email d'invitation
     */
    private void sendInvitationEmail(Invitation invitation) {
        String subject = "Invitation à rejoindre la plateforme d'assurance";
        String registrationUrl = "http://localhost:5173/register?token=" + invitation.getToken();
        
        String htmlContent = """
            <html>
            <body>
                <h2>Invitation à rejoindre la plateforme d'assurance</h2>
                <p>Bonjour,</p>
                <p>Vous avez été invité à rejoindre la plateforme d'assurance pour la compagnie <strong>%s</strong>.</p>
                <p>Pour finaliser votre inscription, veuillez cliquer sur le bouton ci-dessous :</p>
                <p style="text-align: center;">
                    <a href="%s" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Finaliser l'inscription
                    </a>
                </p>
                <p>Ce lien expirera dans 7 jours.</p>
                <p>Cordialement,<br>L'équipe d'assurance</p>
            </body>
            </html>
            """.formatted(invitation.getInsuranceCompany(), registrationUrl);
        
        emailService.sendEmail(invitation.getEmail(), subject, htmlContent);
    }
}
