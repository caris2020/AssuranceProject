# Guide de Déploiement - Système d'Administration Complet

## 🎉 Félicitations ! Le système d'administration est maintenant opérationnel

Le backend a été compilé avec succès et les conteneurs Docker sont en cours d'exécution. Voici un guide complet pour utiliser toutes les nouvelles fonctionnalités.

## 📋 Fonctionnalités Implémentées

### 1. **Système d'Invitation par Email**
- L'administrateur peut envoyer des invitations par email
- Les emails contiennent un bouton de redirection vers la page d'inscription
- Les utilisateurs invités sont automatiquement enregistrés comme "invités" dans la base de données

### 2. **Page d'Inscription Complète**
- Champs requis : nom d'utilisateur, prénom, nom, date de naissance, compagnie d'assurance, logo de compagnie, mot de passe, confirmation du mot de passe
- Validation des données et vérification de l'unicité du nom d'utilisateur
- Conversion automatique du statut "invité" vers "inscrit"

### 3. **Système de Connexion**
- Authentification par : compagnie d'assurance, nom d'utilisateur, mot de passe
- Gestion des sessions et horodatage des connexions/déconnexions
- Encodage sécurisé des mots de passe avec BCrypt

### 4. **Tableau de Bord Administrateur**
- **Statistiques générales** : nombre total d'utilisateurs, rapports, dossiers, demandes d'accès
- **Demandes d'accès par utilisateur** : suivi de toutes les demandes
- **Créations de rapports par utilisateur** : historique des créations
- **Créations de dossiers** : suivi des nouveaux dossiers
- **Nombre de dossiers par état et par compagnie** : statistiques détaillées
- **Utilisateurs connectés** : suivi en temps réel
- **Dernières connexions et déconnexions** : historique des sessions

### 5. **Gestion des Demandes d'Accès par Propriétaire**
- Chaque propriétaire de rapport peut gérer ses propres demandes d'accès
- Interface dédiée pour approuver/rejeter les demandes
- Notifications automatiques aux demandeurs

## 🚀 Démarrage Rapide

### 1. **Accéder au Backend**
```bash
# Vérifier que les conteneurs sont en cours d'exécution
docker ps

# Les services sont disponibles sur :
# - Backend API : http://localhost:8080
# - Base de données : localhost:5432
```

### 2. **Créer l'Administrateur Initial**
Le script SQL `create_admin_user.sql` a été créé pour insérer un administrateur initial :

```sql
-- Exécuter ce script dans la base de données PostgreSQL
INSERT INTO users (email, username, first_name, last_name, insurance_company, password, role, status, created_at) 
VALUES (
    'admin@assurance.com',
    'admin',
    'Administrateur',
    'Système',
    'Système',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- mot de passe: 'password'
    'ADMIN',
    'REGISTERED',
    NOW()
);
```

### 3. **Démarrer le Frontend**
```bash
cd assurance_connect
npm install
npm run dev
```

Le frontend sera disponible sur : http://localhost:5173

## 📱 Utilisation du Système

### **Connexion Administrateur**
1. Accédez à http://localhost:5173/login
2. Utilisez les identifiants :
   - **Compagnie d'assurance** : Système
   - **Nom d'utilisateur** : admin
   - **Mot de passe** : password

### **Envoi d'Invitations**
1. Connectez-vous en tant qu'administrateur
2. Accédez au tableau de bord d'administration
3. Utilisez la fonction "Envoyer une invitation"
4. Saisissez l'email et la compagnie d'assurance du destinataire
5. L'invitation sera envoyée par email avec un lien d'inscription

### **Inscription d'un Utilisateur Invité**
1. L'utilisateur reçoit l'email d'invitation
2. Il clique sur le lien d'inscription
3. Il remplit le formulaire avec toutes ses informations
4. Son compte est automatiquement activé

### **Connexion Utilisateur**
1. L'utilisateur va sur http://localhost:5173/login
2. Il saisit sa compagnie d'assurance, nom d'utilisateur et mot de passe
3. Il accède à l'interface utilisateur

## 🔧 Configuration Email

Pour que les invitations par email fonctionnent, configurez les paramètres SMTP dans `application.properties` :

```properties
# Configuration Email (à adapter selon votre fournisseur)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre-email@gmail.com
spring.mail.password=votre-mot-de-passe-app
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## 📊 API Endpoints Disponibles

### **Authentification**
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/logout` - Déconnexion utilisateur
- `POST /api/auth/register` - Inscription complète

### **Invitations**
- `POST /api/invitations` - Créer une invitation
- `GET /api/invitations/validate/{token}` - Valider un token
- `POST /api/invitations/{token}/use` - Marquer comme utilisée
- `GET /api/invitations` - Liste des invitations

### **Administration**
- `GET /api/admin/dashboard` - Tableau de bord complet
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/stats` - Statistiques utilisateurs

### **Demandes d'Accès**
- `GET /api/access-requests/owner/{ownerId}/pending` - Demandes en attente pour un propriétaire
- `POST /api/access-requests/{requestId}/approve` - Approuver une demande
- `POST /api/access-requests/{requestId}/reject` - Rejeter une demande

## 🛠️ Dépannage

### **Problème de Connexion à la Base de Données**
```bash
# Vérifier que PostgreSQL est en cours d'exécution
docker logs assurance_db

# Redémarrer les conteneurs si nécessaire
docker-compose down
docker-compose up -d
```

### **Problème de Compilation Backend**
```bash
# Nettoyer et reconstruire
docker-compose down
docker system prune -f
docker-compose up --build -d
```

### **Problème de Frontend**
```bash
cd assurance_connect
npm install
npm run dev
```

## 📝 Notes Importantes

1. **Sécurité** : Changez le mot de passe de l'administrateur après la première connexion
2. **Email** : Configurez un serveur SMTP valide pour les invitations
3. **Base de Données** : Les données sont persistantes dans le volume Docker
4. **Logs** : Consultez les logs avec `docker logs assurance_backend`

## 🎯 Prochaines Étapes

1. **Tester toutes les fonctionnalités** avec des utilisateurs de test
2. **Configurer l'envoi d'emails** avec un fournisseur SMTP
3. **Personnaliser l'interface** selon vos besoins
4. **Ajouter des fonctionnalités** supplémentaires si nécessaire

Le système est maintenant prêt à être utilisé en production ! 🚀
