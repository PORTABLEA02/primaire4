import React, { useState } from 'react';
import { X, Shield, Eye, EyeOff, Key, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  sessionSettings: {
    sessionTimeout: number;
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  accessControl: {
    enableTwoFactor: boolean;
    allowRemoteAccess: boolean;
    ipWhitelist: string[];
    blockAfterFailedAttempts: number;
  };
}

const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expirationDays: 90
    },
    sessionSettings: {
      sessionTimeout: 30,
      maxConcurrentSessions: 3,
      requireReauth: true
    },
    accessControl: {
      enableTwoFactor: false,
      allowRemoteAccess: true,
      ipWhitelist: [],
      blockAfterFailedAttempts: 5
    }
  });

  const [newIp, setNewIp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    // Ici vous pouvez implémenter la logique de sauvegarde
    console.log('Paramètres de sécurité sauvegardés:', settings);
    onClose();
  };

  const addIpToWhitelist = () => {
    if (newIp && !settings.accessControl.ipWhitelist.includes(newIp)) {
      setSettings(prev => ({
        ...prev,
        accessControl: {
          ...prev.accessControl,
          ipWhitelist: [...prev.accessControl.ipWhitelist, newIp]
        }
      }));
      setNewIp('');
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      accessControl: {
        ...prev.accessControl,
        ipWhitelist: prev.accessControl.ipWhitelist.filter(i => i !== ip)
      }
    }));
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (settings.passwordPolicy.minLength >= 8) strength++;
    if (settings.passwordPolicy.requireUppercase) strength++;
    if (settings.passwordPolicy.requireLowercase) strength++;
    if (settings.passwordPolicy.requireNumbers) strength++;
    if (settings.passwordPolicy.requireSpecialChars) strength++;
    
    if (strength <= 2) return { level: 'Faible', color: 'red' };
    if (strength <= 3) return { level: 'Moyen', color: 'yellow' };
    if (strength <= 4) return { level: 'Fort', color: 'green' };
    return { level: 'Très Fort', color: 'green' };
  };

  const passwordStrength = getPasswordStrength();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Paramètres de Sécurité</h2>
                <p className="text-gray-600">Configuration de la sécurité et des accès</p>
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

        <div className="p-6 space-y-8">
          {/* Politique des mots de passe */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Politique des Mots de Passe</span>
            </h3>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Niveau de sécurité actuel:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  passwordStrength.color === 'red' ? 'bg-red-100 text-red-700' :
                  passwordStrength.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {passwordStrength.level}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longueur minimale
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    value={settings.passwordPolicy.minLength}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        minLength: parseInt(e.target.value) || 8
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration (jours)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={settings.passwordPolicy.expirationDays}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        expirationDays: parseInt(e.target.value) || 90
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireUppercase}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        requireUppercase: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Exiger des majuscules</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireLowercase}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        requireLowercase: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Exiger des minuscules</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireNumbers}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        requireNumbers: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Exiger des chiffres</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireSpecialChars}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: {
                        ...prev.passwordPolicy,
                        requireSpecialChars: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Exiger des caractères spéciaux</span>
                </label>
              </div>
            </div>
          </div>

          {/* Paramètres de session */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Gestion des Sessions</span>
            </h3>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout de session (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={settings.sessionSettings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      sessionSettings: {
                        ...prev.sessionSettings,
                        sessionTimeout: parseInt(e.target.value) || 30
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sessions simultanées max
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.sessionSettings.maxConcurrentSessions}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      sessionSettings: {
                        ...prev.sessionSettings,
                        maxConcurrentSessions: parseInt(e.target.value) || 3
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sessionSettings.requireReauth}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      sessionSettings: {
                        ...prev.sessionSettings,
                        requireReauth: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Exiger une ré-authentification pour les actions sensibles</span>
                </label>
              </div>
            </div>
          </div>

          {/* Contrôle d'accès */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Contrôle d'Accès</span>
            </h3>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tentatives de connexion avant blocage
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.accessControl.blockAfterFailedAttempts}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      accessControl: {
                        ...prev.accessControl,
                        blockAfterFailedAttempts: parseInt(e.target.value) || 5
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.accessControl.enableTwoFactor}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        accessControl: {
                          ...prev.accessControl,
                          enableTwoFactor: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Activer l'authentification à deux facteurs</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.accessControl.allowRemoteAccess}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        accessControl: {
                          ...prev.accessControl,
                          allowRemoteAccess: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Autoriser l'accès à distance</span>
                  </label>
                </div>

                {/* IP Whitelist */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liste blanche des adresses IP
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newIp}
                      onChange={(e) => setNewIp(e.target.value)}
                      placeholder="192.168.1.1"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={addIpToWhitelist}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {settings.accessControl.ipWhitelist.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm text-gray-700">{ip}</span>
                        <button
                          onClick={() => removeIpFromWhitelist(ip)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                    {settings.accessControl.ipWhitelist.length === 0 && (
                      <p className="text-sm text-gray-500 italic">Aucune restriction IP configurée</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alertes de sécurité */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Recommandations de Sécurité</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Activez l'authentification à deux facteurs pour tous les administrateurs</li>
                  <li>• Configurez des mots de passe forts avec expiration régulière</li>
                  <li>• Limitez l'accès aux adresses IP de confiance</li>
                  <li>• Surveillez régulièrement les journaux de connexion</li>
                  <li>• Effectuez des sauvegardes régulières des données</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;