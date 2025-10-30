package com.assurance.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {
    
    /**
     * Envoie un SMS
     */
    public void sendSms(String phoneNumber, String message) {
        // TODO: Implémenter l'envoi de SMS avec un service comme Twilio, AWS SNS, etc.
        System.out.println("📱 SMS envoyé à " + phoneNumber);
        System.out.println("Message: " + message);
    }
    
    /**
     * Vérifie si un numéro de téléphone est valide
     */
    public boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        
        // Validation basique pour les numéros ivoiriens
        String cleanNumber = phoneNumber.replaceAll("[^0-9+]", "");
        return cleanNumber.length() >= 10 && cleanNumber.length() <= 15;
    }
}
