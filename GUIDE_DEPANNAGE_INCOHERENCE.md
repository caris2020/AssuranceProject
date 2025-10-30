# Guide de Dépannage - Incohérence Persistante

## Problème
L'incohérence dans l'affichage des jours restants persiste malgré les corrections de code.

## Diagnostic

### 1. Vérifier si les Corrections de Code sont Déployées

**Test 1 : Vérifier l'API**
```bash
# Ouvrir le fichier test_current_state.html dans un navigateur
# Cliquer sur "Tester l'État Actuel"
```

**Résultat attendu :**
- Si l'API retourne le bon nombre de jours → Les corrections sont déployées
- Si l'API retourne toujours 0 jours → Les corrections ne sont pas déployées

### 2. Vérifier le Cache du Navigateur

**Solution :**
1. Ouvrir les outils de développement (F12)
2. Clic droit sur le bouton de rechargement
3. Sélectionner "Vider le cache et recharger"
4. Ou utiliser Ctrl+Shift+R (rechargement forcé)

### 3. Vérifier le Redémarrage du Backend

**Vérifier les logs :**
```bash
docker-compose logs backend
```

**Redémarrer si nécessaire :**
```bash
docker-compose restart backend
```

### 4. Problème avec la Base de Données

Si les corrections de code fonctionnent mais l'interface affiche encore l'incohérence :

**Cause probable :** Cache du frontend ou données en cache

**Solutions :**

#### Solution A : Vider le Cache du Frontend
1. Ouvrir l'application dans un navigateur en mode incognito
2. Ou vider le localStorage :
   ```javascript
   // Dans la console du navigateur
   localStorage.clear();
   sessionStorage.clear();
   ```

#### Solution B : Forcer la Mise à Jour des Données
1. Se déconnecter et se reconnecter
2. Ou recharger la page avec Ctrl+Shift+R

#### Solution C : Vérifier les Données en Temps Réel
```bash
# Vérifier les données actuelles
docker-compose exec db psql -U postgres -d assurance -c "SELECT username, subscription_start_date, subscription_end_date FROM users WHERE username = 'octavio';"
```

## Solutions par Ordre de Priorité

### 1. Redémarrage Complet
```bash
# Arrêter tous les services
docker-compose down

# Redémarrer
docker-compose up -d

# Vérifier les logs
docker-compose logs backend
```

### 2. Vider le Cache du Navigateur
1. Ouvrir l'application en mode incognito
2. Ou vider complètement le cache du navigateur

### 3. Vérifier l'API Directement
Utiliser le fichier `test_current_state.html` pour tester l'API directement.

### 4. Corriger les Données (Si Nécessaire)
Si les dates sont toujours dans le futur, essayer de les corriger manuellement :

```sql
-- Exécuter dans la base de données
UPDATE users 
SET subscription_start_date = '2024-01-01', 
    subscription_end_date = '2024-12-31'
WHERE username = 'octavio';
```

## Vérification Finale

Après avoir appliqué les solutions :

1. **Ouvrir l'application en mode incognito**
2. **Se connecter avec l'utilisateur octavio**
3. **Vérifier l'affichage des informations d'abonnement**

**Résultat attendu :**
- Si l'abonnement est dans le futur : "Commence dans X jours"
- Si l'abonnement est en cours : "X jours restants"
- Si l'abonnement est expiré : "Expiré"

## Fichiers de Test Disponibles

1. `test_current_state.html` - Test de l'API
2. `test_subscription_logic.html` - Test de la logique
3. `test_subscription_calculation.html` - Test complet

## Contact

Si le problème persiste après avoir essayé toutes ces solutions, vérifiez :
1. Les logs du backend pour des erreurs
2. La console du navigateur pour des erreurs JavaScript
3. Les requêtes réseau dans les outils de développement
