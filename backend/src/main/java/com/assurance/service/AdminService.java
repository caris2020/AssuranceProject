package com.assurance.service;

import com.assurance.domain.InsuranceCase;
import com.assurance.domain.Report;
import com.assurance.dto.AdminDashboardDto;
import com.assurance.dto.ReportRequestDto;
import com.assurance.dto.InvitationDto;
import com.assurance.dto.ReportDto;
import com.assurance.dto.UserDto;
import com.assurance.repo.InsuranceCaseRepository;
import com.assurance.repo.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private InvitationService invitationService;
    
    @Autowired
    private ReportRequestService reportRequestService;
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private InsuranceCaseRepository caseRepository;
    
    /**
     * Récupère les données du tableau de bord administrateur
     */
    public AdminDashboardDto getDashboardData() {
        AdminDashboardDto dashboard = new AdminDashboardDto();
        
        // Statistiques générales
        dashboard.setTotalUsers(userService.getTotalUsers());
        dashboard.setTotalReports(reportRepository.count());
        dashboard.setTotalCases(caseRepository.count());
        dashboard.setTotalAccessRequests(reportRequestService.count());
        dashboard.setPendingAccessRequests(reportRequestService.countPendingRequests());
        dashboard.setTotalInvitations(invitationService.getTotalInvitations());
        dashboard.setPendingInvitations(invitationService.getPendingInvitationsCount());
        
        // Données récentes
        dashboard.setRecentUsers(userService.getRecentUsers(10));
        dashboard.setRecentReports(getRecentReports(10));
        dashboard.setRecentAccessRequests(getRecentReportRequests(10));
        dashboard.setRecentInvitations(invitationService.getRecentInvitations(10));
        
        // Statistiques par compagnie
        dashboard.setReportsByCompany(getReportsByCompany());
        dashboard.setCasesByStatus(getCasesByStatus());
        dashboard.setCasesByCompany(getCasesByCompany());
        dashboard.setUsersByCompany(userService.getUsersByCompany());
        
        // Utilisateurs connectés
        dashboard.setOnlineUsers(userService.getOnlineUsers(2)); // Connectés dans les 2 dernières heures
        dashboard.setRecentlyLoggedIn(userService.getRecentlyLoggedIn(24)); // Connectés dans les 24h
        dashboard.setRecentlyLoggedOut(userService.getRecentlyLoggedOut(24)); // Déconnectés dans les 24h
        
        return dashboard;
    }
    
    /**
     * Récupère les rapports récents
     */
    private List<ReportDto> getRecentReports(int limit) {
        return reportRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(ReportDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Récupère les demandes d'accès récentes
     */
    private List<ReportRequestDto> getRecentReportRequests(int limit) {
        return reportRequestService.getRecentRequests().stream()
                .limit(limit)
                .map(ReportRequestDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Compte les rapports par compagnie
     */
    private Map<String, Long> getReportsByCompany() {
        List<Object[]> results = reportRepository.countReportsByCompany();
        return results.stream()
                .filter(row -> row[0] != null) // Filtrer les valeurs null
                .collect(Collectors.toMap(
                    row -> (String) row[0],
                    row -> (Long) row[1]
                ));
    }
    
    /**
     * Compte les dossiers par statut
     */
    private Map<String, Long> getCasesByStatus() {
        List<Object[]> results = caseRepository.countCasesByStatus();
        return results.stream()
                .filter(row -> row[0] != null) // Filtrer les valeurs null
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> (Long) row[1]
                ));
    }
    
    /**
     * Compte les dossiers par compagnie
     */
    private Map<String, Long> getCasesByCompany() {
        List<Object[]> results = caseRepository.countCasesByCompany();
        return results.stream()
                .filter(row -> row[0] != null) // Filtrer les valeurs null
                .collect(Collectors.toMap(
                    row -> (String) row[0],
                    row -> (Long) row[1]
                ));
    }
}
