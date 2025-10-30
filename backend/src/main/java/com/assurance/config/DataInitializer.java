package com.assurance.config;

import com.assurance.domain.Report;
import com.assurance.domain.InsuranceCase;
import com.assurance.domain.User;
import com.assurance.repo.ReportRepository;
import com.assurance.repo.InsuranceCaseRepository;
import com.assurance.repo.ReportFileRepository;
import com.assurance.repo.CaseAttachmentRepository;
import com.assurance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedReports(ReportRepository reportRepo, InsuranceCaseRepository caseRepo, 
                                 ReportFileRepository reportFileRepo, CaseAttachmentRepository caseAttachmentRepo,
                                 UserRepository userRepo) {
        return args -> {
            // Corriger les dates d'expiration des utilisateurs
            fixUserSubscriptionDates(userRepo);
            
            // Vérifier si la base de données est vide avant de supprimer
            long caseCount = caseRepo.count();
            long reportCount = reportRepo.count();
            
            if (caseCount == 0 && reportCount == 0) {
                System.out.println("Base de données vide. Création des données de test...");
            } else {
                System.out.println("Base de données contient déjà des données. Pas de nettoyage automatique.");
                System.out.println("Dossiers existants: " + caseCount + ", Rapports existants: " + reportCount);
                return; // Ne pas supprimer les données existantes
            }
            
            // Créer des dossiers de test d'abord
            InsuranceCase case1 = new InsuranceCase();
            case1.setReference("Z60TFMIXUS");
            case1.setType(InsuranceCase.CaseType.ENQUETE);
            case1.setStatus(InsuranceCase.CaseStatus.SOUS_ENQUETE);
            case1.setCreatedBy("admin");
            case1.setDataJson("{\"beneficiaire_nom\":\"Kouadio\",\"beneficiaire_prenom\":\"Akissi\",\"assure_nom\":\"N'Guessan\",\"assure_prenom\":\"Koffi\",\"souscripteur_nom\":\"SAHAM\",\"souscripteur_prenom\":\"Assurances\",\"initiateur\":\"Service Fraude Axa\"}");
            case1 = caseRepo.save(case1);

            InsuranceCase case2 = new InsuranceCase();
            case2.setReference("A238ANALYSE");
            case2.setType(InsuranceCase.CaseType.ENQUETE);
            case2.setStatus(InsuranceCase.CaseStatus.SOUS_ENQUETE);
            case2.setCreatedBy("admin");
            case2.setDataJson("{\"beneficiaire_nom\":\"Koné\",\"beneficiaire_prenom\":\"Mariam\",\"assure_nom\":\"Tra Bi\",\"assure_prenom\":\"Yao\",\"souscripteur_nom\":\"NSIA\",\"souscripteur_prenom\":\"\",\"initiateur\":\"Allianz\"}");
            case2 = caseRepo.save(case2);

            InsuranceCase case3 = new InsuranceCase();
            case3.setReference("VERIFID001");
            case3.setType(InsuranceCase.CaseType.ENQUETE);
            case3.setStatus(InsuranceCase.CaseStatus.SOUS_ENQUETE);
            case3.setCreatedBy("admin");
            case3.setDataJson("{\"beneficiaire_nom\":\"Zoumana\",\"beneficiaire_prenom\":\"Fofana\",\"assure_nom\":\"Kaba\",\"assure_prenom\":\"Amadou\",\"souscripteur_nom\":\"SUNU\",\"souscripteur_prenom\":\"Vie\",\"initiateur\":\"SUNU\"}");
            case3 = caseRepo.save(case3);

            InsuranceCase case4 = new InsuranceCase();
            case4.setReference("SCORE001");
            case4.setType(InsuranceCase.CaseType.ENQUETE);
            case4.setStatus(InsuranceCase.CaseStatus.SOUS_ENQUETE);
            case4.setCreatedBy("admin");
            case4.setDataJson("{\"beneficiaire_nom\":\"Adjoba\",\"beneficiaire_prenom\":\"Aya\",\"assure_nom\":\"Bamba\",\"assure_prenom\":\"Oumar\",\"souscripteur_nom\":\"AXA\",\"souscripteur_prenom\":\"\",\"initiateur\":\"AXA\"}");
            case4 = caseRepo.save(case4);

            // Créer les rapports et les lier aux dossiers
            Report r1 = new Report();
            r1.setTitle("Suspicion multi‑contrats");
            r1.setBeneficiary("Kouadio Akissi");
            r1.setInitiator("Service Fraude Axa");
            r1.setInsured("N'Guessan Koffi");
            r1.setSubscriber("SAHAM Assurances");
            r1.setCaseId("Z60TFMIXUS");

            Report r2 = new Report();
            r2.setTitle("Analyse sinistre #A-238");
            r2.setBeneficiary("Koné Mariam");
            r2.setInitiator("Allianz");
            r2.setInsured("Tra Bi Yao");
            r2.setSubscriber("NSIA");
            r2.setStatus(Report.Status.EN_ATTENTE);
            r2.setCaseId("A238ANALYSE");

            Report r3 = new Report();
            r3.setTitle("Vérification identité");
            r3.setBeneficiary("Zoumana Fofana");
            r3.setInitiator("SUNU");
            r3.setInsured("Kaba Amadou");
            r3.setSubscriber("SUNU Vie");
            r3.setStatus(Report.Status.TRAITE);
            r3.setCaseId("VERIFID001");

            Report r4 = new Report();
            r4.setTitle("Score risque assuré");
            r4.setBeneficiary("Adjoba Aya");
            r4.setInitiator("AXA");
            r4.setInsured("Bamba Oumar");
            r4.setSubscriber("AXA");
            r4.setCaseId("SCORE001");

            reportRepo.save(r1);
            reportRepo.save(r2);
            reportRepo.save(r3);
            reportRepo.save(r4);
        };
    }
    
    /**
     * Corrige les dates d'expiration des utilisateurs existants
     */
    private void fixUserSubscriptionDates(UserRepository userRepo) {
        List<User> users = userRepo.findAll();
        LocalDate now = LocalDate.now();
        
        for (User user : users) {
            // Vérifier si l'utilisateur a une date d'expiration incorrecte
            if (user.getSubscriptionEndDate() != null) {
                long daysUntilExpiration = user.getDaysUntilExpiration();
                
                // Si l'utilisateur a une date d'expiration future mais seulement quelques jours restants
                // cela indique une incohérence dans les données
                if (user.getSubscriptionEndDate().isAfter(now) && daysUntilExpiration <= 30) {
                    System.out.println("Correction de la date d'expiration pour l'utilisateur: " + user.getUsername());
                    
                    // Pour les administrateurs, garder une date très éloignée
                    if (user.getRole() == User.UserRole.ADMIN) {
                        user.setSubscriptionEndDate(now.plusYears(100));
                    } else {
                        // Pour les utilisateurs normaux, définir une date d'expiration réaliste
                        // Si l'abonnement est actif, le faire expirer dans 1 an
                        if (user.isSubscriptionActive()) {
                            user.setSubscriptionEndDate(now.plusYears(1));
                        } else {
                            // Si l'abonnement n'est pas actif, le faire expirer dans le passé
                            user.setSubscriptionEndDate(now.minusDays(30));
                        }
                    }
                    
                    // Mettre à jour le statut de l'abonnement
                    user.updateSubscriptionStatus();
                    userRepo.save(user);
                }
            }
        }
        
        System.out.println("Correction des dates d'expiration terminée.");
    }
}


