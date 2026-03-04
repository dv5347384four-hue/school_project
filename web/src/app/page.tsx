import { DashboardCard } from '../components/DashboardCard';

const sections = [
  { key: 'teacher', title: 'Dashboard Teacher', items: ['Классы', 'Журнал оценок', 'Проверка ДЗ', 'Посещаемость'] },
  { key: 'student', title: 'Dashboard Student', items: ['Расписание', 'Домашние задания', 'Оценки', 'Уведомления'] },
  { key: 'parent', title: 'Dashboard Parent', items: ['Успеваемость детей', 'Пропуски', 'Связь с учителями'] },
  { key: 'admin', title: 'Dashboard Admin', items: ['Пользователи', 'Настройки школы', 'Бэкапы', 'Audit logs'] }
];

export default function HomePage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-4 p-4 md:grid-cols-2">
      <DashboardCard title="Login / Профиль">
        <p>JWT auth + refresh tokens + CSRF формы. Горячие клавиши: Ctrl+K поиск, G+T расписание.</p>
      </DashboardCard>
      {sections.map((s) => (
        <DashboardCard key={s.key} title={s.title}>
          <ul className="list-disc pl-5">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </DashboardCard>
      ))}
      <DashboardCard title="Class Page / Gradebook / Homework / Messages">
        <p>Фильтры, полнотекстовый поиск, пагинация, lazy loading, тёмная и светлая темы, PWA offline cache.</p>
      </DashboardCard>
    </main>
  );
}
