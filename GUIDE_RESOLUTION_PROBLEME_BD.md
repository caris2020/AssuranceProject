# 🔧 Guide de Résolution - Problème de Chargement Base de Données

## 🚨 Problème Identifié
Vous n'arrivez pas à charger les éléments de votre base de données. Cela peut être dû à plusieurs causes :

1. **Tables manquantes** - Les tables principales n'existent pas
2. **Structure incorrecte** - Les colonnes ne correspondent pas aux entités
3. **Problèmes de contraintes** - Clés étrangères manquantes ou incorrectes
4. **Erreurs LOB** - Problèmes avec les colonnes BYTEA

## 🎯 Solution Rapide

### Étape 1: Diagnostic (Optionnel mais recommandé)
Exécutez le script de diagnostic pour identifier les problèmes :

```bash
# Avec pgAdmin (Recommandé)
# 1. Ouvrez pgAdmin
# 2. Connectez-vous à votre serveur PostgreSQL
# 3. Sélectionnez la base de données 'assurance'
# 4. Ouvrez l'éditeur SQL
# 5. Copiez-collez le contenu de diagnostic_complet_bd.sql
# 6. Exécutez le script
```

### Étape 2: Réparation Automatique
Exécutez le script de réparation automatique :

```bash
# Avec pgAdmin (Recommandé)
# 1. Ouvrez pgAdmin
# 2. Connectez-vous à votre serveur PostgreSQL
# 3. Sélectionnez la base de données 'assurance'
# 4. Ouvrez l'éditeur SQL
# 5. Copiez-collez le contenu de reparation_automatique_bd.sql
# 6. Exécutez le script
```

### Étape 3: Vérification
Après la réparation, vérifiez que tout fonctionne :

```sql
-- Vérifier l'existence des tables
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('reports', 'insurance_cases', 'report_files', 'case_attachments');

-- Vérifier les données
SELECT COUNT(*) as reports_count FROM reports;
SELECT COUNT(*) as cases_count FROM insurance_cases;
```

## 🔄 Étapes Post-Réparation

### 1. Redémarrer l'Application
```bash
# Arrêtez votre application Spring Boot (Ctrl+C)
# Puis redémarrez-la
./mvnw spring-boot:run
```

### 2. Tester la Fonctionnalité
1. Ouvrez `test_file_management.html` dans votre navigateur
2. Testez l'upload d'un fichier vers un rapport (ID: 1)
3. Testez l'upload d'un fichier vers un dossier (ID: 1)
4. Vérifiez que les fichiers apparaissent dans la liste

### 3. Vérifier l'Association
- Les fichiers doivent être associés aux cartes (rapports/dossiers)
- Vous devez pouvoir télécharger les fichiers
- Les métadonnées doivent être correctement affichées

## 🛠️ Méthodes d'Exécution des Scripts

### Option 1: pgAdmin (Recommandé)
1. **Téléchargez pgAdmin** depuis https://www.pgadmin.org/
2. **Installez et configurez** pgAdmin
3. **Connectez-vous** à votre serveur PostgreSQL
4. **Sélectionnez** la base de données `assurance`
5. **Ouvrez** l'éditeur SQL (icône avec symbole SQL)
6. **Copiez-collez** le contenu du script
7. **Exécutez** le script (F5 ou bouton Exécuter)

### Option 2: psql (Si vous avez les credentials)
```bash
# Testez d'abord la connexion
psql -d assurance -U votre_utilisateur -h localhost

# Si ça fonctionne, exécutez le script
psql -d assurance -U votre_utilisateur -f reparation_automatique_bd.sql
```

### Option 3: Autre Client PostgreSQL
- **DBeaver** (gratuit, multiplateforme)
- **pgAdmin Web** (interface web)
- **Azure Data Studio** avec extension PostgreSQL

## 📋 Checklist de Validation

- [ ] Script de réparation exécuté sans erreur
- [ ] Tables `reports`, `insurance_cases`, `report_files`, `case_attachments` créées
- [ ] Données de test insérées (3 rapports, 3 dossiers)
- [ ] Application Spring Boot redémarrée
- [ ] Test d'upload de fichier réussi
- [ ] Association fichier-carte fonctionnelle
- [ ] Téléchargement de fichiers fonctionnel

## 🆘 En Cas de Problème

### Erreur: "password authentication failed"
**Solution:** Utilisez pgAdmin ou vérifiez vos credentials PostgreSQL

### Erreur: "table does not exist"
**Solution:** Le script de réparation automatique devrait résoudre ce problème

### Erreur: "permission denied"
**Solution:** Vérifiez que votre utilisateur a les droits suffisants

### Erreur: "connection refused"
**Solution:** Vérifiez que PostgreSQL est démarré et accessible

## 📞 Support

Si vous rencontrez encore des problèmes :

1. **Exécutez** le script de diagnostic (`diagnostic_complet_bd.sql`)
2. **Notez** les erreurs spécifiques
3. **Vérifiez** les logs PostgreSQL
4. **Consultez** la documentation PostgreSQL

## 🎉 Résultat Attendu

Après la réparation, vous devriez avoir :
- ✅ Base de données fonctionnelle
- ✅ Tables correctement structurées
- ✅ Données de test disponibles
- ✅ Fonctionnalité d'upload de fichiers opérationnelle
- ✅ Association fichiers-cartes fonctionnelle

**Votre application devrait maintenant pouvoir charger et gérer les éléments de la base de données correctement !**
