# 🚀 AWS 콘솔을 통한 EC2 인스턴스 수동 생성 가이드

## 📋 사전 준비사항

### 1. AWS 계정 정보
- **계정 ID**: 829734436121
- **사용자**: richard_bluewhale
- **지역**: ap-northeast-2 (서울)

### 2. 생성된 리소스
- **보안 그룹**: sg-019a614583b311cc2 (jeju-backend-sg)
- **키 페어**: bluewhale202507 (기존)

## 🔧 1단계: AWS 콘솔 접속

1. **AWS 콘솔 로그인**: https://console.aws.amazon.com
2. **지역 선택**: ap-northeast-2 (서울)
3. **EC2 서비스 선택**

## 🖥️ 2단계: EC2 인스턴스 생성

### 2.1 인스턴스 시작
1. **"인스턴스 시작"** 클릭
2. **"빠른 시작"** 선택

### 2.2 기본 설정
```
이름: jeju-backend-server
AMI: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
인스턴스 유형: t3.medium (2vCPU, 4GB RAM)
키 페어: bluewhale202507 (기존 키 페어 선택)
```

### 2.3 네트워크 설정
```
VPC: 기본 VPC 선택
서브넷: 기본 서브넷 선택
퍼블릭 IP: 활성화
보안 그룹: 기존 보안 그룹 선택
  - 보안 그룹 ID: sg-019a614583b311cc2
  - 보안 그룹 이름: jeju-backend-sg
```

### 2.4 스토리지 설정
```
크기: 20GB
볼륨 유형: GP3
```

### 2.5 고급 설정
```
자동 종료: 비활성화
모니터링: 기본 모니터링 활성화
```

### 2.6 인스턴스 시작
1. **"인스턴스 시작"** 클릭
2. **인스턴스 ID 기록** (예: i-1234567890abcdef0)

## 🔑 3단계: 키 페어 다운로드 (필요시)

기존 키 페어 `bluewhale202507`가 있다면 다운로드가 필요하지 않습니다.

## 🌐 4단계: 인스턴스 정보 확인

### 4.1 퍼블릭 IP 확인
1. EC2 대시보드에서 인스턴스 선택
2. **퍼블릭 IPv4 주소** 확인 (예: 13.124.xxx.xxx)

### 4.2 연결 테스트
```bash
# 키 페어 권한 설정 (필요시)
chmod 400 bluewhale202507.pem

# SSH 연결 테스트
ssh -i bluewhale202507.pem ubuntu@13.124.xxx.xxx
```

## 📁 5단계: 프로젝트 배포

### 5.1 서버 접속
```bash
ssh -i bluewhale202507.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 5.2 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### 5.3 Node.js 설치
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node --version
npm --version
```

### 5.4 PostgreSQL 설치
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 5.5 PM2 설치
```bash
sudo npm install -g pm2
```

### 5.6 Nginx 설치
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.7 프로젝트 클론
```bash
cd /home/ubuntu
git clone https://github.com/your-username/jeju20250623.git
cd jeju20250623/backend
```

### 5.8 환경변수 설정
```bash
# 환경변수 파일 생성
cp .env.production.template .env
nano .env

# 다음 값들을 실제 값으로 교체:
DATABASE_URL="postgresql://jeju_user:your_password@localhost:5432/jeju_db"
JWT_SECRET="your_jwt_secret_key_here"
AWS_ACCESS_KEY_ID="your_aws_access_key_id"
AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_firebase_private_key\n-----END PRIVATE KEY-----\n"
API_KEY_SECRET="your_api_key_secret"
```

### 5.9 의존성 설치 및 빌드
```bash
npm install
npm run build
```

### 5.10 데이터베이스 설정
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

### 5.11 PM2로 서버 실행
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

### 5.12 Nginx 설정
```bash
# Nginx 설정 파일 복사
sudo cp nginx-config/jeju-backend /etc/nginx/sites-available/

# 설정 활성화
sudo ln -s /etc/nginx/sites-available/jeju-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🧪 6단계: 배포 테스트

### 6.1 서버 상태 확인
```bash
# PM2 상태 확인
pm2 status

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

### 6.3 외부 접속 테스트
```bash
# 브라우저에서 테스트
http://YOUR_EC2_PUBLIC_IP:3004/health
http://YOUR_EC2_PUBLIC_IP:3004/posts
```

## 🔧 7단계: 프론트엔드 연동

### 7.1 Vercel 환경변수 업데이트
Vercel 대시보드에서 환경변수 설정:
```
NEXT_PUBLIC_API_URL=http://YOUR_EC2_PUBLIC_IP:3004
```

### 7.2 CORS 설정 확인
백엔드 `.env` 파일의 `CORS_ORIGIN`에 프론트엔드 URL이 포함되어 있는지 확인:
```
CORS_ORIGIN="https://frontend-6957hpiip-bluewhale2025.vercel.app,http://localhost:3000"
```

## 📊 8단계: 모니터링

### 8.1 PM2 모니터링
```bash
pm2 monit
```

### 8.2 로그 확인
```bash
# PM2 로그
pm2 logs jeju-backend

# Nginx 로그
sudo tail -f /var/log/nginx/jeju-backend-access.log
sudo tail -f /var/log/nginx/jeju-backend-error.log
```

## ✅ 배포 완료 체크리스트

- [ ] AWS 콘솔에서 EC2 인스턴스 생성 완료
- [ ] SSH 접속 가능
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

---

**배포 완료 후**: 프론트엔드에서 백엔드 API를 정상적으로 호출할 수 있어야 합니다. 