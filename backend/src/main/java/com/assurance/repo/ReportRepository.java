package com.assurance.repo;

import com.assurance.domain.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    List<Report> findTop10ByOrderByCreatedAtDesc();
    
    @Query("SELECT r.createdBy, COUNT(r) FROM Report r GROUP BY r.createdBy")
    List<Object[]> countReportsByCompany();
    
    List<Report> findByCreatedBy(String createdBy);
}


