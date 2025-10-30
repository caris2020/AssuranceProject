package com.assurance.repository;

import com.assurance.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsernameAndInsuranceCompany(String username, String insuranceCompany);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username) AND LOWER(u.insuranceCompany) = LOWER(:insuranceCompany)")
    Optional<User> findByUsernameAndInsuranceCompanyIgnoreCase(@Param("username") String username, @Param("insuranceCompany") String insuranceCompany);
    
    List<User> findByInsuranceCompany(String insuranceCompany);
    
    List<User> findByStatus(User.UserStatus status);
    
    List<User> findByRole(User.UserRole role);
    
    @Query("SELECT u FROM User u WHERE u.lastLoginAt >= :since ORDER BY u.lastLoginAt DESC")
    List<User> findRecentlyLoggedIn(@Param("since") LocalDateTime since);
    
    @Query("SELECT u FROM User u WHERE u.lastLogoutAt >= :since ORDER BY u.lastLogoutAt DESC")
    List<User> findRecentlyLoggedOut(@Param("since") LocalDateTime since);
    
    @Query("SELECT u FROM User u WHERE u.lastLoginAt >= :since AND u.lastLogoutAt IS NULL OR u.lastLogoutAt < u.lastLoginAt ORDER BY u.lastLoginAt DESC")
    List<User> findOnlineUsers(@Param("since") LocalDateTime since);
    
    @Query("SELECT u.insuranceCompany, COUNT(u) FROM User u GROUP BY u.insuranceCompany")
    List<Object[]> countUsersByCompany();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countUsersCreatedSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countUsersByStatus(@Param("status") User.UserStatus status);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countUsersByRole(@Param("role") User.UserRole role);
    
    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC LIMIT :limit")
    List<User> findRecentUsers(@Param("limit") int limit);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsernameAndInsuranceCompany(String username, String insuranceCompany);
    
    // Méthodes pour les abonnements
    List<User> findBySubscriptionEndDateBeforeAndSubscriptionActiveTrue(LocalDate date);
    
    List<User> findBySubscriptionStatus(User.SubscriptionStatus status);
    
    List<User> findBySubscriptionEndDateBeforeAndSubscriptionStatus(LocalDate date, User.SubscriptionStatus status);
    
    @Query("SELECT u FROM User u WHERE u.subscriptionEndDate <= :date AND u.subscriptionStatus = :status")
    List<User> findExpiringSubscriptions(@Param("date") LocalDate date, @Param("status") User.SubscriptionStatus status);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.subscriptionStatus = :status")
    long countUsersBySubscriptionStatus(@Param("status") User.SubscriptionStatus status);
    
    @Query("SELECT u FROM User u WHERE u.subscriptionEndDate BETWEEN :startDate AND :endDate")
    List<User> findSubscriptionsExpiringBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Méthode pour la réinitialisation de mot de passe
    Optional<User> findByEmailAndInsuranceCompany(String email, String insuranceCompany);

    // Distinct companies for dropdowns
    @Query("SELECT DISTINCT u.insuranceCompany FROM User u WHERE u.insuranceCompany IS NOT NULL ORDER BY u.insuranceCompany ASC")
    List<String> findDistinctInsuranceCompanies();
}
