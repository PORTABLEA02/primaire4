/*
  # Données financières standards pour le système éducatif béninois

  1. Types de frais selon le système éducatif béninois
  2. Méthodes de paiement courantes au Bénin
  3. Configuration adaptée au contexte local

  Note: Suppression d'Orange Money et des champs de pénalité/bourse
*/

-- Insérer les types de frais standards du Bénin pour l'École Technique Moderne
INSERT INTO fee_types (
  id,
  school_id,
  name,
  amount,
  level,
  is_mandatory,
  description
) VALUES 
  -- Frais de scolarité par niveau (tarifs réalistes pour le Bénin)
  ('fee-scolarite-maternelle-benin', 'ecole-tech-moderne', 'Frais de scolarité Maternelle', 25000, 'Maternelle', true, 'Frais annuels de scolarité pour la maternelle'),
  ('fee-scolarite-ci-benin', 'ecole-tech-moderne', 'Frais de scolarité CI', 30000, 'CI', true, 'Frais annuels de scolarité pour le Cours d''Initiation'),
  ('fee-scolarite-cp-benin', 'ecole-tech-moderne', 'Frais de scolarité CP', 30000, 'CP', true, 'Frais annuels de scolarité pour le Cours Préparatoire'),
  ('fee-scolarite-ce1-benin', 'ecole-tech-moderne', 'Frais de scolarité CE1', 35000, 'CE1', true, 'Frais annuels de scolarité pour le CE1'),
  ('fee-scolarite-ce2-benin', 'ecole-tech-moderne', 'Frais de scolarité CE2', 35000, 'CE2', true, 'Frais annuels de scolarité pour le CE2'),
  ('fee-scolarite-cm1-benin', 'ecole-tech-moderne', 'Frais de scolarité CM1', 40000, 'CM1', true, 'Frais annuels de scolarité pour le CM1'),
  ('fee-scolarite-cm2-benin', 'ecole-tech-moderne', 'Frais de scolarité CM2', 40000, 'CM2', true, 'Frais annuels de scolarité pour le CM2'),
  
  -- Autres frais
  ('fee-inscription-benin', 'ecole-tech-moderne', 'Frais d''inscription', 5000, 'Tous', true, 'Frais d''inscription annuelle obligatoire'),
  ('fee-cantine-benin', 'ecole-tech-moderne', 'Frais de cantine', 15000, 'Tous', false, 'Frais de restauration scolaire (optionnel)'),
  ('fee-transport-benin', 'ecole-tech-moderne', 'Frais de transport', 10000, 'Tous', false, 'Transport scolaire (optionnel)'),
  ('fee-fournitures-benin', 'ecole-tech-moderne', 'Frais de fournitures', 8000, 'Tous', false, 'Fournitures scolaires de base'),
  ('fee-uniforme-benin', 'ecole-tech-moderne', 'Frais d''uniforme', 12000, 'Tous', false, 'Uniforme scolaire (optionnel)'),
  ('fee-activites-benin', 'ecole-tech-moderne', 'Frais d''activités', 5000, 'Tous', false, 'Activités parascolaires et sorties éducatives'),
  ('fee-assurance-benin', 'ecole-tech-moderne', 'Assurance scolaire', 3000, 'Tous', true, 'Assurance accident scolaire obligatoire')
ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  description = EXCLUDED.description;

-- Mettre à jour les méthodes de paiement pour le Bénin (supprimer Orange Money)
DELETE FROM payment_methods WHERE school_id = 'ecole-tech-moderne' AND name = 'Orange Money';

-- Insérer/Mettre à jour les méthodes de paiement courantes au Bénin
INSERT INTO payment_methods (
  id,
  school_id,
  name,
  type,
  is_enabled,
  fees_percentage,
  config
) VALUES 
  ('payment-cash-benin', 'ecole-tech-moderne', 'Espèces', 'cash', true, 0, '{}'::jsonb),
  ('payment-mtn-benin', 'ecole-tech-moderne', 'MTN Mobile Money', 'mobile', true, 1.0, '{"provider": "MTN", "merchantCode": "", "apiKey": ""}'::jsonb),
  ('payment-moov-benin', 'ecole-tech-moderne', 'Moov Money', 'mobile', true, 1.0, '{"provider": "Moov", "merchantId": "", "secretKey": ""}'::jsonb),
  ('payment-bank-benin', 'ecole-tech-moderne', 'Virement Bancaire', 'bank', true, 0.5, '{"bankAccount": "", "bankName": "Banque de l''Habitat du Bénin", "rib": ""}'::jsonb),
  ('payment-cheque-benin', 'ecole-tech-moderne', 'Chèque', 'bank', false, 0, '{"payableTo": "École Technique Moderne", "bankName": ""}'::jsonb),
  ('payment-postal-benin', 'ecole-tech-moderne', 'Mandat Postal', 'bank', false, 2.0, '{"postOffice": "La Poste Bénin", "instructions": "Paiement via mandat postal"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_enabled = EXCLUDED.is_enabled,
  fees_percentage = EXCLUDED.fees_percentage,
  config = EXCLUDED.config;

-- Logger la création des données financières béninoises
INSERT INTO activity_logs (
  school_id,
  action,
  entity_type,
  level,
  details
) VALUES (
  'ecole-tech-moderne',
  'INIT_BENIN_FINANCIAL_DATA',
  'system',
  'info',
  'Configuration financière adaptée au système éducatif béninois créée'
);