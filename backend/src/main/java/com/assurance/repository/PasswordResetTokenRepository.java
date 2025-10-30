package com.assurance.repository;

import com.assurance.domain.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    /**
     * Trouve un token par sa valeur
     */
    Optional<PasswordResetToken> findByToken(String token);
    
    /**
     * Supprime tous les tokens pour un utilisateur donné
     */
    void deleteByUserId(Long userId);
    
    /**
     * Trouve tous les tokens expirés
     */
    void deleteByExpiryDateBefore(java.time.LocalDateTime date);
}
