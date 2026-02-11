import { useState, useEffect } from 'react';
import { Activity, LogOut, Send } from 'lucide-react';
import { supabase, User, WorkloadReport } from '../lib/supabase';

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [workloadLevel, setWorkloadLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastReport, setLastReport] = useState<WorkloadReport | null>(null);

  useEffect(() => {
    loadLastReport();
  }, []);

  const loadLastReport = async () => {
    const { data } = await supabase
      .from('workload_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setLastReport(data as WorkloadReport);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('workload_reports')
        .insert({
          user_id: user.id,
          workload_level: workloadLevel,
          notes: notes,
        });

      if (error) throw error;

      setSuccess(true);
      setNotes('');
      loadLastReport();
      setTimeout(() => setSuccess(false), 3000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">{user.username}</h1>
              <p className="text-sm text-gray-600">{user.department_name}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Отчет о нагрузке отдела
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Уровень нагрузки
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setWorkloadLevel(level)}
                    className={`flex-1 py-4 rounded-lg font-semibold transition-all ${
                      workloadLevel === level
                        ? `${getLevelColor(level)} text-white scale-105 shadow-lg`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-center mt-3 text-sm font-medium text-gray-600">
                {getLevelText(workloadLevel)}
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Комментарий (опционально)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Добавьте комментарий о текущей нагрузке..."
              />
            </div>

            {success && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="font-medium">Отчет успешно отправлен!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Отправка...' : 'Отправить отчет'}
            </button>
          </form>
        </div>

        {lastReport && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Последний отчет
            </h3>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-lg text-white font-semibold ${getLevelColor(
                  lastReport.workload_level
                )}`}
              >
                Уровень {lastReport.workload_level}
              </span>
              <span className="text-sm text-gray-600">
                {new Date(lastReport.created_at).toLocaleString('ru-RU')}
              </span>
            </div>
            {lastReport.notes && (
              <p className="mt-3 text-gray-700">{lastReport.notes}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
