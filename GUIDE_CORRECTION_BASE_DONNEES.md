# 🔧 Guide de Correction de la Base de Données

## ❌ **Problème Identifié**

Le backend ne démarre pas à cause d'un conflit de colonnes dans la table `access_requests` :
```
Table [access_requests] contains physical column name [expires_at] referred to by multiple logical column names: [expiresAt], [expires_at]
```

## ✅ **Solution**

Nous devons nettoyer et recréer les tables avec la bonne structure.

## 🚀 **Étapes de Correction**

### **Étape 1 : Arrêter le Backend**
```bash
# Si le backend tourne en Docker
docker stop assurance_backend

# Si le backend tourne localement
# Arrêter le processus Spring Boot
```

### **Étape 2 : Se Connecter à la Base de Données**

#### **Option A : Via psql (recommandé)**
```bash
# Se connecter à PostgreSQL
psql -h localhost -U postgres -d assurance_db

# Ou si vous utilisez Docker
docker exec -it assurance_postgres psql -U postgres -d assurance_db
```

#### **Option B : Via pgAdmin ou autre client SQL**

### **Étape 3 : Exécuter les Scripts de Correction**

#### **Script 1 : Corriger access_requests**
```sql
-- Copier et coller le contenu de fix_database_conflict.sql
-- Ou exécuter directement :

-- Supprimer la table problématique
DROP TABLE IF EXISTS access_requests CASCADE;
DROP SEQUENCE IF EXISTS access_requests_id_seq CASCADE;

-- Créer la nouvelle table
CREATE TABLE access_requests (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    requester_id VARCHAR(255) NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_company VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(50),
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(255),
    temporary_code VARCHAR(20),
    expires_at TIMESTAMP,
    rejection_reason TEXT
);

-- Créer les index
CREATE INDEX idx_access_requests_report_id ON access_requests(report_id);
CREATE INDEX idx_access_requests_requester_id ON access_requests(requester_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_access_requests_requested_at ON access_requests(requested_at);
```

#### **Script 2 : Créer temporary_access_codes**
```sql
-- Copier et coller le contenu de fix_temporary_access_codes.sql
-- Ou exécuter directement :

-- Supprimer la table si elle existe
DROP TABLE IF EXISTS temporary_access_codes CASCADE;
DROP SEQUENCE IF EXISTS temporary_access_codes_id_seq CASCADE;

-- Créer la nouvelle table
CREATE TABLE temporary_access_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    report_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL
);

-- Créer les index
CREATE INDEX idx_temporary_access_codes_code ON temporary_access_codes(code);
CREATE INDEX idx_temporary_access_codes_report_id ON temporary_access_codes(report_id);
CREATE INDEX idx_temporary_access_codes_user_id ON temporary_access_codes(user_id);
CREATE INDEX idx_temporary_access_codes_expires_at ON temporary_access_codes(expires_at);
CREATE INDEX idx_temporary_access_codes_used ON temporary_access_codes(used);
```

### **Étape 4 : Vérifier la Correction**

```sql
-- Vérifier que les tables existent
\dt access_requests
\dt temporary_access_codes

-- Vérifier la structure des tables
\d access_requests
\d temporary_access_codes

-- Vérifier qu'il n'y a plus de conflit
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'access_requests'
ORDER BY ordinal_position;
```

### **Étape 5 : Redémarrer le Backend**

```bash
# Si vous utilisez Docker
docker start assurance_backend

# Si vous utilisez Maven localement
cd backend
mvnw.cmd spring-boot:run
```

## 🧪 **Test de Validation**

### **Vérifier les Logs du Backend**
```bash
# Docker
docker logs assurance_backend --tail 50

# Attendre le message : "Started App in X.XXX seconds"
```

### **Tester l'API**
```bash
# Tester que l'API répond
curl http://localhost:8080/api/health

# Ou ouvrir dans le navigateur
http://localhost:8080/api/health
```

## 📋 **Codes de Test Disponibles**

Après avoir exécuté les scripts, vous aurez ces codes de test :

### **Codes Temporaires Valides :**
- `ABC-123-DEF` (pour report_id = 1)
- `XYZ-789-GHI` (pour report_id = 2)
- `TEST-001-CODE` (pour report_id = 3)

### **Demandes d'Accès de Test :**
- Une demande approuvée avec code `ABC-123-DEF`
- Une demande en attente

## 🐛 **Dépannage**

### **Erreur "table does not exist"**
- Vérifier que les scripts ont été exécutés correctement
- Vérifier que vous êtes connecté à la bonne base de données

### **Erreur de permissions**
- Vérifier que l'utilisateur PostgreSQL a les droits suffisants
- Utiliser un utilisateur avec privilèges d'administrateur

### **Le backend ne démarre toujours pas**
- Vérifier les logs complets du backend
- Vérifier que toutes les tables ont été créées correctement

## ✅ **Résultat Attendu**

Après avoir suivi ce guide :

1. ✅ **Base de données nettoyée** sans conflit de colonnes
2. ✅ **Tables créées** avec la bonne structure
3. ✅ **Backend démarre** sans erreur
4. ✅ **API fonctionnelle** pour les tests
5. ✅ **Codes de test** disponibles

---

**🎉 Une fois ces étapes terminées, vous pourrez tester le téléchargement avec code temporaire !**
