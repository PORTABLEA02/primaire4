import React, { useState } from 'react';
import { Eye, EyeOff, School, Mail, Lock, AlertCircle, Loader, Database, X } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface LoginPageProps {
  onLogin: (credentials: LoginCredentials) => Promise<boolean>;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Comptes de test (pour information uniquement)
  const testAccounts = [
    { email: 'admin@ecoletech.edu', role: 'Administrateur', description: 'Accès complet au système' },
    { email: 'directeur@ecoletech.edu', role: 'Directeur', description: 'Gestion de l\'école' },
    { email: 'secretaire@ecoletech.edu', role: 'Secrétaire', description: 'Gestion des élèves' },
    { email: 'comptable@ecoletech.edu', role: 'Comptable', description: 'Gestion financière' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setLocalError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      const success = await onLogin({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (!success) {
        setLocalError('Échec de la connexion');
      }
    } catch (error: any) {
      setLocalError(error.message || 'Erreur de connexion');
    }

    setIsLoading(false);
  };

  const handleTestLogin = (account: typeof testAccounts[0]) => {
    setFormData({
      email: account.email,
      password: '', // L'utilisateur doit saisir le mot de passe
      rememberMe: false
    });
  };

  const handleForgotPassword = (email: string) => {
    // Simulation d'envoi d'email
    alert(`Un email de récupération a été envoyé à ${email}`);
    setShowForgotPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <School className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">EcoleTech</h1>
          <p className="text-gray-600">Système de Gestion Scolaire pour l'Afrique de l'Ouest</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connexion</h2>
            <p className="text-gray-600">Accédez à votre espace de gestion</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="votre.email@ecoletech.edu"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Se souvenir de moi</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                disabled={isLoading}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <span>Se Connecter</span>
              )}
            </button>
          </form>

          {/* Comptes de test */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-700">Comptes de Test (Base de Données)</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {testAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleTestLogin(account)}
                  disabled={isLoading}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{account.role}</p>
                      <p className="text-xs text-gray-500">{account.email}</p>
                      <p className="text-xs text-gray-400">{account.description}</p>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Utiliser</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">
                <strong>Note:</strong> Ces comptes utilisent la base de données Supabase. 
                Vous devez saisir le mot de passe configuré dans la base de données.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 EcoleTech. Système conçu pour l'éducation au Bénin.
          </p>
        </div>

        {/* Modal Mot de passe oublié */}
        {showForgotPassword && (
          <ForgotPasswordModal
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
            onSubmit={handleForgotPassword}
          />
        )}
      </div>
    </div>
  );
};

// Modal pour mot de passe oublié
const ForgotPasswordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmit(email);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Récupération de Mot de Passe</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre.email@ecoletech.edu"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!email || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <span>Envoyer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;