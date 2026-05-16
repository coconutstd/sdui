# EC2 배포 가이드

## GitHub Actions 자동 배포 (준비 중)

파이프라인 코드는 완성되어 있음 (커밋 `44bebf9`). 아래 세팅을 완료하면 `main` push 시 자동 배포된다.

### 1. GitHub Secrets 등록

저장소 → Settings → Secrets and variables → Actions → New repository secret

| Secret | 설명 |
|---|---|
| `AWS_ACCESS_KEY_ID` | S3 업로드용 IAM 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | 위와 쌍 |
| `AWS_REGION` | 예: `ap-northeast-2` |
| `S3_BUCKET_NAME` | 아티팩트 저장 버킷 이름 |
| `EC2_HOST` | EC2 퍼블릭 IP 또는 도메인 |
| `EC2_USER` | SSH 유저 (보통 `ubuntu`) |
| `EC2_SSH_PRIVATE_KEY` | PEM 키 전체 내용 (`-----BEGIN ...` 포함) |
| `NEXT_PUBLIC_API_URL` | `http://{EC2_IP}:3001` |

### 2. IAM 설정 (AWS 콘솔)

- **GitHub Actions용 IAM 유저**: `s3:PutObject`, `s3:GetObject` 권한 (해당 버킷만)
- **EC2 IAM Instance Profile**: `s3:GetObject` 권한 → EC2 배포 스크립트가 자격증명 없이 S3 읽기 가능

### 3. EC2 추가 세팅

기존 사전 준비 외에 AWS CLI 설치 필요:

```bash
sudo apt-get install -y awscli
mkdir -p /home/ubuntu/sdui /home/ubuntu/sdui-backup
```

### 배포 흐름

```
main push
  → ci.yml  : lint + type-check + build + test
  → deploy.yml
      [build-and-package] → tar.gz 생성 (api / web 분리)
      [upload-to-s3]      → s3://BUCKET/sdui/releases/{SHA}/
      [deploy-to-ec2]     → SSH → S3 다운로드 → pm2 reload (zero-downtime)
      [rollback]          → deploy 실패 시 이전 배포본 자동 복원
```

---

## 수동 배포 (로컬에서 직접)

## 사전 준비 (EC2 Ubuntu, 수동 배포용)

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
