import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Smartphone, Building, Plus, Trash2, Edit, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { PaymentService } from '../../services/paymentService';
import { ActivityLogService } from '../../services/activityLogService';

interface FinancialSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: FinancialSettings) => void;
}

interface FeeType {
  id: string;
  name: string;
  amount: number;
  level: string;
  is_mandatory: boolean;
  description: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'mobile' | 'bank';
  is_enabled: boolean;
  fees_percentage: number;
  config: Record<string, any>;
}

interface FinancialSettings {
  currency: string;
  feeTypes: FeeType[];
  paymentMethods: PaymentMethod[];
}

const FinancialSettingsModal: React.FC<FinancialSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { userSchool, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddFee, setShowAddFee] = useState(false);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeType | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const [newFeeType, setNewFeeType] = useState({
    name: '',
    amount: 0,
    level: 'Maternelle',
    is_mandatory: true,
    description: ''
  });

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: '',
    type: 'cash' as 'cash' | 'mobile' | 'bank',
    is_enabled: true,
    fees_percentage: 0,
    config: {}
  });

  // Niveaux scolaires du Bénin
  const levels = ['Maternelle', 'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];

  // Charger les données au montage
  useEffect(() => {
    if (isOpen && userSchool) {
      loadFinancialSettings();
    }
  }, [isOpen, userSchool]);

  const loadFinancialSettings = async () => {
    if (!userSchool) return;

    try {
      setLoading(true);
      setError(null);

      const [feeTypesData, paymentMethodsData] = await Promise.all([
        loadFeeTypes(),
        PaymentService.getPaymentMethods(userSchool.id)
      ]);

      setFeeTypes(feeTypesData);
      setPaymentMethods(paymentMethodsData);

    } catch (error: any) {
      console.error('Erreur lors du chargement des paramètres financiers:', error);
      setError(error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadFeeTypes = async () => {
    if (!userSchool) return [];

    try {
      const { data, error } = await supabase
        .from('fee_types')
        .select('*')
        .eq('school_id', userSchool.id)
        .order('level')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des types de frais:', error);
      return [];
    }
  };

  const handleAddFeeType = async () => {
    if (!userSchool || !newFeeType.name || newFeeType.amount <= 0) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('fee_types')
        .insert({
          school_id: userSchool.id,
          name: newFeeType.name,
          amount: newFeeType.amount,
          level: newFeeType.level,
          is_mandatory: newFeeType.is_mandatory,
          description: newFeeType.description
        })
        .select()
        .single();

      if (error) throw error;

      setFeeTypes(prev => [...prev, data]);
      setNewFeeType({
        name: '',
        amount: 0,
        level: 'Maternelle',
        is_mandatory: true,
        description: ''
      });
      setShowAddFee(false);

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: userSchool.id,
        userId: user?.id,
        action: 'CREATE_FEE_TYPE',
        entityType: 'fee_type',
        entityId: data.id,
        level: 'success',
        details: `Nouveau type de frais créé: ${newFeeType.name}`
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du type de frais:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!userSchool || !newPaymentMethod.name) return;

    try {
      setLoading(true);

      const methodData = await PaymentService.createPaymentMethod({
        schoolId: userSchool.id,
        name: newPaymentMethod.name,
        type: newPaymentMethod.type,
        feesPercentage: newPaymentMethod.fees_percentage,
        config: newPaymentMethod.config
      });

      setPaymentMethods(prev => [...prev, methodData]);
      setNewPaymentMethod({
        name: '',
        type: 'cash',
        is_enabled: true,
        fees_percentage: 0,
        config: {}
      });
      setShowAddMethod(false);

      // Logger l'activité
      await ActivityLogService.logActivity({
        schoolId: userSchool.id,
        userId: user?.id,
        action: 'CREATE_PAYMENT_METHOD',
        entityType: 'payment_method',
        entityId: methodData.id,
        level: 'success',
        details: `Nouvelle méthode de paiement créée: ${newPaymentMethod.name}`
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la méthode de paiement:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeeType = async (feeId: string, updates: Partial<FeeType>) => {
    if (!userSchool) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('fee_types')
        .update(updates)
        .eq('id', feeId)
        .select()
        .single();

      if (error) throw error;

      setFeeTypes(prev => prev.map(fee => fee.id === feeId ? data : fee));
      setEditingFee(null);

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async (methodId: string, updates: Partial<PaymentMethod>) => {
    if (!userSchool) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', methodId)
        .select()
        .single();

      if (error) throw error;

      setPaymentMethods(prev => prev.map(method => method.id === methodId ? data : method));
      setEditingMethod(null);

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeeType = async (feeId: string) => {
    if (!userSchool || !confirm('Êtes-vous sûr de vouloir supprimer ce type de frais ?')) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('fee_types')
        .delete()
        .eq('id', feeId);

      if (error) throw error;

      setFeeTypes(prev => prev.filter(fee => fee.id !== feeId));

    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!userSchool || !confirm('Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?')) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('payment_methods')
        .update({ is_enabled: false })
        .eq('id', methodId);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));

    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'cash': return DollarSign;
      case 'mobile': return Smartphone;
      case 'bank': return Building;
      default: return CreditCard;
    }
  };

  const getPaymentMethodColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-green-50 text-green-700 border-green-200';
      case 'mobile': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'bank': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Paramètres Financiers</h2>
                <p className="text-gray-600">Configuration des frais et méthodes de paiement - Système éducatif béninois</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadFinancialSettings}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Configuration générale */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Configuration Générale</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Devise Officielle</h4>
                <p className="text-2xl font-bold text-blue-600">FCFA</p>
                <p className="text-sm text-blue-600">Franc CFA (XOF)</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Types de Frais</h4>
                <p className="text-2xl font-bold text-green-600">{feeTypes.length}</p>
                <p className="text-sm text-green-600">Configurés</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Méthodes de Paiement</h4>
                <p className="text-2xl font-bold text-purple-600">{paymentMethods.filter(m => m.is_enabled).length}</p>
                <p className="text-sm text-purple-600">Actives</p>
              </div>
            </div>

          </div>

          {/* Types de frais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Types de Frais Scolaires</h3>
              <button
                onClick={() => setShowAddFee(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Frais</span>
              </button>
            </div>

            {/* Formulaire d'ajout */}
            {showAddFee && (
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-4">Nouveau Type de Frais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du Frais *
                    </label>
                    <input
                      type="text"
                      value={newFeeType.name}
                      onChange={(e) => setNewFeeType(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Frais de scolarité CE1"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant (FCFA) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={newFeeType.amount}
                      onChange={(e) => setNewFeeType(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau Concerné
                    </label>
                    <select
                      value={newFeeType.level}
                      onChange={(e) => setNewFeeType(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mandatory"
                      checked={newFeeType.is_mandatory}
                      onChange={(e) => setNewFeeType(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="mandatory" className="text-sm font-medium text-gray-700">
                      Frais obligatoire
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newFeeType.description}
                    onChange={(e) => setNewFeeType(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAddFeeType}
                    disabled={loading || !newFeeType.name || newFeeType.amount <= 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setShowAddFee(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des frais */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {feeTypes.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {editingFee?.id === fee.id ? (
                          <input
                            type="text"
                            value={editingFee.name}
                            onChange={(e) => setEditingFee(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          />
                        ) : (
                          <div>
                            <p className="font-medium text-gray-800">{fee.name}</p>
                            <p className="text-sm text-gray-500">{fee.description}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingFee?.id === fee.id ? (
                          <input
                            type="number"
                            value={editingFee.amount}
                            onChange={(e) => setEditingFee(prev => prev ? { ...prev, amount: parseInt(e.target.value) || 0 } : null)}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          />
                        ) : (
                          <span className="font-medium text-gray-800">{fee.amount.toLocaleString()} FCFA</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingFee?.id === fee.id ? (
                          <select
                            value={editingFee.level}
                            onChange={(e) => setEditingFee(prev => prev ? { ...prev, level: e.target.value } : null)}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          >
                            {levels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                            {fee.level}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          fee.is_mandatory 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {fee.is_mandatory ? 'Obligatoire' : 'Optionnel'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {editingFee?.id === fee.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateFeeType(fee.id, editingFee)}
                                disabled={loading}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingFee(null)}
                                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingFee(fee)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteFeeType(fee.id)}
                                disabled={loading}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {feeTypes.length === 0 && !loading && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun type de frais configuré</p>
              </div>
            )}
          </div>

          {/* Méthodes de paiement */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Méthodes de Paiement</h3>
              <button
                onClick={() => setShowAddMethod(true)}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Méthode</span>
              </button>
            </div>

            {/* Formulaire d'ajout de méthode */}
            {showAddMethod && (
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h4 className="font-medium text-purple-800 mb-4">Nouvelle Méthode de Paiement</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la Méthode *
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.name}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: MTN Mobile Money"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newPaymentMethod.type}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="cash">Espèces</option>
                      <option value="mobile">Mobile Money</option>
                      <option value="bank">Bancaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frais de Transaction (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={newPaymentMethod.fees_percentage}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, fees_percentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAddPaymentMethod}
                    disabled={loading || !newPaymentMethod.name}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setShowAddMethod(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des méthodes de paiement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => {
                const Icon = getPaymentMethodIcon(method.type);
                const isEditing = editingMethod?.id === method.id;
                
                return (
                  <div key={method.id} className={`p-4 border-2 rounded-lg ${getPaymentMethodColor(method.type)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingMethod.name}
                            onChange={(e) => setEditingMethod(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="px-2 py-1 border border-gray-200 rounded text-sm"
                          />
                        ) : (
                          <span className="font-medium">{method.name}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdatePaymentMethod(method.id, editingMethod)}
                              disabled={loading}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            >
                              <Save className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setEditingMethod(null)}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingMethod(method)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeletePaymentMethod(method.id)}
                              disabled={loading}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Statut:</span>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEditing ? editingMethod.is_enabled : method.is_enabled}
                            onChange={(e) => {
                              if (isEditing) {
                                setEditingMethod(prev => prev ? { ...prev, is_enabled: e.target.checked } : null);
                              } else {
                                handleUpdatePaymentMethod(method.id, { is_enabled: e.target.checked });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm">Activé</span>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Frais de transaction:</span>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={editingMethod.fees_percentage}
                            onChange={(e) => setEditingMethod(prev => prev ? { ...prev, fees_percentage: parseFloat(e.target.value) || 0 } : null)}
                            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                          />
                        ) : (
                          <span className="text-sm font-medium">{method.fees_percentage}%</span>
                        )}
                      </div>

                      {method.type === 'mobile' && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Opérateur:</span>
                            <span className="font-medium">{method.config.provider || 'Non configuré'}</span>
                          </div>
                          {method.config.merchantCode && (
                            <div className="flex justify-between">
                              <span>Code marchand:</span>
                              <span className="font-mono text-xs">{method.config.merchantCode}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {method.type === 'bank' && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Banque:</span>
                            <span className="font-medium">{method.config.bankName || 'Non configurée'}</span>
                          </div>
                          {method.config.bankAccount && (
                            <div className="flex justify-between">
                              <span>Compte:</span>
                              <span className="font-mono text-xs">{method.config.bankAccount}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {paymentMethods.length === 0 && !loading && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune méthode de paiement configurée</p>
              </div>
            )}
          </div>

          {/* Informations sur le système éducatif béninois */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3">Système Éducatif Béninois</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-2">Structure des niveaux:</p>
                <ul className="space-y-1">
                  <li>• Maternelle (3-5 ans)</li>
                  <li>• CI - Cours d'Initiation (6 ans)</li>
                  <li>• CP - Cours Préparatoire (7 ans)</li>
                  <li>• CE1/CE2 - Cours Élémentaire (8-10 ans)</li>
                  <li>• CM1/CM2 - Cours Moyen (11-12 ans)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Méthodes de paiement populaires:</p>
                <ul className="space-y-1">
                  <li>• Espèces (très répandu)</li>
                  <li>• MTN Mobile Money</li>
                  <li>• Moov Money</li>
                  <li>• Virements bancaires</li>
                  <li>• Chèques (moins fréquent)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Configuration pour {userSchool?.name} • Devise: FCFA (Franc CFA)
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  onSave({
                    currency: 'FCFA',
                    feeTypes,
                    paymentMethods
                  });
                  onClose();
                }}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSettingsModal;