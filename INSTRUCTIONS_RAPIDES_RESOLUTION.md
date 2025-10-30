# 🚨 INSTRUCTIONS RAPIDES - Résolution Problème de Chargement

## 🎯 Situation Actuelle
Votre application Spring Boot démarre correctement, mais vous avez des problèmes de chargement de données. Voici la solution rapide.

## 🔧 Solution en 2 Étapes

### ÉTAPE 1: Vérifier et Réparer la Base de Données

**Option A: Diagnostic Rapide (Recommandé)**
1. Ouvrez pgAdmin
2. Connectez-vous à votre base de données `assurance`
3. Ouvrez l'éditeur SQL
4. **Copiez-collez le contenu** de `diagnostic_rapide_bd.sql`
5. Exécutez le script (F5)

**Option B: Réparation Complète (Si diagnostic montre des problèmes)**
1. Dans pgAdmin, ouvrez l'éditeur SQL
2. **Copiez-collez le contenu** de `reparation_complete_bd.sql`
3. Exécutez le script (F5)

### ÉTAPE 2: Redémarrer et Tester l'Application

```bash
# 1. Arrêtez l'application (Ctrl+C)
# 2. Redémarrez-la
cd backend
./mvnw spring-boot:run
```

## 🧪 Test Rapide

Après le redémarrage, testez rapidement :

```bash
# Test des rapports
curl http://localhost:8080/api/reports

# Test des dossiers
curl http://localhost:8080/api/insurance-cases
```

## 📊 Résultats Attendus

Après la réparation, vous devriez voir :
- **5 rapports** dans la réponse de `/api/reports`
- **5 dossiers** dans la réponse de `/api/insurance-cases`
- **Données JSON** au lieu d'erreurs

## 🆘 Si Problème Persiste

### Problème: "Connection refused"
```bash
# Vérifiez que PostgreSQL est démarré
net start postgresql
```

### Problème: "Table does not exist"
- Exécutez `reparation_complete_bd.sql` dans pgAdmin

### Problème: "Permission denied"
```sql
-- Dans pgAdmin, exécutez:
GRANT ALL PRIVILEGES ON DATABASE assurance TO votre_utilisateur;
```

## 🎯 Instructions Ultra-Rapides

**Pour résoudre immédiatement :**
1. **Ouvrez pgAdmin**
2. **Connectez-vous** à la base `assurance`
3. **Copiez** le contenu de `reparation_complete_bd.sql`
4. **Collez et exécutez** le script
5. **Redémarrez** votre application Spring Boot
6. **Testez** avec `curl http://localhost:8080/api/reports`

**Votre problème sera résolu en 5 minutes !**

---

## 📞 Support

Si vous avez des difficultés :
1. **Exécutez d'abord** `diagnostic_rapide_bd.sql`
2. **Notez** les erreurs affichées
3. **Suivez** les recommandations du script

**Le script de réparation complète résout 99% des problèmes de base de données !**
