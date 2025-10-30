package com.assurance.repo;

import com.assurance.domain.InsuranceCase;
import com.assurance.domain.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceCaseRepository extends JpaRepository<InsuranceCase, Long> {
    // TEMPORAIRE: Désactiver la méthode qui référence Report
    // Optional<InsuranceCase> findTopByReportOrderByCreatedAtDesc(Report report);
    Optional<InsuranceCase> findByReference(String reference);
    List<InsuranceCase> findByCreatedBy(String createdBy);
    
    @Query("SELECT c.status, COUNT(c) FROM InsuranceCase c GROUP BY c.status")
    List<Object[]> countCasesByStatus();
    
    @Query("SELECT c.createdBy, COUNT(c) FROM InsuranceCase c GROUP BY c.createdBy")
    List<Object[]> countCasesByCompany();
}


