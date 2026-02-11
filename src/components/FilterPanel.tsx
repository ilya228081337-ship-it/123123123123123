import { ChevronDown, X } from 'lucide-react';

interface FilterPanelProps {
  departments: string[];
  selectedDepartments: string[];
  onDepartmentChange: (department: string) => void;
  selectedWorkloadRange: [number, number];
  onWorkloadRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function FilterPanel({
  departments,
  selectedDepartments,
  onDepartmentChange,
  selectedWorkloadRange,
  onWorkloadRangeChange,
  onClearFilters,
  isExpanded,
  onToggleExpand,
}: FilterPanelProps) {
  const workloadLevels = [
    { value: 1, label: 'Очень низкая (1)', color: 'bg-green-500' },
    { value: 2, label: 'Низкая (2)', color: 'bg-lime-500' },
    { value: 3, label: 'Средняя (3)', color: 'bg-yellow-500' },
    { value: 4, label: 'Высокая (4)', color: 'bg-orange-500' },
    { value: 5, label: 'Критическая (5)', color: 'bg-red-500' },
  ];

  const isFiltered =
    selectedDepartments.length > 0 ||
    selectedWorkloadRange[0] !== 1 ||
    selectedWorkloadRange[1] !== 5;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={onToggleExpand}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Фильтры</h3>
          {isFiltered && (
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
              активны
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-6 py-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">По отделам</h4>
              {selectedDepartments.length > 0 && (
                <span className="text-xs text-gray-500">
                  выбрано {selectedDepartments.length}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {departments.map((dept) => (
                <label key={dept} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept)}
                    onChange={() => onDepartmentChange(dept)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">По уровню нагрузки</h4>
              {(selectedWorkloadRange[0] !== 1 || selectedWorkloadRange[1] !== 5) && (
                <span className="text-xs text-gray-500">
                  {selectedWorkloadRange[0]} - {selectedWorkloadRange[1]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {workloadLevels.map((level) => (
                <label
                  key={level.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      level.value >= selectedWorkloadRange[0] &&
                      level.value <= selectedWorkloadRange[1]
                    }
                    onChange={() => {
                      if (
                        level.value >= selectedWorkloadRange[0] &&
                        level.value <= selectedWorkloadRange[1]
                      ) {
                        if (level.value === selectedWorkloadRange[0]) {
                          onWorkloadRangeChange([
                            level.value + 1,
                            selectedWorkloadRange[1],
                          ]);
                        } else if (level.value === selectedWorkloadRange[1]) {
                          onWorkloadRangeChange([
                            selectedWorkloadRange[0],
                            level.value - 1,
                          ]);
                        }
                      } else {
                        const newMin = Math.min(
                          level.value,
                          selectedWorkloadRange[0]
                        );
                        const newMax = Math.max(
                          level.value,
                          selectedWorkloadRange[1]
                        );
                        onWorkloadRangeChange([newMin, newMax]);
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${level.color}`} />
                    <span className="text-gray-700">{level.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            >
              <X className="w-4 h-4" />
              Очистить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
}
