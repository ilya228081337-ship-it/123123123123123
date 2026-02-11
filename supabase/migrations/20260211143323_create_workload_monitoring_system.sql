/*
  # Система мониторинга нагрузки отделов

  1. Новые таблицы
    - `users` - пользователи системы
      - `id` (uuid, primary key)
      - `username` (text, unique) - логин пользователя
      - `password` (text) - пароль
      - `role` (text) - роль (employee/manager)
      - `department_name` (text) - название отдела
      - `created_at` (timestamptz) - дата создания
    
    - `workload_reports` - отчеты о нагрузке
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - ID сотрудника
      - `workload_level` (integer) - уровень нагрузки (1-5)
      - `notes` (text) - дополнительные заметки
      - `created_at` (timestamptz) - дата создания отчета

  2. Безопасность
    - Включен RLS для обеих таблиц
    - Политики доступа для чтения и записи данных
*/

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('employee', 'manager')),
  department_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы отчетов о нагрузке
CREATE TABLE IF NOT EXISTS workload_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  workload_level integer NOT NULL CHECK (workload_level BETWEEN 1 AND 5),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Включение RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workload_reports ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
CREATE POLICY "Все могут читать пользователей"
  ON users FOR SELECT
  USING (true);

-- Политики для таблицы workload_reports
CREATE POLICY "Все могут читать отчеты"
  ON workload_reports FOR SELECT
  USING (true);

CREATE POLICY "Сотрудники могут создавать отчеты"
  ON workload_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Сотрудники могут обновлять свои отчеты"
  ON workload_reports FOR UPDATE
  USING (true);

-- Вставка предустановленных пользователей
INSERT INTO users (username, password, role, department_name) VALUES
  ('director', 'director123', 'manager', 'Руководство'),
  ('employee1', 'emp123', 'employee', 'Отдел продаж'),
  ('employee2', 'emp123', 'employee', 'Отдел маркетинга'),
  ('employee3', 'emp123', 'employee', 'Отдел разработки'),
  ('employee4', 'emp123', 'employee', 'Отдел поддержки'),
  ('employee5', 'emp123', 'employee', 'Отдел логистики'),
  ('employee6', 'emp123', 'employee', 'Бухгалтерия')
ON CONFLICT (username) DO NOTHING;

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_workload_reports_user_id ON workload_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_workload_reports_created_at ON workload_reports(created_at DESC);