# Школьный дневник — Школа №197 (Минск)

Production-ready монорепозиторий: **Express + TypeScript + Prisma + PostgreSQL + Redis + BullMQ** и **Next.js + Tailwind + PWA**.

## File tree
```text
.
├── server/                  # API, Prisma, auth, RBAC, audit, queues
├── web/                     # Next.js dashboards, PWA shell, role pages
├── infra/k8s/               # k8s deploy manifests
├── scripts/                 # backup/restore cron scripts
├── docs/                    # ERD, security, reports SQL
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

## Почему этот стек
- TypeScript end-to-end для безопасной доменной модели.
- Prisma для быстрых миграций/seed/rollback сценариев.
- Next.js для SSR/SPA гибрида, PWA и быстрого UX.

## Multi-school
- Флаг `MULTI_SCHOOL=true/false` в конфиге backend.

## Roles
- `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `REGISTRAR`, `GUEST`.

## API (15+ ключевых)
1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `POST /api/auth/refresh`
4. `GET /api/users/me`
5. `GET /api/classes/:id/timetable`
6. `POST /api/classes/:id/attendance`
7. `POST /api/classes/:id/grades`
8. `GET /api/students/:id/report`
9. `POST /api/homework`
10. `GET /api/homework/:id/submissions`
11. `POST /api/messages`
12. `GET /api/announcements`
13. `POST /api/files/upload`
14. `GET /api/export/report.pdf`
15. `POST /api/admin/import/csv`
16. `POST /api/auth/logout`

Подробная спецификация: `server/openapi.yaml`.

## TypeScript interfaces
```ts
export interface User { id: string; schoolId: string; email: string; firstName: string; lastName: string; role: 'ADMIN'|'TEACHER'|'STUDENT'|'PARENT'|'REGISTRAR'|'GUEST'; }
export interface Student { id: string; userId: string; classId: string; admissionDate: string; }
export interface Grade { id: string; studentId: string; subjectId: string; gradeTypeId: string; value: number; reason?: string; changedByUserId: string; }
export interface Attendance { id: string; lessonId: string; studentId: string; status: 'PRESENT'|'LATE'|'SICK'|'ABSENT'; date: string; note?: string; }
export interface Homework { id: string; subjectId: string; teacherId: string; title: string; description: string; dueDate: string; }
```

## UI прототипы
- `/login`: email/password, reset, verify CTA.
- `/`: role dashboards (teacher/student/parent/admin), hotkeys, filters, search, pagination/lazy loading.
- Компоненты: class page, gradebook, homework page, messages, profile, admin panel.

## Безопасность
- JWT access+refresh.
- CSRF cookie token (`csurf`).
- `helmet`, `rate-limit`, bcrypt.
- Audit logs (`audit_logs`) и login logs.
- Ограничения upload size + MIME.
- Рекомендации: CSP strict, HTTPS-only, PII column encryption (pgcrypto/KMS), RBAC review, backup policy.

## Мониторинг и SLA
- Stateless API для горизонтального масштабирования.
- Prometheus scrape endpoint (добавить `/metrics`) и Sentry SDK (пример в docs).
- Без sticky sessions.

## Backup/Restore
- `scripts/backup.sh`, `scripts/restore.sh` + cron examples.

## SQL examples for reports
См. `docs/report_queries.sql`.

## Acceptance criteria checklist
1. Регистрация/вход.
2. RBAC ограничения.
3. Teacher ставит оценку, Parent видит отчёт.
4. PDF экспорт формируется.
5. Backup/restore работает.
6. CI tests pass.

## How to run
### Локально
```bash
cp .env.example .env
docker compose up --build
```

### Миграции и seed
```bash
cd server
npm install
npm run prisma:migrate:dev
npm run seed
```

### Тесты
```bash
npm run test -w server
npm run test -w web
```

### Production build
```bash
npm run build
```

### Пример деплоя в облако
- Сборка и публикация docker image в GHCR.
- Применение `infra/k8s/*.yaml` в Kubernetes (DO/AWS EKS).

