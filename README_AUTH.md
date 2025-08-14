# Authentification avec Supabase - Système Béninois

## Configuration Requise

### 1. Créer les Utilisateurs de Test

Pour utiliser l'authentification Supabase, vous devez d'abord créer les utilisateurs de test dans votre projet Supabase :

#### Via l'Interface Supabase Dashboard

1. Allez dans **Authentication > Users** dans votre dashboard Supabase
2. Cliquez sur **Add user** 
3. Créez les utilisateurs suivants :

**Administrateur :**
- Email: `admin@ecoletech.edu`
- Password: `password123`
- User ID: `11111111-1111-1111-1111-111111111111`

**Directeur :**
- Email: `directeur@ecoletech.edu`
- Password: `password123`
- User ID: `22222222-2222-2222-2222-222222222222`

**Secrétaire :**
- Email: `secretaire@ecoletech.edu`
- Password: `password123`
- User ID: `33333333-3333-3333-3333-333333333333`

**Comptable :**
- Email: `comptable@ecoletech.edu`
- Password: `password123`
- User ID: `44444444-4444-4444-4444-444444444444`

#### Via SQL (Alternative)

Vous pouvez aussi utiliser la fonction `auth.admin_create_user()` :

```sql
-- Créer l'utilisateur admin
SELECT auth.admin_create_user(
  'admin@ecoletech.edu',
  'password123',
  '11111111-1111-1111-1111-111111111111'::uuid,
  true, -- email confirmé
  '{"name": "Admin Principal", "role": "Admin", "school_id": "ecole-tech-moderne"}'::jsonb
);

-- Répéter pour les autres utilisateurs...
```

### 2. Configuration de l'Authentification

Dans votre projet Supabase :

1. **Authentication > Settings**
2. **Disable email confirmations** (pour les tests)
3. **Enable email/password authentication**
4. Configurez les **Site URL** et **Redirect URLs** selon votre environnement

### 3. Variables d'Environnement

Assurez-vous que votre fichier `.env` contient :

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Fonctionnalités

### Authentification Sécurisée
- Connexion via email/mot de passe
- Session persistante
- Gestion des erreurs
- Déconnexion sécurisée

### Profils Utilisateurs
- Profils automatiquement créés via trigger
- Permissions basées sur les rôles
- Informations d'école liées

### Sécurité
- Row Level Security (RLS) activé
- Accès limité aux données de l'école
- Permissions granulaires par rôle

## Utilisation

1. **Première Connexion :**
   - Utilisez un des comptes de test
   - Email: `admin@ecoletech.edu`
   - Mot de passe: `password123`

2. **Gestion des Utilisateurs :**
   - Les nouveaux utilisateurs peuvent être créés via l'interface
   - Les profils sont automatiquement liés à l'école
   - Les permissions sont assignées selon le rôle

3. **Données Filtrées :**
   - Chaque utilisateur ne voit que les données de son école
   - Les administrateurs peuvent gérer plusieurs écoles
   - Isolation complète des données entre écoles

## Dépannage

### Erreur "Profil utilisateur non trouvé"
- Vérifiez que le profil existe dans `user_profiles`
- Le trigger `create_user_profile_trigger` doit être actif

### Erreur de permissions
- Vérifiez les politiques RLS
- Assurez-vous que l'utilisateur a les bonnes permissions

### Session expirée
- La session Supabase expire automatiquement
- L'utilisateur sera redirigé vers la page de connexion

## Migration depuis les Données de Démonstration

L'ancien système avec données en dur a été remplacé par :
- Authentification Supabase réelle
- Profils utilisateurs en base de données
- Permissions dynamiques
- Sessions sécurisées

Les fonctionnalités restent identiques, mais maintenant connectées à une vraie base de données.