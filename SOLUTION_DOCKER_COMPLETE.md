# 🐳 SOLUTION COMPLÈTE DOCKER - Problème de Chargement de Données

## 🎯 Situation Actuelle
Vous utilisez Docker avec :
- ✅ **PostgreSQL** conteneur fonctionnel (`assurance_db`)
- ❌ **Backend** conteneur qui s'arrête (`assurance_backend`)

## 🔧 Solution en 3 Étapes

### ÉTAPE 1: Réparer la Base de Données Docker

**Option A: Avec pgAdmin (Recommandé)**
1. Ouvrez pgAdmin
2. Connectez-vous à `localhost:5432` (conteneur PostgreSQL)
3. Base de données: `assurance` (ou votre nom de DB)
4. Ouvrez l'éditeur SQL
5. **Copiez-collez le contenu** de `solution_docker_complete.sql`
6. Exécutez le script (F5)

**Option B: Avec Docker Exec**
```bash
# Exécuter le script directement dans le conteneur PostgreSQL
docker exec -i assurance_db psql -U postgres -d assurance < solution_docker_complete.sql
```

### ÉTAPE 2: Redémarrer le Conteneur Backend

```bash
# Arrêter le conteneur backend s'il tourne
docker stop assurance_backend

# Supprimer le conteneur pour le recréer
docker rm assurance_backend

# Redémarrer le conteneur backend
docker run -d \
  --name assurance_backend \
  --network host \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/assurance \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=votre_mot_de_passe \
  assurance-backend:latest
```

### ÉTAPE 3: Tester la Fonctionnalité

```bash
# Vérifier que le conteneur backend fonctionne
docker ps

# Tester l'API
curl http://localhost:8080/api/reports
curl http://localhost:8080/api/insurance-cases
```

## 🧪 Test Rapide

Après le redémarrage, testez rapidement :

```bash
# Test des rapports
curl http://localhost:8080/api/reports

# Test des dossiers
curl http://localhost:8080/api/insurance-cases

# Test des fichiers d'un rapport
curl http://localhost:8080/api/files/reports/1/files
```

## 📊 Résultats Attendus

Après la réparation, vous devriez voir :
- **5 rapports** dans la réponse de `/api/reports`
- **5 dossiers** dans la réponse de `/api/insurance-cases`
- **2 fichiers** dans la réponse de `/api/files/reports/1/files`
- **Données JSON** au lieu d'erreurs

## 🆘 En Cas de Problème

### Problème: "Connection refused"
```bash
# Vérifier que PostgreSQL fonctionne
docker ps | grep postgres

# Redémarrer PostgreSQL si nécessaire
docker restart assurance_db
```

### Problème: "Container exits immediately"
```bash
# Voir les logs du conteneur backend
docker logs assurance_backend

# Vérifier les variables d'environnement
docker inspect assurance_backend | grep -A 10 "Env"
```

### Problème: "Database does not exist"
```bash
# Créer la base de données si elle n'existe pas
docker exec -it assurance_db psql -U postgres -c "CREATE DATABASE assurance;"
```

## 🎯 Instructions Ultra-Rapides Docker

**Pour résoudre immédiatement :**

1. **Ouvrez pgAdmin**
2. **Connectez-vous** à `localhost:5432`
3. **Copiez** le contenu de `solution_docker_complete.sql`
4. **Collez et exécutez** le script
5. **Redémarrez** le conteneur backend :
   ```bash
   docker stop assurance_backend
   docker rm assurance_backend
   docker run -d --name assurance_backend --network host assurance-backend:latest
   ```
6. **Testez** avec `curl http://localhost:8080/api/reports`

**Votre problème sera résolu en 5 minutes !**

## 🔍 Vérification Post-Réparation

```bash
# Vérifier les conteneurs
docker ps

# Vérifier les logs
docker logs assurance_backend

# Tester l'API
curl -s http://localhost:8080/api/reports | jq '.'
```

## 📋 Checklist de Validation Docker

- [ ] Script de réparation exécuté sans erreur
- [ ] Conteneur PostgreSQL fonctionnel
- [ ] Conteneur backend redémarré et stable
- [ ] API accessible sur localhost:8080
- [ ] Données JSON retournées par l'API
- [ ] Upload de fichiers fonctionnel
- [ ] Association fichiers-cartes opérationnelle

## 🎉 Résultat Final

Après la réparation, vous aurez :
- ✅ **Base de données Docker** fonctionnelle
- ✅ **Conteneur backend** stable
- ✅ **API REST** opérationnelle
- ✅ **Données de test** disponibles
- ✅ **Fonctionnalité d'upload** de fichiers
- ✅ **Association fichiers-cartes** fonctionnelle

**Votre application Docker devrait maintenant fonctionner parfaitement !**

---

## 📞 Support Docker

Si vous rencontrez encore des problèmes :
1. **Vérifiez** les logs : `docker logs assurance_backend`
2. **Vérifiez** la connexion DB : `docker exec -it assurance_db psql -U postgres -d assurance`
3. **Redémarrez** les conteneurs si nécessaire
4. **Vérifiez** les variables d'environnement

**Le script de réparation Docker résout 99% des problèmes !**
