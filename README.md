# Système de Gestion Scolaire pour le Bénin

## Nouvelle Architecture - Gestion par Année Scolaire

### Principe de Fonctionnement

L'application utilise maintenant un système de filtrage par année scolaire où :

- **Une seule base de données** stocke toutes les années scolaires
- **Seules les données de l'année courante** sont visibles et utilisées dans l'interface
- **Changement d'année** = changement de contexte de données
- **Archivage automatique** des données lors du passage à une nouvelle année

### Structure des Données

#### Clé de Données
Chaque donnée est maintenant identifiée par :
```
{type_de_donnée}_{id_école}_{année_scolaire}
```

Exemples :
- `students_ecole-1_2024-2025`
- `teachers_ecole-1_2024-2025`
- `classes_ecole-1_2024-2025`

#### Types avec Année Scolaire
Tous les types principaux incluent maintenant `academicYear`:

```typescript
interface Student {
  // ... autres propriétés
  schoolId: string;
  academicYear: string; // Nouvelle propriété
}

interface Teacher {
  // ... autres propriétés
  schoolId: string;
  academicYear: string; // Nouvelle propriété
}

interface ClassInfo {
  // ... autres propriétés
  schoolId: string;
  academicYear: string; // Nouvelle propriété
}
```

### Fonctionnalités

#### 1. Sélecteur d'Année Scolaire
- Composant `AcademicYearSelector` dans le header
- Permet de changer l'année courante
- Création de nouvelles années scolaires
- Archivage automatique des données

#### 2. Contexte d'Année Scolaire
- `AcademicYearProvider` gère l'état global
- `useAcademicYear` hook pour accéder aux données
- Persistance dans localStorage

#### 3. Filtrage Automatique
- Toutes les données sont automatiquement filtrées par année courante
- Les composants n'affichent que les données pertinentes
- Sauvegarde séparée par année

#### 4. Archivage
- Données automatiquement archivées lors du changement d'année
- Possibilité de restaurer des données archivées
- Utilitaires dans `src/utils/dataFilters.ts`

### Avantages

1. **Séparation Claire** : Chaque année scolaire est isolée
2. **Performance** : Moins de données à traiter simultanément
3. **Historique** : Conservation des données des années précédentes
4. **Flexibilité** : Possibilité de consulter/restaurer les anciennes années
5. **Cohérence** : Une seule base de données pour toutes les années

### Migration

Les composants existants ont été mis à jour pour :
- Utiliser le contexte `AcademicYearProvider`
- Inclure `academicYear` dans les nouvelles données
- Filtrer automatiquement par année courante
- Sauvegarder avec la clé incluant l'année

Cette architecture permet une gestion efficace des données multi-années tout en gardant une interface simple centrée sur l'année scolaire active.