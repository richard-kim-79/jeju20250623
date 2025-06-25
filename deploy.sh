#!/bin/bash

echo "🚀 제주 SNS 프로젝트 배포 시작!"

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

# 1. Git 상태 확인
print_step "Git 상태 확인 중..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "커밋되지 않은 변경사항이 있습니다."
    read -p "계속 진행하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "배포가 취소되었습니다."
        exit 1
    fi
fi

# 2. 프론트엔드 배포
print_step "프론트엔드 배포 중..."
cd frontend
if command -v vercel &> /dev/null; then
    print_success "Vercel CLI가 설치되어 있습니다."
    echo "Vercel 배포를 시작합니다..."
    echo "터미널에서 배포 과정을 확인하세요."
    vercel --prod
else
    print_warning "Vercel CLI가 설치되어 있지 않습니다."
    echo "npm install -g vercel 명령으로 설치 후 다시 시도하세요."
fi

# 3. 백엔드 배포 준비
print_step "백엔드 배포 준비 중..."
cd ../backend

# 빌드 확인
if [ ! -d "dist" ]; then
    print_warning "빌드 파일이 없습니다. 빌드를 시작합니다..."
    npm run build
fi

# 환경변수 파일 확인
if [ ! -f ".env" ]; then
    print_error ".env 파일이 없습니다!"
    echo "backend/env.example을 참고하여 .env 파일을 생성하세요."
    exit 1
fi

print_success "백엔드 배포 준비 완료!"

# 4. 배포 가이드 출력
print_step "배포 가이드"
echo ""
echo "📚 다음 가이드를 참고하여 배포를 완료하세요:"
echo ""
echo "🌐 프론트엔드 (Vercel):"
echo "   - vercel-frontend-deployment.md"
echo ""
echo "🔧 백엔드 (AWS EC2):"
echo "   - aws-ec2-deployment.md"
echo ""
echo "📋 환경 설정:"
echo "   - ENVIRONMENT_SETUP.md"
echo ""
echo "🚀 배포 실행:"
echo "   - deployment-execution-guide.md"
echo ""

print_success "배포 준비가 완료되었습니다!"
print_warning "실제 서버 배포는 위의 가이드를 참고하여 수동으로 진행하세요." 