import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { env } from '../config/env.js';

export async function register(payload: { email: string; password: string; firstName: string; lastName: string; role: any; schoolId: string }) {
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({ data: { ...payload, passwordHash } });
  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  const accessToken = jwt.sign({ sub: user.id, role: user.role, schoolId: user.schoolId }, env.jwtAccessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: user.id }, env.jwtRefreshSecret, { expiresIn: '30d' });
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: await bcrypt.hash(refreshToken, 10), expiresAt: new Date(Date.now() + 30 * 86400000) } });
  return { user, accessToken, refreshToken };
}
