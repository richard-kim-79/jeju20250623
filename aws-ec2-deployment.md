# 🚀 AWS EC2 백엔드 서버 배포 가이드

## 📋 사전 준비사항

### 1. AWS 계정 및 권한
- AWS 계정 생성
- EC2, RDS, S3, IAM 권한 설정
- 키 페어 생성 (SSH 접속용)

### 2. 도메인 및 SSL
- 도메인 준비 (선택사항)
- SSL 인증서 준비 (AWS Certificate Manager)

## 🔧 EC2 인스턴스 생성

### 1. EC2 인스턴스 사양
```
인스턴스 타입: t3.medium (2vCPU, 4GB RAM)
OS: Ubuntu 22.04 LTS
스토리지: 20GB GP3
보안 그룹: HTTP(80), HTTPS(443), SSH(22), Custom(3004)
```

### 2. 보안 그룹 설정
```
- SSH (22): 0.0.0.0/0
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom TCP (3004): 0.0.0.0/0 (백엔드 API)
```

## 🛠️ 서버 초기 설정

### 1. 서버 접속
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Node.js 설치 (v18 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node --version
npm --version
```

### 4. PostgreSQL 설치
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 5. PM2 설치 (프로세스 관리)
```bash
sudo npm install -g pm2
```

### 6. Nginx 설치
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 📁 프로젝트 배포

### 1. 프로젝트 클론
```bash
cd /home/ubuntu
git clone https://github.com/your-username/jeju20250623.git
cd jeju20250623/backend
```

### 2. 환경변수 설정
```bash
# .env 파일 생성
sudo nano .env

# 다음 내용 입력 (실제 값으로 교체)
DATABASE_URL="postgresql://username:password@localhost:5432/jeju_db"
JWT_SECRET="실제_JWT_SECRET"
JWT_EXPIRES_IN="7d"
PORT=3004
NODE_ENV=production
AWS_ACCESS_KEY_ID="실제_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="실제_AWS_SECRET_ACCESS_KEY"
AWS_REGION="ap-northeast-2"
AWS_S3_BUCKET_NAME="jeju-sns-images"
FIREBASE_PROJECT_ID="실제_FIREBASE_PROJECT_ID"
FIREBASE_CLIENT_EMAIL="실제_FIREBASE_CLIENT_EMAIL"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n실제_FIREBASE_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
CORS_ORIGIN="https://your-domain.com,https://www.your-domain.com"
API_KEY_SECRET="실제_API_KEY_SECRET"
LOG_LEVEL="info"
```

### 3. 의존성 설치 및 빌드
```bash
npm install
npm run build
```

### 4. 데이터베이스 설정
```bash
# PostgreSQL 사용자 생성
sudo -u postgres psql
CREATE USER jeju_user WITH PASSWORD 'your_password';
CREATE DATABASE jeju_db OWNER jeju_user;
GRANT ALL PRIVILEGES ON DATABASE jeju_db TO jeju_user;
\q

# 마이그레이션 실행
npx prisma migrate deploy
```

### 5. PM2로 서버 실행
```bash
# PM2 설정 파일 생성
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'jeju-backend',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3004
    }
  }]
};
EOF

# 서버 시작
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Nginx 설정

### 1. Nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/sites-available/jeju-backend
```

### 2. 설정 내용
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 설정 활성화
```bash
sudo ln -s /etc/nginx/sites-available/jeju-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL 인증서 설정 (선택사항)

### 1. Certbot 설치
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. SSL 인증서 발급
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 📊 모니터링 설정

### 1. PM2 모니터링
```bash
pm2 monit
```

### 2. 로그 확인
```bash
pm2 logs jeju-backend
```

## 🚀 배포 스크립트

### deploy.sh 스크립트 생성
```bash
#!/bin/bash
echo "🚀 제주 SNS 백엔드 배포를 시작합니다..."

# Git pull
git pull origin main

# 의존성 설치
npm install

# 빌드
npm run build

# 마이그레이션
npx prisma migrate deploy

# PM2 재시작
pm2 restart jeju-backend

echo "✅ 배포가 완료되었습니다!"
```

### 실행 권한 부여
```bash
chmod +x deploy.sh
```

## 🔧 문제 해결

### 1. 포트 확인
```bash
sudo netstat -tlnp | grep :3004
```

### 2. 로그 확인
```bash
pm2 logs jeju-backend --lines 100
```

### 3. 서비스 상태 확인
```bash
pm2 status
sudo systemctl status nginx
```

## 📞 지원

배포 중 문제가 발생하면:
1. PM2 로그 확인
2. Nginx 로그 확인: `sudo tail -f /var/log/nginx/error.log`
3. 시스템 로그 확인: `sudo journalctl -u nginx` 