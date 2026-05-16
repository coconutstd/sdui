# EC2 배포 가이드

## 사전 준비 (EC2 Ubuntu)

```bash
# Node.js 20 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 + nginx 설치
sudo npm install -g pm2
sudo apt-get install -y nginx
```

## 배포

```bash
# 코드 클론 & 의존성 설치
git clone <repo> sdui && cd sdui
npm ci

# 빌드 (sdui-schema → api → web 순으로 자동)
npm run build

# web standalone 정적 파일 복사 (Next.js standalone 요구사항)
cp -r apps/web/public apps/web/.next/standalone/apps/web/public
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static

# ecosystem.config.js에서 NEXT_PUBLIC_API_URL을 실제 EC2 IP로 변경
# 예: http://3.38.xxx.xxx:3001

# PM2로 실행
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 부팅 시 자동 시작 설정
```

## nginx 설정

```bash
sudo cp nginx.conf /etc/nginx/sites-available/sdui
sudo ln -s /etc/nginx/sites-available/sdui /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## EC2 보안 그룹

| 포트 | 용도 |
|------|------|
| 80   | HTTP (nginx → web/api) |
| 3000 | web 직접 접근 (선택) |
| 3001 | api 직접 접근 (선택) |

## 확인

- 웹: `http://EC2_IP/admin`
- API: `http://EC2_IP/api/screens`
- PM2 상태: `pm2 status`
- 로그: `pm2 logs sdui-api` / `pm2 logs sdui-web`
