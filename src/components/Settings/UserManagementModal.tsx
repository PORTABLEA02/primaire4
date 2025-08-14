import React, { useState } from 'react';
import { X, Users, Plus, Edit, Trash2, Shield, Eye, EyeOff } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Directeur' | 'Secrétaire' | 'Enseignant' | 'Comptable';
  status: 'Actif' | 'Inactif';
  lastLogin?: string;
  permissions: string[];
  linkedTeacher?: {
    id: string;
    name: string;
    assignedClass?: string;
  };
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin Principal',
      email: 'admin@ecoletech.edu',
      role: 'Admin',
      status: 'Actif',
      lastLogin: '2024-10-15 14:30',
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Dr. Amadou Sanogo',
      email: 'directeur@ecoletech.edu',
      role: 'Directeur',
      status: 'Actif',
      lastLogin: '2024-10-15 09:15',
      permissions: ['students', 'teachers', 'academic', 'reports']
    },
    {
      id: '3',
      name: 'Mme Fatoumata Keita',
      email: 'secretaire@ecoletech.edu',
      role: 'Secrétaire',
      status: 'Actif',
      lastLogin: '2024-10-14 16:45',
      permissions: ['students', 'classes']
    },
    {
      id: '4',
      name: 'M. Ibrahim Coulibaly',
      email: 'comptable@ecoletech.edu',
      role: 'Comptable',
      status: 'Actif',
      lastLogin: '2024-10-15 11:20',
      permissions: ['finance', 'reports']
    }
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Secrétaire' as User['role'],
    password: '',
    permissions: [] as string[]
  });

  const roles = [
    { value: 'Admin', label: 'Administrateur', color: 'red' },
    { value: 'Directeur', label: 'Directeur', color: 'purple' },
    { value: 'Secrétaire', label: 'Secrétaire', color: 'blue' },
    { value: 'Enseignant', label: 'Enseignant', color: 'green' },
    { value: 'Comptable', label: 'Comptable', color: 'yellow' }
  ];

  const permissions = [
    { id: 'students', label: 'Gestion des élèves' },
    { id: 'teachers', label: 'Gestion des enseignants' },
    { id: 'classes', label: 'Gestion des classes' },
    { id: 'academic', label: 'Gestion académique' },
    { id: 'finance', label: 'Gestion financière' },
    { id: 'schedule', label: 'Emplois du temps' },
    { id: 'reports', label: 'Rapports et statistiques' },
    { id: 'settings', label: 'Paramètres système' }
  ];

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.value === role);
    const colorMap = {
      red: 'bg-red-50 text-red-700 border-red-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };
    return colorMap[roleData?.color as keyof typeof colorMap] || colorMap.blue;
  };

  const handleAddUser = () => {
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'Actif',
      permissions: newUser.permissions
    };
    
    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', role: 'Secrétaire', password: '', permissions: [] });
    setShowAddUser(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'Actif' ? 'Inactif' : 'Actif' }
        : u
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
                <p className="text-gray-600">Comptes, rôles et permissions</p>
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
          {/* Header avec bouton d'ajout */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Utilisateurs du Système</h3>
              <p className="text-gray-600">{users.length} utilisateurs configurés</p>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvel Utilisateur</span>
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAddUser && (
            <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-4">Ajouter un Utilisateur</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom Complet *
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de Passe *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {permissions.map(permission => (
                    <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newUser.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewUser(prev => ({ ...prev, permissions: [...prev.permissions, permission.id] }));
                          } else {
                            setNewUser(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission.id) }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddUser}
                  disabled={!newUser.name || !newUser.email || !newUser.password}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des utilisateurs */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière Connexion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.linkedTeacher && (
                          <p className="text-xs text-blue-600 mt-1">
                            Enseignant: {user.linkedTeacher.name}
                            {user.linkedTeacher.assignedClass && ` (${user.linkedTeacher.assignedClass})`}
                          </p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.status === 'Actif' 
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.lastLogin || 'Jamais connecté'}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.includes('all') ? (
                          <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                            Toutes
                          </span>
                        ) : (
                          user.permissions.slice(0, 2).map(perm => (
                            <span key={perm} className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs">
                              {permissions.find(p => p.id === perm)?.label.split(' ')[0]}
                            </span>
                          ))
                        )}
                        {user.permissions.length > 2 && !user.permissions.includes('all') && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs">
                            +{user.permissions.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-1 rounded transition-colors ${
                            user.status === 'Actif'
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          }`}
                          title={user.status === 'Actif' ? 'Désactiver' : 'Activer'}
                        >
                          {user.status === 'Actif' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {user.role !== 'Admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Informations de sécurité */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Recommandations de Sécurité</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Utilisez des mots de passe forts (minimum 8 caractères)</li>
                  <li>• Changez les mots de passe par défaut</li>
                  <li>• Accordez uniquement les permissions nécessaires</li>
                  <li>• Désactivez les comptes inutilisés</li>
                  <li>• Surveillez régulièrement les connexions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;