# Base de Données Supabase - Système de Gestion Scolaire pour le Bénin

## Architecture de la Base de Données

### Principe Multi-École avec Années Scolaires

L'application utilise une architecture centralisée où :
- **Une seule base de données** pour toutes les écoles du réseau
- **Isolation par école** via Row Level Security (RLS)
- **Gestion par année scolaire** avec archivage automatique
- **Logging complet** de toutes les activités importantes

### Tables Principales

#### 1. Gestion des Écoles
- `schools` - Informations des établissements
- `user_profiles` - Profils utilisateurs liés aux écoles

#### 2. Gestion Temporelle
- `academic_years` - Années scolaires
- `grade_periods` - Périodes d'évaluation (trimestres/semestres)

#### 3. Structure Pédagogique
- `classrooms` - Salles de classe
- `classes` - Classes/niveaux
- `subjects` - Matières enseignées
- `teachers` - Enseignants
- `students` - Élèves

#### 4. Tables d'Association (Système de Responsabilité)

##### `teacher_class_assignments` - Affectations Enseignants
```sql
- teacher_id (enseignant)
- class_id (classe)
- school_id (école)
- academic_year_id (année scolaire)
- salary_amount (salaire)
- salary_currency (devise)
- is_active (statut)
```

##### `classroom_class_assignments` - Affectations Salles
```sql
- classroom_id (salle)
- class_id (classe)
- school_id (école)
- academic_year_id (année scolaire)
- is_active (statut)
```

##### `student_class_enrollments` - Inscriptions avec Suivi Financier
```sql
- student_id (élève)
- class_id (classe)
- school_id (école)
- academic_year_id (année scolaire)
- total_fees (frais totaux)
- paid_amount (montant payé)
- outstanding_amount (reste à payer - calculé automatiquement)
- payment_status (statut - calculé automatiquement)
```

#### 5. Gestion Financière
- `fee_types` - Types de frais par école
- `payment_methods` - Méthodes de paiement
- `payment_transactions` - Transactions de paiement

#### 6. Gestion Académique
- `grades` - Notes des élèves
- `bulletins` - Bulletins scolaires
- `schedule_slots` - Créneaux d'emploi du temps

#### 7. Système de Logging
- `activity_logs` - Journal complet des activités

### Sécurité (Row Level Security)

#### Politiques Principales
1. **Isolation par École** : Les utilisateurs ne voient que les données de leur école
2. **Contrôle par Rôles** : Permissions basées sur le rôle utilisateur
3. **Audit Trail** : Toutes les modifications sont loggées

#### Rôles et Permissions
- **Admin** : Accès complet multi-école
- **Directeur** : Accès complet à son école
- **Secrétaire** : Élèves, classes, inscriptions
- **Enseignant** : Ses classes et élèves
- **Comptable** : Données financières

### Fonctionnalités Automatiques

#### 1. Calculs Financiers Automatiques
- `outstanding_amount` = `total_fees` - `paid_amount`
- `payment_status` calculé selon les montants

#### 2. Mise à Jour des Effectifs
- Nombre d'élèves par classe mis à jour automatiquement

#### 3. Validation des Emplois du Temps
- Détection automatique des conflits d'horaires
- Validation enseignant/salle

#### 4. Logging Automatique
- Toutes les opérations CRUD sont loggées
- Traçabilité complète des modifications

### Vues Utilitaires

#### `enrollment_details`
Vue complète des inscriptions avec détails élève/classe/école

#### `teacher_assignment_details`
Vue des affectations enseignants avec salaires

#### `schedule_details`
Vue de l'emploi du temps avec tous les détails

#### `grade_details`
Vue des notes avec informations complètes

### Fonctions Utilitaires

#### Calculs Académiques
- `calculate_student_average()` - Moyenne d'un élève
- `calculate_student_rank()` - Classement dans la classe
- `get_class_academic_stats()` - Statistiques de classe

#### Gestion Financière
- `get_school_financial_stats()` - Statistiques financières
- Mise à jour automatique des paiements

#### Gestion Administrative
- `generate_bulletin()` - Génération de bulletins
- `archive_academic_year()` - Archivage d'année
- `get_school_dashboard()` - Données du tableau de bord

### Configuration Requise

1. **Variables d'Environnement**
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

2. **Authentification**
- Email/Password activé
- Confirmation d'email désactivée
- Création automatique de profil utilisateur

3. **Politiques RLS**
- Toutes les tables protégées
- Accès basé sur l'école et les permissions

### Migration et Déploiement

1. **Ordre d'Exécution des Migrations**
```
1. create_core_tables.sql
2. create_rls_policies.sql  
3. create_triggers_and_functions.sql
4. create_views_and_functions.sql
5. insert_sample_data.sql
```

2. **Données de Test**
- École Technique Moderne (données complètes)
- Utilisateurs de démonstration
- Classes, enseignants, élèves d'exemple
- Transactions de paiement

### Monitoring et Maintenance

#### Logs d'Activité
- Toutes les actions importantes loggées
- Filtrage par niveau (info, warning, error, success)
- Traçabilité par utilisateur et école

#### Performance
- Index optimisés pour les requêtes fréquentes
- Vues matérialisées pour les rapports
- Contraintes de validation

#### Sauvegarde
- Archivage automatique des années scolaires
- Fonctions de restauration
- Export des données

Cette architecture garantit une gestion robuste, sécurisée et évolutive pour un système multi-école avec suivi complet des activités.