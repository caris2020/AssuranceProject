package com.assurance.web;

import com.assurance.dto.AdminDashboardDto;
import com.assurance.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    /**
     * Récupère les données du tableau de bord administrateur
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        AdminDashboardDto dashboard = adminService.getDashboardData();
        return ResponseEntity.ok(dashboard);
    }
    
    /**
     * Endpoint de test pour vérifier l'accès admin
     */
    @GetMapping("/test")
    public ResponseEntity<String> testAdminAccess() {
        return ResponseEntity.ok("Accès administrateur fonctionnel");
    }
}
