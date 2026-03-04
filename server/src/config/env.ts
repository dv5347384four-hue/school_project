export const env = {
  port: Number(process.env.API_PORT || 4000),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh',
  appOrigin: process.env.APP_ORIGIN || 'http://localhost:3000',
  multiSchool: process.env.MULTI_SCHOOL === 'true'
};
