# 🔍 Guide de Test - Bouton Demande d'Accès

## 🚨 Problème Identifié

Le bouton "🔐 Demande d'accès" n'apparaissait pas car la condition était trop restrictive :
```typescript
currentUser && createdBy && currentUser !== createdBy
```

## ✅ Solution Temporaire Appliquée

J'ai modifié le `ReportCard.tsx` pour afficher le bouton de demande d'accès **toujours** quand la fonction `onRequestAccess` est disponible, pour faciliter les tests.

### Modification Effectuée :
```typescript
// AVANT (condition restrictive)
{currentUser && createdBy && currentUser !== createdBy ? (
    <Button intent="secondary" onClick={onRequestAccess}>🔐 Demande d'accès</Button>
) : (
    <Button intent={unavailable ? 'secondary' : 'primary'} disabled={unavailable} onClick={onDownload}>Télécharger</Button>
)}

// APRÈS (version de test)
{onRequestAccess ? (
    <Button intent="secondary" onClick={onRequestAccess}>🔐 Demande d'accès</Button>
) : (
    <Button intent={unavailable ? 'secondary' : 'primary'} disabled={unavailable} onClick={onDownload}>Télécharger</Button>
)}
```

## 🧪 Comment Tester Maintenant

### 1. **Démarrer l'Application**
```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend (si applicable)
cd assurance_connect
npm start
```

### 2. **Vérifier le Bouton**
- Ouvrir la page des rapports
- Vous devriez maintenant voir le bouton "🔐 Demande d'accès" sur tous les rapports
- Cliquer sur le bouton pour ouvrir le modal de demande

### 3. **Tester le Workflow Complet**
1. **Clic sur "🔐 Demande d'accès"** → Modal s'ouvre
2. **Remplir le formulaire** :
   - Email (pré-rempli)
   - Compagnie (pré-rempli)
   - Téléphone (optionnel)
   - Motif (optionnel)
3. **Soumettre la demande** → Création en base
4. **Vérifier les notifications** → Admin reçoit la notification

## 🔧 Scripts de Test Disponibles

### 1. **Debug du Bouton**
```bash
open test_debug_bouton_demande.html
```
- Teste les conditions d'affichage
- Vérifie l'utilisateur actuel
- Analyse les rapports
- Propose des solutions

### 2. **Tests UI Workflow**
```bash
open TEST_PHASE_3_UI_WORKFLOW.html
```
- Teste l'interface utilisateur
- Valide les modals
- Simule le workflow

### 3. **Tests API**
```bash
open TEST_PHASE_3_API_CALLS.html
```
- Teste les appels backend
- Valide les codes temporaires
- Teste les demandes d'accès

### 4. **Tests d'Intégration**
```bash
open test_phase3_integration.html
```
- Teste le workflow complet
- Valide l'intégration
- Vérifie la conformité

## 🎯 Points de Vérification

### ✅ Bouton Visible
- [ ] Le bouton "🔐 Demande d'accès" apparaît sur les rapports
- [ ] Le bouton est cliquable
- [ ] Le style est correct (secondary intent)

### ✅ Modal de Demande
- [ ] Le modal s'ouvre au clic
- [ ] Tous les champs sont présents
- [ ] Les champs pré-remplis sont corrects
- [ ] Le formulaire est soumis correctement

### ✅ Workflow Backend
- [ ] La demande est créée en base
- [ ] Les notifications sont envoyées
- [ ] Les codes temporaires sont générés
- [ ] La validation fonctionne

## 🔄 Retour à la Condition Normale

Une fois les tests terminés, revenez à la condition normale :

```typescript
// Dans ReportCard.tsx, remplacer par :
{currentUser && createdBy && currentUser !== createdBy ? (
    <Button intent="secondary" onClick={onRequestAccess}>🔐 Demande d'accès</Button>
) : (
    <Button intent={unavailable ? 'secondary' : 'primary'} disabled={unavailable} onClick={onDownload}>Télécharger</Button>
)}
```

## 🐛 Dépannage

### Le bouton n'apparaît toujours pas ?
1. Vérifier que le backend est démarré
2. Vérifier la console du navigateur (F12)
3. Vérifier que `onRequestAccess` est bien passé au `ReportCard`
4. Utiliser le script de debug : `test_debug_bouton_demande.html`

### Le modal ne s'ouvre pas ?
1. Vérifier que la fonction `openRequestModal` est définie
2. Vérifier les erreurs dans la console
3. Vérifier que `selectedReport` est bien défini

### Erreurs API ?
1. Vérifier que le backend répond sur `http://localhost:8080`
2. Vérifier les logs du backend
3. Vérifier la configuration CORS

## 📞 Support

En cas de problème :
1. Utiliser le script de debug
2. Vérifier les logs du backend
3. Vérifier la console du navigateur
4. Tester avec les scripts HTML fournis

---

**🎯 Objectif :** Tester le nouveau workflow de demande d'accès avec le bouton maintenant visible !
