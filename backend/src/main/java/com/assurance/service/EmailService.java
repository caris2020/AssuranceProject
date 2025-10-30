package com.assurance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    /**
     * Envoie un email simple
     */
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            System.out.println("Email simple envoyé avec succès à: " + to);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'email simple: " + e.getMessage());
            // Fallback: afficher dans les logs pour le débogage
            System.out.println("=== EMAIL SIMPLE (FALLBACK) ===");
            System.out.println("À: " + to);
            System.out.println("Sujet: " + subject);
            System.out.println("Contenu: " + text);
            System.out.println("==================");
        }
    }
    
    /**
     * Envoie un email HTML
     */
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true pour HTML
            
            mailSender.send(message);
            System.out.println("Email HTML envoyé avec succès à: " + to);
        } catch (MessagingException e) {
            System.err.println("Erreur lors de l'envoi de l'email HTML: " + e.getMessage());
            // Fallback: afficher dans les logs pour le débogage
            System.out.println("=== EMAIL HTML (FALLBACK) ===");
            System.out.println("À: " + to);
            System.out.println("Sujet: " + subject);
            System.out.println("Contenu HTML: " + htmlContent);
            System.out.println("==================");
        }
    }
}
