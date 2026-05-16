// EC2 배포 전용 PM2 설정 — 절대 경로 사용 (ecosystem.config.js의 개발용 상대 경로와 구분)
module.exports = {
  apps: [
    {
      name: 'sdui-api',
      cwd: '/home/ubuntu/sdui/apps/api',
      script: 'dist/main.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'sdui-web',
      // Turborepo 모노레포 standalone 빌드 결과 경로
      cwd: '/home/ubuntu/sdui/apps/web/.next/standalone/apps/web',
      script: 'server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
