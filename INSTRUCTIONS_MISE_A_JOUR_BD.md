# Instructions pour la Mise à Jour de la Base de Données

## 🎯 Objectif
Activer la fonctionnalité d'association des fichiers aux cartes (rapports/dossiers) en créant ou mettant à jour les tables nécessaires.

## 📋 Prérequis
- PostgreSQL installé et configuré
- Accès à la base de données `assurance`
- Permissions d'administration sur la base de données

## 🔧 Étapes de Mise à Jour

### Étape 1: Vérification de l'état actuel
Exécutez d'abord le script de vérification pour diagnostiquer l'état de votre base de données :

```bash
# Option 1: Avec psql (si vous avez les credentials)
psql -d assurance -U votre_utilisateur -f check_database_status.sql

# Option 2: Avec pgAdmin ou autre client PostgreSQL
# Ouvrez le fichier check_database_status.sql et exécutez-le
```

### Étape 2: Création/Mise à jour des tables
Exécutez le script de création des tables :

```bash
# Option 1: Avec psql
psql -d assurance -U votre_utilisateur -f create_file_tables.sql

# Option 2: Avec pgAdmin ou autre client PostgreSQL
# Ouvrez le fichier create_file_tables.sql et exécutez-le
```

### Étape 3: Mise à jour des tables existantes (si nécessaire)
Si les tables existent déjà, exécutez le script de mise à jour :

```bash
# Option 1: Avec psql
psql -d assurance -U votre_utilisateur -f update_file_tables.sql

# Option 2: Avec pgAdmin ou autre client PostgreSQL
# Ouvrez le fichier update_file_tables.sql et exécutez-le
```

## 🔐 Résolution des Problèmes d'Authentification

### Problème: "password authentication failed"

**Solutions possibles :**

1. **Vérifiez vos credentials PostgreSQL :**
   ```bash
   # Testez la connexion
   psql -d assurance -U votre_utilisateur -h localhost
   ```

2. **Utilisez pgAdmin ou un autre client graphique :**
   - Ouvrez pgAdmin
   - Connectez-vous à votre serveur PostgreSQL
   - Sélectionnez la base de données `assurance`
   - Ouvrez l'éditeur SQL et exécutez les scripts

3. **Vérifiez le fichier pg_hba.conf :**
   - Localisez le fichier de configuration PostgreSQL
   - Vérifiez les méthodes d'authentification

4. **Utilisez les variables d'environnement :**
   ```bash
   export PGPASSWORD=votre_mot_de_passe
   psql -d assurance -U votre_utilisateur -h localhost -f create_file_tables.sql
   ```

## 📊 Vérification de la Mise à Jour

Après l'exécution des scripts, vérifiez que tout fonctionne :

1. **Vérifiez l'existence des tables :**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('report_files', 'case_attachments');
   ```

2. **Vérifiez la structure des tables :**
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'report_files'
   ORDER BY ordinal_position;
   ```

3. **Vérifiez les contraintes de clés étrangères :**
   ```sql
   SELECT tc.table_name, tc.constraint_name, kcu.column_name
   FROM information_schema.table_constraints tc
   JOIN information_schema.key_column_usage kcu 
   ON tc.constraint_name = kcu.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY'
   AND tc.table_name IN ('report_files', 'case_attachments');
   ```

## 🚀 Test de la Fonctionnalité

Une fois la base de données mise à jour :

1. **Redémarrez votre application Spring Boot**
2. **Ouvrez le fichier de test :** `test_file_management.html`
3. **Testez l'upload d'un fichier :**
   - Créez un rapport ou un dossier d'abord
   - Utilisez l'interface de test pour uploader un fichier
   - Vérifiez que le fichier est bien associé à la carte

## 📁 Fichiers de Scripts Disponibles

- `check_database_status.sql` - Diagnostic de l'état actuel
- `create_file_tables.sql` - Création des tables si elles n'existent pas
- `update_file_tables.sql` - Mise à jour des tables existantes

## ⚠️ Notes Importantes

1. **Sauvegarde :** Faites une sauvegarde de votre base de données avant toute modification
2. **Permissions :** Assurez-vous d'avoir les droits suffisants pour créer/modifier des tables
3. **Dépendances :** Les tables `reports` et `insurance_cases` doivent exister pour les contraintes FK
4. **Rollback :** En cas de problème, vous pouvez supprimer les tables créées :
   ```sql
   DROP TABLE IF EXISTS case_attachments CASCADE;
   DROP TABLE IF EXISTS report_files CASCADE;
   ```

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs PostgreSQL
2. Exécutez le script de diagnostic
3. Vérifiez les permissions utilisateur
4. Consultez la documentation PostgreSQL

## ✅ Checklist de Validation

- [ ] Script de vérification exécuté sans erreur
- [ ] Tables `report_files` et `case_attachments` créées
- [ ] Index créés pour les performances
- [ ] Contraintes de clés étrangères configurées
- [ ] Triggers pour `updated_at` créés
- [ ] Application redémarrée
- [ ] Test d'upload de fichier réussi
- [ ] Association fichier-carte fonctionnelle
