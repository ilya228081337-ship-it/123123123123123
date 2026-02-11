import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase, User } from '../lib/supabase';

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  employees: User[];
}

export default function UserManagement({
  isOpen,
  onClose,
  onUserAdded,
  employees,
}: UserManagementProps) {
  const [activeTab, setActiveTab] = useState<'add-employee' | 'add-department' | 'delete-employee'>('add-employee');
  const [newEmployeeUsername, setNewEmployeeUsername] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [newEmployeeDepartment, setNewEmployeeDepartment] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const departments = Array.from(new Set(employees.map((e) => e.department_name)));

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!newEmployeeUsername || !newEmployeePassword || !newEmployeeDepartment) {
        setError('Заполните все поля');
        return;
      }

      const { error: insertError } = await supabase.from('users').insert([
        {
          username: newEmployeeUsername,
          password: newEmployeePassword,
          role: 'employee',
          department_name: newEmployeeDepartment,
        },
      ]);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSuccess('Сотрудник успешно добавлен');
      setNewEmployeeUsername('');
      setNewEmployeePassword('');
      setNewEmployeeDepartment('');
      onUserAdded();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при добавлении сотрудника');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!newDepartmentName) {
        setError('Укажите название отдела');
        return;
      }

      const { error: insertError } = await supabase.from('users').insert([
        {
          username: `dept_${Date.now()}`,
          password: 'temp_password',
          role: 'employee',
          department_name: newDepartmentName,
        },
      ]);

      if (insertError && !insertError.message.includes('duplicate')) {
        setError(insertError.message);
        return;
      }

      setSuccess('Отдел успешно добавлен');
      setNewDepartmentName('');
      onUserAdded();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при добавлении отдела');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployeeId) {
      setError('Выберите сотрудника для удаления');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedEmployeeId);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setSuccess('Сотрудник успешно удален');
      setSelectedEmployeeId('');
      onUserAdded();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при удалении сотрудника');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Управление пользователями</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('add-employee')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'add-employee'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Добавить сотрудника
            </button>
            <button
              onClick={() => setActiveTab('add-department')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'add-department'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Добавить отдел
            </button>
            <button
              onClick={() => setActiveTab('delete-employee')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'delete-employee'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Удалить
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {activeTab === 'add-employee' && (
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Логин сотрудника
                </label>
                <input
                  type="text"
                  value={newEmployeeUsername}
                  onChange={(e) => setNewEmployeeUsername(e.target.value)}
                  placeholder="например: employee7"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль
                </label>
                <input
                  type="text"
                  value={newEmployeePassword}
                  onChange={(e) => setNewEmployeePassword(e.target.value)}
                  placeholder="например: emp123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отдел
                </label>
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setNewEmployeeDepartment(dept)}
                      className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-colors ${
                        newEmployeeDepartment === dept
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newEmployeeDepartment}
                  onChange={(e) => setNewEmployeeDepartment(e.target.value)}
                  placeholder="или введите новый отдел"
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                Добавить сотрудника
              </button>
            </form>
          )}

          {activeTab === 'add-department' && (
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название отдела
                </label>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="например: Отдел аналитики"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                Отдел будет добавлен в систему. Позже вы сможете добавить сотрудников в этот отдел.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                Добавить отдел
              </button>
            </form>
          )}

          {activeTab === 'delete-employee' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите сотрудника для удаления
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {employees
                    .filter((e) => e.role === 'employee')
                    .map((employee) => (
                      <button
                        key={employee.id}
                        onClick={() => setSelectedEmployeeId(employee.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                          selectedEmployeeId === employee.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-800">{employee.username}</div>
                        <div className="text-sm text-gray-600">{employee.department_name}</div>
                      </button>
                    ))}
                </div>
              </div>

              {selectedEmployeeId && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">
                    Внимание! Удаление сотрудника также удалит все его отчеты о нагрузке.
                  </p>
                </div>
              )}

              <button
                onClick={handleDeleteEmployee}
                disabled={loading || !selectedEmployeeId}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                Удалить сотрудника
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
