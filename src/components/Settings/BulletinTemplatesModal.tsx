import React, { useState } from 'react';
import { X, FileText, Plus, Edit, Trash2, Eye, Download, Upload, Copy } from 'lucide-react';

interface BulletinTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BulletinTemplate {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'detailed' | 'simplified' | 'custom';
  isDefault: boolean;
  levels: string[];
  sections: TemplateSection[];
  layout: 'portrait' | 'landscape';
  headerConfig: {
    showLogo: boolean;
    showSchoolInfo: boolean;
    showPeriod: boolean;
  };
  footerConfig: {
    showSignatures: boolean;
    showDate: boolean;
    showSeal: boolean;
  };
  createdDate: string;
  lastModified: string;
}

interface TemplateSection {
  id: string;
  name: string;
  type: 'grades' | 'conduct' | 'attendance' | 'comments' | 'statistics';
  enabled: boolean;
  order: number;
  config: Record<string, any>;
}

const BulletinTemplatesModal: React.FC<BulletinTemplatesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [templates, setTemplates] = useState<BulletinTemplate[]>([
    {
      id: '1',
      name: 'Bulletin Standard',
      description: 'Modèle classique avec notes, appréciations et classement',
      type: 'standard',
      isDefault: true,
      levels: ['Tous'],
      layout: 'portrait',
      headerConfig: {
        showLogo: true,
        showSchoolInfo: true,
        showPeriod: true
      },
      footerConfig: {
        showSignatures: true,
        showDate: true,
        showSeal: true
      },
      sections: [
        { id: '1', name: 'Notes par matière', type: 'grades', enabled: true, order: 1, config: { showCoefficients: true } },
        { id: '2', name: 'Conduite et discipline', type: 'conduct', enabled: true, order: 2, config: {} },
        { id: '3', name: 'Assiduité', type: 'attendance', enabled: true, order: 3, config: {} },
        { id: '4', name: 'Appréciations', type: 'comments', enabled: true, order: 4, config: {} },
        { id: '5', name: 'Statistiques de classe', type: 'statistics', enabled: true, order: 5, config: {} }
      ],
      createdDate: '2024-09-01',
      lastModified: '2024-10-01'
    },
    {
      id: '2',
      name: 'Bulletin Détaillé',
      description: 'Modèle complet avec graphiques et analyses détaillées',
      type: 'detailed',
      isDefault: false,
      levels: ['CM1', 'CM2'],
      layout: 'portrait',
      headerConfig: {
        showLogo: true,
        showSchoolInfo: true,
        showPeriod: true
      },
      footerConfig: {
        showSignatures: true,
        showDate: true,
        showSeal: true
      },
      sections: [
        { id: '1', name: 'Notes détaillées', type: 'grades', enabled: true, order: 1, config: { showCoefficients: true, showGraphs: true } },
        { id: '2', name: 'Évolution des notes', type: 'statistics', enabled: true, order: 2, config: { showTrends: true } },
        { id: '3', name: 'Conduite', type: 'conduct', enabled: true, order: 3, config: {} },
        { id: '4', name: 'Assiduité détaillée', type: 'attendance', enabled: true, order: 4, config: { showDetails: true } },
        { id: '5', name: 'Commentaires personnalisés', type: 'comments', enabled: true, order: 5, config: { allowLongComments: true } }
      ],
      createdDate: '2024-09-15',
      lastModified: '2024-10-10'
    },
    {
      id: '3',
      name: 'Bulletin Simplifié',
      description: 'Format condensé pour impression rapide',
      type: 'simplified',
      isDefault: false,
      levels: ['Maternelle', 'CI', 'CP'],
      layout: 'portrait',
      headerConfig: {
        showLogo: true,
        showSchoolInfo: false,
        showPeriod: true
      },
      footerConfig: {
        showSignatures: false,
        showDate: true,
        showSeal: false
      },
      sections: [
        { id: '1', name: 'Notes essentielles', type: 'grades', enabled: true, order: 1, config: { showCoefficients: false } },
        { id: '2', name: 'Conduite', type: 'conduct', enabled: true, order: 2, config: {} },
        { id: '3', name: 'Commentaire général', type: 'comments', enabled: true, order: 3, config: { singleComment: true } }
      ],
      createdDate: '2024-09-20',
      lastModified: '2024-09-25'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<BulletinTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const levels = ['Tous', 'Maternelle', 'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];

  const sectionTypes = [
    { value: 'grades', label: 'Notes par matière', description: 'Affichage des notes et moyennes' },
    { value: 'conduct', label: 'Conduite et discipline', description: 'Évaluation du comportement' },
    { value: 'attendance', label: 'Assiduité', description: 'Présences et absences' },
    { value: 'comments', label: 'Appréciations', description: 'Commentaires des enseignants' },
    { value: 'statistics', label: 'Statistiques', description: 'Moyennes et classements' }
  ];

  const duplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newTemplate: BulletinTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Copie)`,
        isDefault: false,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      
      setTemplates(prev => [...prev, newTemplate]);
    }
  };

  const deleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template && !template.isDefault) {
      if (confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${template.name}" ?`)) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      }
    } else {
      alert('Impossible de supprimer le modèle par défaut');
    }
  };

  const setAsDefault = (templateId: string) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === templateId
    })));
  };

  const exportTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const dataStr = JSON.stringify(template, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bulletin_template_${template.name.toLowerCase().replace(/\s+/g, '_')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'detailed': return 'bg-purple-100 text-purple-800';
      case 'simplified': return 'bg-green-100 text-green-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TemplatePreview = ({ template }: { template: BulletinTemplate }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Aperçu - {template.name}</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Simulation d'un bulletin */}
          <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            {/* Header */}
            {template.headerConfig.showSchoolInfo && (
              <div className="text-center mb-6 pb-4 border-b border-gray-200">
                {template.headerConfig.showLogo && (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                )}
                <h4 className="font-bold text-gray-800">ÉCOLE TECHNIQUE MODERNE</h4>
                <p className="text-sm text-gray-600">Quartier ACI 2000, Bamako, Mali</p>
                {template.headerConfig.showPeriod && (
                  <p className="text-sm text-gray-600 mt-2">BULLETIN SCOLAIRE - Trimestre 1 - Année 2024-2025</p>
                )}
              </div>
            )}

            {/* Student Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Élève:</strong> Aminata TRAORE</p>
                  <p><strong>Classe:</strong> CM2A</p>
                </div>
                <div>
                  <p><strong>Rang:</strong> 1er/42</p>
                  <p><strong>Enseignant:</strong> M. Ouattara</p>
                </div>
              </div>
            </div>

            {/* Sections */}
            {template.sections
              .sort((a, b) => a.order - b.order)
              .filter(section => section.enabled)
              .map(section => (
                <div key={section.id} className="mb-4">
                  {section.type === 'grades' && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Notes par Matière</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Français</span>
                          <span>17.2/20 {section.config.showCoefficients && '(Coef. 4)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mathématiques</span>
                          <span>16.5/20 {section.config.showCoefficients && '(Coef. 4)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sciences</span>
                          <span>16.8/20 {section.config.showCoefficients && '(Coef. 2)'}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1 mt-2">
                          <span>Moyenne Générale</span>
                          <span>16.8/20</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.type === 'conduct' && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Conduite et Discipline</h5>
                      <p className="text-sm text-gray-700">Très Bien - Élève exemplaire</p>
                    </div>
                  )}

                  {section.type === 'attendance' && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Assiduité</h5>
                      <p className="text-sm text-gray-700">
                        Absences: 2 jours • Retards: 0 • Taux de présence: 98%
                      </p>
                    </div>
                  )}

                  {section.type === 'comments' && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Appréciations</h5>
                      <p className="text-sm text-gray-700 italic">
                        "Excellente élève, très investie dans son travail. Continue ainsi !"
                      </p>
                    </div>
                  )}

                  {section.type === 'statistics' && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Statistiques de Classe</h5>
                      <div className="text-sm text-gray-700">
                        <p>Moyenne de classe: 12.8/20 • Taux de réussite: 78%</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {/* Footer */}
            {template.footerConfig.showSignatures && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="font-medium">L'Enseignant</p>
                    <div className="h-12"></div>
                    <p>M. Ouattara</p>
                  </div>
                  <div>
                    <p className="font-medium">Le Directeur</p>
                    <div className="h-12"></div>
                    <p>Dr. Amadou Sanogo</p>
                  </div>
                  <div>
                    <p className="font-medium">Le Parent</p>
                    <div className="h-12"></div>
                    <p>Signature</p>
                  </div>
                </div>
                {template.footerConfig.showDate && (
                  <p className="text-center text-xs text-gray-500 mt-4">
                    Bulletin édité le {new Date().toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TemplateEditor = ({ template, onSave }: { template: BulletinTemplate; onSave: (template: BulletinTemplate) => void }) => {
    const [editData, setEditData] = useState<BulletinTemplate>(template);

    const handleSave = () => {
      const updatedTemplate = {
        ...editData,
        lastModified: new Date().toISOString().split('T')[0]
      };
      
      setTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));
      onSave(updatedTemplate);
      setShowTemplateEditor(false);
    };

    const toggleSection = (sectionId: string) => {
      setEditData(prev => ({
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId ? { ...section, enabled: !section.enabled } : section
        )
      }));
    };

    const updateSectionOrder = (sectionId: string, newOrder: number) => {
      setEditData(prev => ({
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId ? { ...section, order: newOrder } : section
        )
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Éditer - {template.name}</h3>
              <button
                onClick={() => setShowTemplateEditor(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Modèle
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientation
                </label>
                <select
                  value={editData.layout}
                  onChange={(e) => setEditData(prev => ({ ...prev, layout: e.target.value as 'portrait' | 'landscape' }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Paysage</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Niveaux concernés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveaux Concernés
              </label>
              <div className="grid grid-cols-4 gap-2">
                {levels.map(level => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editData.levels.includes(level)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditData(prev => ({ ...prev, levels: [...prev.levels, level] }));
                        } else {
                          setEditData(prev => ({ ...prev, levels: prev.levels.filter(l => l !== level) }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Configuration de l'en-tête */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Configuration de l'En-tête</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.headerConfig.showLogo}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      headerConfig: { ...prev.headerConfig, showLogo: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Afficher le logo de l'école</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.headerConfig.showSchoolInfo}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      headerConfig: { ...prev.headerConfig, showSchoolInfo: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Afficher les informations de l'école</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.headerConfig.showPeriod}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      headerConfig: { ...prev.headerConfig, showPeriod: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Afficher la période</span>
                </label>
              </div>
            </div>

            {/* Sections du bulletin */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Sections du Bulletin</h4>
              <div className="space-y-3">
                {editData.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => {
                    const sectionType = sectionTypes.find(st => st.value === section.type);
                    
                    return (
                      <div key={section.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={section.enabled}
                              onChange={() => toggleSection(section.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <p className="font-medium text-gray-800">{sectionType?.label}</p>
                              <p className="text-xs text-gray-500">{sectionType?.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <select
                              value={section.order}
                              onChange={(e) => updateSectionOrder(section.id, parseInt(e.target.value))}
                              className="px-2 py-1 border border-gray-200 rounded text-sm"
                            >
                              {Array.from({ length: editData.sections.length }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Configuration du pied de page */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Configuration du Pied de Page</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.footerConfig.showSignatures}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      footerConfig: { ...prev.footerConfig, showSignatures: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Afficher les zones de signature</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.footerConfig.showDate}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      footerConfig: { ...prev.footerConfig, showDate: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Afficher la date d'édition</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.footerConfig.showSeal}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      footerConfig: { ...prev.footerConfig, showSeal: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Afficher le sceau de l'école</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowTemplateEditor(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Modèles de Bulletins</h2>
                <p className="text-gray-600">Gestion des modèles de bulletins scolaires</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Modèles Disponibles</h3>
              <p className="text-gray-600">{templates.length} modèles configurés</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Importer</span>
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nouveau Modèle</span>
              </button>
            </div>
          </div>

          {/* Liste des modèles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-800">{template.name}</h4>
                      {template.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                      {template.type === 'standard' ? 'Standard' :
                       template.type === 'detailed' ? 'Détaillé' :
                       template.type === 'simplified' ? 'Simplifié' : 'Personnalisé'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Aperçu"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowTemplateEditor(true);
                      }}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => duplicateTemplate(template.id)}
                      className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => exportTemplate(template.id)}
                      className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors"
                      title="Exporter"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    
                    {!template.isDefault && (
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Niveaux:</span>
                    <span className="font-medium">{template.levels.join(', ')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sections actives:</span>
                    <span className="font-medium">{template.sections.filter(s => s.enabled).length}/{template.sections.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dernière modification:</span>
                    <span className="font-medium">{new Date(template.lastModified).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {template.sections.filter(s => s.enabled).slice(0, 3).map(section => {
                        const sectionType = sectionTypes.find(st => st.value === section.type);
                        return (
                          <span key={section.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {sectionType?.label}
                          </span>
                        );
                      })}
                      {template.sections.filter(s => s.enabled).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{template.sections.filter(s => s.enabled).length - 3}
                        </span>
                      )}
                    </div>
                    
                    {!template.isDefault && (
                      <button
                        onClick={() => setAsDefault(template.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        Définir par défaut
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Modals */}
        {showPreview && selectedTemplate && (
          <TemplatePreview template={selectedTemplate} />
        )}

        {showTemplateEditor && selectedTemplate && (
          <TemplateEditor 
            template={selectedTemplate} 
            onSave={(template) => setSelectedTemplate(template)} 
          />
        )}
      </div>
    </div>
  );
};

export default BulletinTemplatesModal;