package com.assurance.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private long totalUsers;
    private long totalReports;
    private long totalCases;
    private long totalAccessRequests;
    private long pendingAccessRequests;
    private long totalInvitations;
    private long pendingInvitations;
    
    private List<UserDto> recentUsers;
    private List<ReportDto> recentReports;
    private List<ReportRequestDto> recentAccessRequests;
    private List<InvitationDto> recentInvitations;
    
    private Map<String, Long> reportsByCompany;
    private Map<String, Long> casesByStatus;
    private Map<String, Long> casesByCompany;
    private Map<String, Long> usersByCompany;
    
    private List<UserDto> onlineUsers;
    private List<UserDto> recentlyLoggedIn;
    private List<UserDto> recentlyLoggedOut;
    
    public AdminDashboardDto() {}
    
    // Getters et Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    
    public long getTotalReports() { return totalReports; }
    public void setTotalReports(long totalReports) { this.totalReports = totalReports; }
    
    public long getTotalCases() { return totalCases; }
    public void setTotalCases(long totalCases) { this.totalCases = totalCases; }
    
    public long getTotalAccessRequests() { return totalAccessRequests; }
    public void setTotalAccessRequests(long totalAccessRequests) { this.totalAccessRequests = totalAccessRequests; }
    
    public long getPendingAccessRequests() { return pendingAccessRequests; }
    public void setPendingAccessRequests(long pendingAccessRequests) { this.pendingAccessRequests = pendingAccessRequests; }
    
    public long getTotalInvitations() { return totalInvitations; }
    public void setTotalInvitations(long totalInvitations) { this.totalInvitations = totalInvitations; }
    
    public long getPendingInvitations() { return pendingInvitations; }
    public void setPendingInvitations(long pendingInvitations) { this.pendingInvitations = pendingInvitations; }
    
    public List<UserDto> getRecentUsers() { return recentUsers; }
    public void setRecentUsers(List<UserDto> recentUsers) { this.recentUsers = recentUsers; }
    
    public List<ReportDto> getRecentReports() { return recentReports; }
    public void setRecentReports(List<ReportDto> recentReports) { this.recentReports = recentReports; }
    
    public List<ReportRequestDto> getRecentAccessRequests() { return recentAccessRequests; }
    public void setRecentAccessRequests(List<ReportRequestDto> recentAccessRequests) { this.recentAccessRequests = recentAccessRequests; }
    
    public List<InvitationDto> getRecentInvitations() { return recentInvitations; }
    public void setRecentInvitations(List<InvitationDto> recentInvitations) { this.recentInvitations = recentInvitations; }
    
    public Map<String, Long> getReportsByCompany() { return reportsByCompany; }
    public void setReportsByCompany(Map<String, Long> reportsByCompany) { this.reportsByCompany = reportsByCompany; }
    
    public Map<String, Long> getCasesByStatus() { return casesByStatus; }
    public void setCasesByStatus(Map<String, Long> casesByStatus) { this.casesByStatus = casesByStatus; }
    
    public Map<String, Long> getCasesByCompany() { return casesByCompany; }
    public void setCasesByCompany(Map<String, Long> casesByCompany) { this.casesByCompany = casesByCompany; }
    
    public Map<String, Long> getUsersByCompany() { return usersByCompany; }
    public void setUsersByCompany(Map<String, Long> usersByCompany) { this.usersByCompany = usersByCompany; }
    
    public List<UserDto> getOnlineUsers() { return onlineUsers; }
    public void setOnlineUsers(List<UserDto> onlineUsers) { this.onlineUsers = onlineUsers; }
    
    public List<UserDto> getRecentlyLoggedIn() { return recentlyLoggedIn; }
    public void setRecentlyLoggedIn(List<UserDto> recentlyLoggedIn) { this.recentlyLoggedIn = recentlyLoggedIn; }
    
    public List<UserDto> getRecentlyLoggedOut() { return recentlyLoggedOut; }
    public void setRecentlyLoggedOut(List<UserDto> recentlyLoggedOut) { this.recentlyLoggedOut = recentlyLoggedOut; }
}
