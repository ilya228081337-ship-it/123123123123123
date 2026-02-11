import { useState, useEffect } from 'react';
import { BarChart3, LogOut, RefreshCw, Users, Settings } from 'lucide-react';
import { supabase, User, WorkloadReport } from '../lib/supabase';
import FilterPanel from './FilterPanel';
import UserManagement from './UserManagement';

interface ManagerDashboardProps {
  user: User;
  onLogout: () => void;
}

interface EmployeeReport {
  user: User;
  latestReport: WorkloadReport | null;
}

export default function ManagerDashboard({ user, onLogout }: ManagerDashboardProps) {
  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedWorkloadRange, setSelectedWorkloadRange] = useState<[number, number]>([1, 5]);
  const [filterExpanded, setFilterExpanded] = useState(false);

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadReports = async () => {
    try {
      const { data: employees } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'employee');

      if (!employees) return;

      const reportsData: EmployeeReport[] = await Promise.all(
        employees.map(async (employee) => {
          const { data: latestReport } = await supabase
            .from('workload_reports')
            .select('*')
            .eq('user_id', employee.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            user: employee as User,
            latestReport: latestReport as WorkloadReport | null,
          };
        })
      );

      setReports(reportsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-green-500',
      'bg-lime-500',
      'bg-yellow-500',
      'bg-orange-500',
      'bg-red-500',
    ];
    return colors[level - 1];
  };

  const getLevelText = (level: number) => {
    const texts = ['Очень низкая', 'Низкая', 'Средняя', 'Высокая', 'Критическая'];
    return texts[level - 1];
  };

  const departments = Array.from(new Set(reports.map((r) => r.user.department_name)));

  const filteredReports = reports.filter((report) => {
    const deptMatch =
      selectedDepartments.length === 0 ||
      selectedDepartments.includes(report.user.department_name);

    const workloadLevel = report.latestReport?.workload_level || 0;
    const workloadMatch =
      workloadLevel === 0 ||
      (workloadLevel >= selectedWorkloadRange[0] &&
        workloadLevel <= selectedWorkloadRange[1]);

    return deptMatch && workloadMatch;
  });

  const averageWorkload = reports.length > 0
    ? reports.reduce((sum, r) => sum + (r.latestReport?.workload_level || 0), 0) / reports.length
    : 0;

  const handleDepartmentFilter = (department: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  const handleClearFilters = () => {
    setSelectedDepartments([]);
    setSelectedWorkloadRange([1, 5]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Панель руководителя</h1>
              <p className="text-sm text-gray-600">{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadReports}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Обновить
            </button>
            <button
              onClick={() => setIsUserManagementOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              Управление
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-600">Всего сотрудников</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">{reports.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-600">Средняя нагрузка</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {averageWorkload.toFixed(1)}/5
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="w-6 h-6 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-600">Отчетов сегодня</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {reports.filter((r) => r.latestReport &&
                new Date(r.latestReport.created_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <FilterPanel
            departments={departments}
            selectedDepartments={selectedDepartments}
            onDepartmentChange={handleDepartmentFilter}
            selectedWorkloadRange={selectedWorkloadRange}
            onWorkloadRangeChange={setSelectedWorkloadRange}
            onClearFilters={handleClearFilters}
            isExpanded={filterExpanded}
            onToggleExpand={() => setFilterExpanded(!filterExpanded)}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Мониторинг нагрузки отделов ({filteredReports.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-600">Загрузка...</div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              {reports.length === 0
                ? 'Нет сотрудников в системе'
                : 'Нет результатов по выбранным фильтрам'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <div key={report.user.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {report.user.username}
                        </h3>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {report.user.department_name}
                        </span>
                      </div>

                      {report.latestReport ? (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-4 py-2 rounded-lg text-white font-semibold ${getLevelColor(
                                report.latestReport.workload_level
                              )}`}
                            >
                              Уровень {report.latestReport.workload_level} - {getLevelText(report.latestReport.workload_level)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(report.latestReport.created_at).toLocaleString('ru-RU')}
                            </span>
                          </div>

                          {report.latestReport.notes && (
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {report.latestReport.notes}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500 italic">Отчеты не отправлены</p>
                      )}
                    </div>

                    {report.latestReport && (
                      <div className="flex-shrink-0 w-24">
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div className="text-right">
                              <span className="text-2xl font-bold text-gray-700">
                                {report.latestReport.workload_level}
                              </span>
                              <span className="text-sm text-gray-500">/5</span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: `${(report.latestReport.workload_level / 5) * 100}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getLevelColor(
                                report.latestReport.workload_level
                              )}`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <UserManagement
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          onUserAdded={loadReports}
          employees={reports.map((r) => r.user)}
        />
      </main>
    </div>
  );
}
