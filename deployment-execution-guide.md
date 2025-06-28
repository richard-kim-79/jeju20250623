# 🚀 배포 실행 가이드

## 📋 배포 순서

### 1단계: AWS EC2 백엔드 배포
### 2단계: Vercel 프론트엔드 배포
### 3단계: 연동 테스트

---

## 🔧 1단계: AWS EC2 백엔드 배포

### 1. EC2 인스턴스 생성
1. AWS 콘솔 접속
2. EC2 서비스 선택
3. "인스턴스 시작" 클릭
4. 설정:
   - **AMI**: Ubuntu 22.04 LTS
   - **인스턴스 타입**: t3.medium
   - **스토리지**: 20GB GP3
   - **보안 그룹**: 새로 생성
     - SSH (22): 0.0.0.0/0
     - HTTP (80): 0.0.0.0/0
     - HTTPS (443): 0.0.0.0/0
     - Custom TCP (3004): 0.0.0.0/0

### 2. 서버 접속 및 초기 설정
```bash
# SSH 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 설치
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PM2 설치
sudo npm install -g pm2

# Nginx 설치
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. 프로젝트 배포
```bash
# 프로젝트 클론
cd /home/ubuntu
git clone https://github.com/your-username/jeju20250623.git
cd jeju20250623/backend

# 환경변수 설정
sudo nano .env
# 실제 값으로 환경변수 입력

# 의존성 설치 및 빌드
npm install
npm run build

# 데이터베이스 설정
sudo -u postgres psql
CREATE USER jeju_user WITH PASSWORD 'your_password';
CREATE DATABASE jeju_db OWNER jeju_user;
GRANT ALL PRIVILEGES ON DATABASE jeju_db TO jeju_user;
\q

# 마이그레이션 실행
npx prisma migrate deploy

# PM2로 서버 실행
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

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Nginx 설정
```bash
# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/jeju-backend

# 설정 내용 입력
server {
    listen 80;
    server_name your-ec2-ip;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# 설정 활성화
sudo ln -s /etc/nginx/sites-available/jeju-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 백엔드 테스트
```bash
# API 테스트
curl http://your-ec2-ip/health
curl http://your-ec2-ip/posts
```

---

## 🌐 2단계: Vercel 프론트엔드 배포

### 1. Vercel CLI 설치 및 로그인
```bash
npm install -g vercel
vercel login
```

### 2. 프론트엔드 환경변수 업데이트
```bash
cd jeju20250623/frontend

# env.local 파일 수정
nano env.local

# API URL을 EC2 IP로 변경
NEXT_PUBLIC_API_URL="http://your-ec2-ip"
NEXT_PUBLIC_WS_URL="ws://your-ec2-ip"
```

### 3. Vercel 배포
```bash
# 배포 실행
vercel --prod

# 또는 GitHub 연동 후 자동 배포
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### 4. Vercel 환경변수 설정
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 다음 환경변수 추가:
   ```
   NEXT_PUBLIC_API_URL=http://your-ec2-ip
   NEXT_PUBLIC_WS_URL=ws://your-ec2-ip
   NEXT_PUBLIC_FIREBASE_API_KEY=실제_값
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=실제_값
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=실제_값
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=실제_값
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=실제_값
   NEXT_PUBLIC_FIREBASE_APP_ID=실제_값
   NEXT_PUBLIC_AWS_REGION=ap-northeast-2
   NEXT_PUBLIC_AWS_S3_BUCKET_NAME=jeju-sns-images
   NEXT_PUBLIC_APP_NAME=제주 SNS
   NEXT_PUBLIC_APP_VERSION=1.0.0
   NODE_ENV=production
   ```

---

## 🧪 3단계: 연동 테스트

### 1. 백엔드 API 테스트
```bash
# 헬스체크
curl http://your-ec2-ip/health

# 게시글 목록
curl http://your-ec2-ip/posts

# 인증 테스트
curl -X POST http://your-ec2-ip/auth/test-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### 2. 프론트엔드 테스트
1. Vercel 배포 URL 접속
2. 홈페이지 로딩 확인
3. 로그인/회원가입 테스트
4. 게시글 작성/조회 테스트
5. 댓글 기능 테스트

### 3. 크로스 플랫폼 테스트
1. 웹 브라우저에서 테스트
2. 모바일 브라우저에서 테스트
3. API 응답 시간 확인

---

## 🔧 문제 해결

### 백엔드 문제
```bash
# PM2 로그 확인
pm2 logs jeju-backend

# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log

# 포트 확인
sudo netstat -tlnp | grep :3004
```

### 프론트엔드 문제
1. Vercel 빌드 로그 확인
2. 브라우저 개발자 도구 확인
3. 환경변수 재확인

### 연동 문제
1. CORS 설정 확인
2. API URL 정확성 확인
3. 네트워크 연결 확인

---

## ✅ 배포 완료 체크리스트

- [ ] EC2 인스턴스 생성 및 설정
- [ ] 백엔드 서버 배포 및 실행
- [ ] 데이터베이스 설정 및 마이그레이션
- [ ] Nginx 설정 및 활성화
- [ ] Vercel 프론트엔드 배포
- [ ] 환경변수 설정
- [ ] API 연동 테스트
- [ ] 기능 테스트 완료

---

## 🎉 배포 완료!

이제 제주 SNS가 온라인에서 정상적으로 작동합니다!

**백엔드**: http://your-ec2-ip  
**프론트엔드**: https://your-vercel-url.vercel.app

다음 단계:
1. 도메인 연결
2. SSL 인증서 설정
3. 모니터링 설정
4. 모바일 앱 배포 