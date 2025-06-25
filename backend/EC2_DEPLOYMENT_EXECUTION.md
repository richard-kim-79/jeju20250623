# 🚀 AWS EC2 백엔드 배포 실행 가이드

## 📋 사전 준비사항

### 1. AWS 계정 및 권한
- [ ] AWS 계정 생성
- [ ] EC2, RDS, S3, IAM 권한 설정
- [ ] 키 페어 생성 (SSH 접속용)

### 2. 필요한 정보
- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key
- [ ] Firebase 프로젝트 설정
- [ ] 도메인 (선택사항)

## 🔧 1단계: AWS EC2 인스턴스 생성

### 1.1 EC2 콘솔 접속
1. AWS 콘솔 로그인
2. EC2 서비스 선택
3. "인스턴스 시작" 클릭

### 1.2 인스턴스 설정
```
이름: jeju-backend-server
AMI: Ubuntu Server 22.04 LTS
인스턴스 타입: t3.medium (2vCPU, 4GB RAM)
키 페어: 기존 키 페어 선택 또는 새로 생성
보안 그룹: 새 보안 그룹 생성
```

### 1.3 보안 그룹 설정
```
보안 그룹 이름: jeju-backend-sg
설명: 제주 SNS 백엔드 서버

인바운드 규칙:
- SSH (22): 0.0.0.0/0
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom TCP (3004): 0.0.0.0/0
```

### 1.4 스토리지 설정
```
크기: 20GB
볼륨 타입: GP3
```

## 🛠️ 2단계: 서버 초기 설정

### 2.1 서버 접속
```bash
# 키 페어 권한 설정
chmod 400 your-key.pem

# 서버 접속
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 2.2 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Node.js 설치 (v18 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node --version  # v18.x.x
npm --version   # 9.x.x
```

### 2.4 PostgreSQL 설치
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.5 PM2 설치
```bash
sudo npm install -g pm2
```

### 2.6 Nginx 설치
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 📁 3단계: 프로젝트 배포

### 3.1 프로젝트 클론
```bash
cd /home/ubuntu
git clone https://github.com/your-username/jeju20250623.git
cd jeju20250623/backend
```

### 3.2 환경변수 설정
```bash
# 환경변수 파일 생성
cp .env.production.template .env
nano .env

# 실제 값으로 교체:
# - DATABASE_URL
# - JWT_SECRET
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - FIREBASE_PROJECT_ID
# - FIREBASE_CLIENT_EMAIL
# - FIREBASE_PRIVATE_KEY
# - API_KEY_SECRET
```

### 3.3 의존성 설치 및 빌드
```bash
npm install
npm run build
```

### 3.4 데이터베이스 설정
```bash
# PostgreSQL 사용자 생성
sudo -u postgres psql

# PostgreSQL에서 실행:
CREATE USER jeju_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE jeju_db OWNER jeju_user;
GRANT ALL PRIVILEGES ON DATABASE jeju_db TO jeju_user;
\q

# 마이그레이션 실행
npx prisma migrate deploy
```

### 3.5 PM2로 서버 실행
```bash
# 로그 디렉토리 생성
mkdir -p logs

# 서버 시작
pm2 start ecosystem.config.js

# PM2 설정 저장
pm2 save

# 시스템 부팅 시 자동 시작
pm2 startup
# 위 명령어로 출력된 명령어를 복사하여 실행
```

## 🌐 4단계: Nginx 설정

### 4.1 Nginx 설정 파일 복사
```bash
sudo cp nginx-config/jeju-backend /etc/nginx/sites-available/
```

### 4.2 도메인 설정 (실제 도메인이 있는 경우)
```bash
sudo nano /etc/nginx/sites-available/jeju-backend
# server_name을 실제 도메인으로 변경
```

### 4.3 설정 활성화
```bash
sudo ln -s /etc/nginx/sites-available/jeju-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 5단계: SSL 인증서 설정 (선택사항)

### 5.1 Certbot 설치
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 SSL 인증서 발급
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 📊 6단계: 모니터링 및 테스트

### 6.1 서버 상태 확인
```bash
# PM2 상태 확인
pm2 status
pm2 monit

# Nginx 상태 확인
sudo systemctl status nginx

# PostgreSQL 상태 확인
sudo systemctl status postgresql
```

### 6.2 API 테스트
```bash
# 헬스 체크
curl http://localhost:3004/health

# API 테스트
curl http://localhost:3004/posts
```

### 6.3 로그 확인
```bash
# PM2 로그
pm2 logs jeju-backend

# Nginx 로그
sudo tail -f /var/log/nginx/jeju-backend-access.log
sudo tail -f /var/log/nginx/jeju-backend-error.log
```

## 🔧 7단계: 프론트엔드 연동

### 7.1 프론트엔드 환경변수 업데이트
프론트엔드의 `NEXT_PUBLIC_API_URL`을 백엔드 서버 URL로 변경:

```bash
# Vercel 대시보드에서 환경변수 설정
NEXT_PUBLIC_API_URL=https://your-domain.com
# 또는
NEXT_PUBLIC_API_URL=http://your-ec2-public-ip:3004
```

### 7.2 CORS 설정 확인
백엔드 `.env` 파일의 `CORS_ORIGIN`에 프론트엔드 URL이 포함되어 있는지 확인:

```
CORS_ORIGIN="https://frontend-6957hpiip-bluewhale2025.vercel.app,http://localhost:3000"
```

## 📞 문제 해결

### 서버 접속 문제
```bash
# SSH 연결 확인
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# 보안 그룹 확인
# AWS 콘솔에서 인바운드 규칙 확인
```

### PM2 문제
```bash
# PM2 재시작
pm2 restart jeju-backend

# 로그 확인
pm2 logs jeju-backend

# PM2 삭제 후 재시작
pm2 delete jeju-backend
pm2 start ecosystem.config.js
```

### Nginx 문제
```bash
# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### 데이터베이스 문제
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# PostgreSQL 재시작
sudo systemctl restart postgresql

# 연결 테스트
psql -h localhost -U jeju_user -d jeju_db
```

## ✅ 배포 완료 체크리스트

- [ ] EC2 인스턴스 생성 및 접속 가능
- [ ] Node.js v18 설치 완료
- [ ] PostgreSQL 설치 및 설정 완료
- [ ] 프로젝트 클론 완료
- [ ] 환경변수 설정 완료
- [ ] 의존성 설치 및 빌드 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] PM2 서버 실행 확인
- [ ] Nginx 설정 완료
- [ ] API 응답 확인
- [ ] 프론트엔드 연동 확인
- [ ] SSL 인증서 설정 (선택사항)

---

**배포 완료 후**: 프론트엔드에서 백엔드 API를 정상적으로 호출할 수 있어야 합니다. 