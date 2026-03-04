import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import PDFDocument from 'pdfkit';
import { prisma } from './utils/prisma.js';
import { login, register } from './services/auth.service.js';
import { requireAuth, requireRole, AuthRequest } from './middleware/auth.js';
import { env } from './config/env.js';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
export const router = Router();

router.post('/auth/register', async (req, res) => {
  const user = await register({ ...req.body, schoolId: req.body.schoolId || 'school-197' });
  res.status(201).json({ id: user.id, email: user.email, needsVerification: true });
});
router.post('/auth/login', async (req, res) => {
  const out = await login(req.body.email, req.body.password);
  if (!out) return res.status(401).json({ message: 'Invalid credentials' });
  res.json(out);
});
router.post('/auth/refresh', async (req, res) => {
  const payload = jwt.verify(req.body.refreshToken, env.jwtRefreshSecret) as { sub: string };
  const tokenRows = await prisma.refreshToken.findMany({ where: { userId: payload.sub } });
  const hit = await Promise.any(tokenRows.map(async (row) => (await bcrypt.compare(req.body.refreshToken, row.tokenHash) ? row : Promise.reject()))).catch(() => null);
  if (!hit) return res.status(401).json({ message: 'Invalid refresh token' });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
  const accessToken = jwt.sign({ sub: user.id, role: user.role, schoolId: user.schoolId }, env.jwtAccessSecret, { expiresIn: '15m' });
  res.json({ accessToken });
});
router.get('/users/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  res.json(user);
});
router.get('/classes/:id/timetable', requireAuth, async (req, res) => res.json(await prisma.lesson.findMany({ where: { classId: req.params.id } })));
router.post('/classes/:id/attendance', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => res.status(201).json(await prisma.attendance.createMany({ data: req.body.records })));
router.post('/classes/:id/grades', requireAuth, requireRole('TEACHER', 'ADMIN'), async (req, res) => res.status(201).json(await prisma.grade.create({ data: req.body })));
router.get('/students/:id/report', requireAuth, async (req, res) => {
  const [grades, attendance] = await Promise.all([prisma.grade.findMany({ where: { studentId: req.params.id } }), prisma.attendance.findMany({ where: { studentId: req.params.id } })]);
  res.json({ grades, attendance });
});
router.post('/homework', requireAuth, requireRole('TEACHER'), async (req, res) => res.status(201).json(await prisma.homework.create({ data: req.body })));
router.get('/homework/:id/submissions', requireAuth, async (req, res) => res.json(await prisma.homeworkSubmission.findMany({ where: { homeworkId: req.params.id } })));
router.post('/messages', requireAuth, async (req: AuthRequest, res) => res.status(201).json(await prisma.message.create({ data: { ...req.body, senderId: req.user!.sub } })));
router.get('/announcements', requireAuth, async (_, res) => res.json(await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })));
router.post('/files/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
  res.status(201).json(await prisma.file.create({ data: { ownerId: req.user!.sub, fileName: req.file!.originalname, mimeType: req.file!.mimetype, size: req.file!.size, path: `/uploads/${req.file!.filename}` } }));
});
router.get('/export/report.pdf', requireAuth, async (_req, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res); doc.fontSize(16).text('School report'); doc.end();
});
router.post('/admin/import/csv', requireAuth, requireRole('ADMIN', 'REGISTRAR'), async (_req, res) => res.json({ status: 'queued' }));
router.post('/auth/logout', requireAuth, async (req: AuthRequest, res) => { await prisma.refreshToken.deleteMany({ where: { userId: req.user!.sub } }); res.json({ ok: true }); });
router.get('/health', (_req, res) => res.json({ ok: true }));
