# 🚀 Guide de Test - Système d'Authentification

## ✅ Système Prêt à Tester

Le système d'authentification est maintenant opérationnel ! Voici comment le tester :

## 🌐 Accès au Système

### **Frontend** : http://localhost:5173
### **Backend** : http://localhost:8080

## 🔐 Test de Connexion Administrateur

### **Identifiants Administrateur :**
- **Compagnie d'assurance** : `Système`
- **Nom d'utilisateur** : `admin`
- **Mot de passe** : `password`

### **Étapes de Test :**

1. **Ouvrez votre navigateur** et allez sur http://localhost:5173
2. **Vous devriez être redirigé** automatiquement vers la page de connexion
3. **Saisissez les identifiants** administrateur ci-dessus
4. **Cliquez sur "Se connecter"**
5. **Vous devriez accéder** au tableau de bord principal

## 📱 Pages Disponibles

### **Sans Connexion :**
- `/login` - Page de connexion
- `/register` - Page d'inscription (avec token d'invitation)

### **Avec Connexion :**
- `/` - Tableau de bord principal
- `/rapports` - Gestion des rapports
- `/dossiers` - Gestion des dossiers
- `/notifications` - Notifications
- `/admin` - Tableau de bord administrateur (rôle admin uniquement)

## 🎯 Fonctionnalités à Tester

### **1. Connexion Administrateur**
- ✅ Connexion avec les identifiants admin
- ✅ Accès au tableau de bord administrateur
- ✅ Affichage des statistiques

### **2. Navigation**
- ✅ Menu de navigation visible après connexion
- ✅ Bouton de déconnexion fonctionnel
- ✅ Redirection automatique vers login si non connecté

### **3. Protection des Routes**
- ✅ Accès refusé aux pages protégées sans connexion
- ✅ Redirection automatique vers login
- ✅ Accès admin réservé aux utilisateurs admin

## 🔧 Dépannage

### **Si la page de connexion ne s'affiche pas :**
1. Vérifiez que le frontend fonctionne : http://localhost:5173
2. Vérifiez les logs du navigateur (F12)
3. Redémarrez le frontend si nécessaire

### **Si la connexion échoue :**
1. Vérifiez que le backend fonctionne : http://localhost:8080
2. Vérifiez que l'utilisateur admin existe dans la base de données
3. Vérifiez les logs du backend

### **Si les pages ne se chargent pas :**
1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que toutes les dépendances sont installées
3. Redémarrez le serveur de développement

## 📊 Vérification de l'État

### **Backend (Docker) :**
```bash
docker ps
# Doit afficher : assurance_backend et assurance_db
```

### **Frontend :**
```bash
cd assurance_connect
npm run dev
# Doit afficher : Local: http://localhost:5173/
```

### **Base de Données :**
```bash
docker exec -i assurance_db psql -U postgres -d assurance -c "SELECT username, role, status FROM users WHERE username = 'admin';"
# Doit afficher : admin | ADMIN | REGISTERED
```

## 🎉 Résultat Attendu

Après une connexion réussie, vous devriez voir :
- ✅ Le tableau de bord principal
- ✅ Le menu de navigation avec toutes les options
- ✅ Le bouton "Admin" visible (pour les administrateurs)
- ✅ Votre nom affiché dans l'en-tête
- ✅ Un bouton de déconnexion fonctionnel

## 🚀 Prochaines Étapes

Une fois la connexion testée avec succès :
1. **Testez l'envoi d'invitations** depuis le tableau de bord admin
2. **Testez l'inscription** d'un nouvel utilisateur
3. **Testez la gestion des demandes d'accès**
4. **Explorez toutes les fonctionnalités** du système

Le système est maintenant **100% fonctionnel** ! 🎯
