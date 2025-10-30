package com.assurance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    
    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private SmsService smsService;
    
    @Autowired
    private InAppNotificationService inAppNotificationService;
    
    @Autowired
    private ReportService reportService;
    
    /**
     * Envoie une notification de création de demande de rapport
     */
    public void sendReportRequestCreated(String requesterName, String requesterCompany, String reportTitle, String reason) {
        System.out.println("=== NOTIFICATION: Nouvelle demande de rapport créée ===");
        System.out.println("Demandeur: " + requesterName + " (" + requesterCompany + ")");
        System.out.println("Rapport: " + reportTitle);
        System.out.println("Motif: " + reason);
        System.out.println("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        System.out.println("=====================================================");
    }
    
    /**
     * Envoie une notification au propriétaire du rapport
     */
    public void sendReportRequestToOwner(String ownerName, String requesterName, String requesterCompany, String requesterEmail, String requesterPhone, String reportTitle, String reason) {
        try {
            System.out.println("=== NOTIFICATION: Demande de rapport reçue ===");
            System.out.println("Propriétaire du rapport: " + ownerName);
            System.out.println("Rapport: " + reportTitle);
            System.out.println("Demandeur: " + requesterName + " (" + requesterCompany + ")");
            System.out.println("Email: " + requesterEmail);
            System.out.println("Téléphone: " + requesterPhone);
            System.out.println("Motif: " + reason);
            System.out.println("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            System.out.println("===============================================");
            
            // Notification in-app pour le propriétaire
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("title", "Nouvelle demande de rapport");
            notificationData.put("message", "Demande de rapport pour \"" + reportTitle + "\" par " + requesterName + " (" + requesterCompany + ")");
            notificationData.put("type", "REPORT_REQUEST_TO_OWNER");
            notificationData.put("action", "review");
            notificationData.put("url", "/rapports/requests");
            notificationData.put("requesterName", requesterName);
            notificationData.put("requesterCompany", requesterCompany);
            notificationData.put("requesterEmail", requesterEmail);
            notificationData.put("requesterPhone", requesterPhone);
            notificationData.put("reason", reason);
            notificationData.put("reportTitle", reportTitle);
            
            inAppNotificationService.sendNotification(ownerName, notificationData);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de la notification au propriétaire: " + e.getMessage());
        }
    }
    
    /**
     * Envoie une confirmation au demandeur
     */
    public void sendReportRequestConfirmation(String requesterName, String requesterEmail, String requesterPhone, String reportTitle, String ownerName) {
        try {
            System.out.println("=== NOTIFICATION: Confirmation de demande de rapport ===");
            System.out.println("Demandeur: " + requesterName);
            System.out.println("Rapport: " + reportTitle);
            System.out.println("Propriétaire: " + ownerName);
            System.out.println("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            System.out.println("========================================================");
            
            // Envoyer par email
            String subject = "✅ Confirmation de demande de rapport - " + reportTitle;
            String emailContent = String.format(
                "Votre demande de rapport pour \"%s\" a été envoyée à %s.\n" +
                "Vous recevrez une notification dès que votre demande sera traitée.",
                reportTitle, ownerName
            );
            emailService.sendEmail(requesterEmail, subject, emailContent);
            
            // Envoyer par SMS
            if (requesterPhone != null && !requesterPhone.isEmpty()) {
                String smsMessage = String.format(
                    "Demande de rapport pour %s envoyée à %s. Vous recevrez une notification.",
                    reportTitle, ownerName
                );
                smsService.sendSms(requesterPhone, smsMessage);
            }
            
            // Notification in-app
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("title", "Demande de rapport envoyée");
            notificationData.put("message", "Votre demande pour \"" + reportTitle + "\" a été envoyée à " + ownerName);
            notificationData.put("type", "REPORT_REQUEST_CONFIRMATION");
            notificationData.put("reportTitle", reportTitle);
            notificationData.put("ownerName", ownerName);
            
            inAppNotificationService.sendNotification(requesterName, notificationData);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de la confirmation: " + e.getMessage());
        }
    }
    
    /**
     * Envoie le code de validation au demandeur
     */
    public void sendValidationCode(String requesterName, String requesterEmail, String requesterPhone, String reportTitle, String validationCode, LocalDateTime expiresAt) {
        try {
            System.out.println("=== NOTIFICATION: Code de validation généré ===");
            System.out.println("Demandeur: " + requesterName);
            System.out.println("Rapport: " + reportTitle);
            System.out.println("Code: " + validationCode);
            System.out.println("Expire le: " + expiresAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            System.out.println("===============================================");
            
            // Envoyer par email
            String subject = "🔐 Code de validation pour " + reportTitle;
            String emailContent = String.format(
                "Votre demande de rapport pour \"%s\" a été approuvée.\n" +
                "Code de validation: %s\n" +
                "Expire le: %s\n" +
                "Utilisez ce code pour télécharger le rapport.",
                reportTitle, validationCode, expiresAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            );
            emailService.sendEmail(requesterEmail, subject, emailContent);
            
            // Envoyer par SMS
            if (requesterPhone != null && !requesterPhone.isEmpty()) {
                String smsMessage = String.format(
                    "Code de validation: %s pour %s. Expire le %s.",
                    validationCode, reportTitle, expiresAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                );
                smsService.sendSms(requesterPhone, smsMessage);
            }
            
            // Notification in-app
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("title", "Code de validation généré");
            notificationData.put("message", "Votre code " + validationCode + " pour \"" + reportTitle + "\" est prêt");
            notificationData.put("type", "VALIDATION_CODE_GENERATED");
            notificationData.put("action", "download");
            notificationData.put("code", validationCode);
            notificationData.put("expiresAt", expiresAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            notificationData.put("reportTitle", reportTitle);
            
            inAppNotificationService.sendNotification(requesterName, notificationData);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi du code de validation: " + e.getMessage());
        }
    }
    
    /**
     * Envoie une notification de téléchargement au propriétaire
     */
    public void sendDownloadNotification(String ownerName, String requesterName, String reportTitle) {
        try {
            System.out.println("=== NOTIFICATION: Rapport téléchargé ===");
            System.out.println("Propriétaire: " + ownerName);
            System.out.println("Demandeur: " + requesterName);
            System.out.println("Rapport: " + reportTitle);
            System.out.println("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            System.out.println("=========================================");
            
            // Envoyer par email
            String subject = "📥 Rapport téléchargé - " + reportTitle;
            String emailContent = String.format(
                "%s a téléchargé votre rapport \"%s\".\n" +
                "Date de téléchargement: %s",
                requesterName, reportTitle, LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            );
            emailService.sendEmail(ownerName, subject, emailContent);
            
            // Notification in-app
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("title", "Rapport téléchargé");
            notificationData.put("message", requesterName + " a téléchargé votre rapport \"" + reportTitle + "\"");
            notificationData.put("type", "REPORT_DOWNLOADED");
            notificationData.put("requesterName", requesterName);
            notificationData.put("reportTitle", reportTitle);
            notificationData.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            
            inAppNotificationService.sendNotification(ownerName, notificationData);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de la notification de téléchargement: " + e.getMessage());
        }
    }
    
    /**
     * Envoie une notification de téléchargement effectué (pour compatibilité)
     */
    public void sendDownloadCompleted(String userId, String reportTitle, String downloadUrl) {
        try {
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("title", "Téléchargement effectué");
            notificationData.put("message", "Vous avez téléchargé \"" + reportTitle + "\"");
            notificationData.put("type", "DOWNLOAD_COMPLETED");
            notificationData.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            
            inAppNotificationService.sendNotification(userId, notificationData);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de la notification de téléchargement: " + e.getMessage());
        }
    }
}
