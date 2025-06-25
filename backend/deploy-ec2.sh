#!/bin/bash

echo "🚀 AWS EC2 백엔드 서버 배포 스크립트"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. 배포 전 체크
print_step "배포 전 체크 중..."

# 빌드 파일 확인
if [ ! -d "dist" ]; then
    print_warning "빌드 파일이 없습니다. 빌드를 시작합니다..."
    npm run build
fi

# 환경변수 파일 확인
if [ ! -f ".env" ]; then
    print_error ".env 파일이 없습니다!"
    echo "env.example을 참고하여 .env 파일을 생성하세요."
    exit 1
fi

print_success "배포 전 체크 완료!"

# 2. 배포 가이드 출력
print_step "AWS EC2 배포 가이드"
echo ""
echo "📚 다음 단계를 따라 AWS EC2에 배포하세요:"
echo ""
echo "1️⃣ AWS EC2 인스턴스 생성:"
echo "   - 인스턴스 타입: t3.medium (2vCPU, 4GB RAM)"
echo "   - OS: Ubuntu 22.04 LTS"
echo "   - 스토리지: 20GB GP3"
echo "   - 보안 그룹: HTTP(80), HTTPS(443), SSH(22), Custom(3004)"
echo ""
echo "2️⃣ 서버 초기 설정:"
echo "   - 시스템 업데이트"
echo "   - Node.js v18 LTS 설치"
echo "   - PostgreSQL 설치"
echo "   - PM2 설치"
echo "   - Nginx 설치"
echo ""
echo "3️⃣ 프로젝트 배포:"
echo "   - Git에서 프로젝트 클론"
echo "   - 환경변수 설정"
echo "   - 의존성 설치 및 빌드"
echo "   - 데이터베이스 설정"
echo "   - PM2로 서버 실행"
echo ""
echo "4️⃣ Nginx 설정:"
echo "   - 리버스 프록시 설정"
echo "   - SSL 인증서 설정 (선택사항)"
echo ""
echo "📖 자세한 가이드는 aws-ec2-deployment.md를 참고하세요."
echo ""

# 3. 환경변수 템플릿 생성
print_step "환경변수 템플릿 생성"
cat > .env.production.template << EOF
# 데이터베이스 설정
DATABASE_URL="postgresql://jeju_user:your_password@localhost:5432/jeju_db"

# JWT 설정
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"

# 서버 설정
PORT=3004
NODE_ENV=production

# AWS 설정
AWS_ACCESS_KEY_ID="your_aws_access_key_id"
AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"
AWS_REGION="ap-northeast-2"
AWS_S3_BUCKET_NAME="jeju-sns-images"

# Firebase 설정
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_firebase_private_key\n-----END PRIVATE KEY-----\n"

# CORS 설정
CORS_ORIGIN="https://frontend-6957hpiip-bluewhale2025.vercel.app,http://localhost:3000"

# API 키 설정
API_KEY_SECRET="your_api_key_secret"

# 로그 설정
LOG_LEVEL="info"
EOF

print_success "환경변수 템플릿이 생성되었습니다: .env.production.template"

# 4. PM2 설정 파일 생성
print_step "PM2 설정 파일 생성"
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
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

print_success "PM2 설정 파일이 생성되었습니다: ecosystem.config.js"

# 5. Nginx 설정 템플릿 생성
print_step "Nginx 설정 템플릿 생성"
mkdir -p nginx-config
cat > nginx-config/jeju-backend << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 로그 설정
    access_log /var/log/nginx/jeju-backend-access.log;
    error_log /var/log/nginx/jeju-backend-error.log;

    # API 프록시
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
        
        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 헬스 체크
    location /health {
        proxy_pass http://localhost:3004/health;
        access_log off;
    }
}
EOF

print_success "Nginx 설정 템플릿이 생성되었습니다: nginx-config/jeju-backend"

# 6. 배포 체크리스트 출력
print_step "배포 체크리스트"
echo ""
echo "📋 배포 전 확인사항:"
echo "   □ AWS EC2 인스턴스 생성 완료"
echo "   □ 키 페어 다운로드 완료"
echo "   □ 보안 그룹 설정 완료"
echo "   □ .env.production.template 파일 확인"
echo "   □ 데이터베이스 연결 정보 확인"
echo "   □ AWS S3 버킷 생성 완료"
echo "   □ Firebase 프로젝트 설정 완료"
echo "   □ 도메인 준비 (선택사항)"
echo ""
echo "📋 배포 후 확인사항:"
echo "   □ 서버 접속 가능"
echo "   □ Node.js 설치 확인"
echo "   □ PostgreSQL 설치 확인"
echo "   □ 프로젝트 클론 완료"
echo "   □ 환경변수 설정 완료"
echo "   □ 의존성 설치 완료"
echo "   □ 빌드 완료"
echo "   □ 데이터베이스 마이그레이션 완료"
echo "   □ PM2 서버 실행 확인"
echo "   □ Nginx 설정 완료"
echo "   □ API 응답 확인"
echo ""

print_success "배포 준비가 완료되었습니다!"
print_warning "AWS EC2 인스턴스를 생성하고 위의 단계를 따라 배포하세요." 