module.exports = {
  apps: [
    {
      name: 'sdui-api',
      cwd: 'apps/api',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'sdui-web',
      cwd: 'apps/web',
      script: '.next/standalone/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        NEXT_PUBLIC_API_URL: 'http://YOUR_EC2_IP:3001',
      },
    },
  ],
};
