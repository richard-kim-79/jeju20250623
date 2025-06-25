#!/bin/bash

# 제주 SNS 프로젝트 환경변수 설정 스크립트

echo "🚀 제주 SNS 프로젝트 환경변수 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수: 성공 메시지 출력
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 경고 메시지 출력
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 함수: 에러 메시지 출력
error() {
    echo -e "${RED}❌ $1${NC}"
}

# 함수: 정보 메시지 출력
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 백엔드 환경변수 설정
echo ""
info "백엔드 환경변수 설정 중..."
if [ -f "backend/env.local" ]; then
    cp backend/env.local backend/.env
    success "백엔드 환경변수 파일이 생성되었습니다."
else
    error "backend/env.local 파일을 찾을 수 없습니다."
    exit 1
fi

# 프론트엔드 환경변수 설정
echo ""
info "프론트엔드 환경변수 설정 중..."
if [ -f "frontend/env.local" ]; then
    cp frontend/env.local frontend/.env.local
    success "프론트엔드 환경변수 파일이 생성되었습니다."
else
    error "frontend/env.local 파일을 찾을 수 없습니다."
    exit 1
fi

# 모바일 앱 환경변수 설정
echo ""
info "모바일 앱 환경변수 설정 중..."
if [ -f "jeju-mobile/env.local" ]; then
    cp jeju-mobile/env.local jeju-mobile/.env
    success "모바일 앱 환경변수 파일이 생성되었습니다."
else
    error "jeju-mobile/env.local 파일을 찾을 수 없습니다."
    exit 1
fi

# 환경변수 파일 확인
echo ""
info "생성된 환경변수 파일 확인 중..."
ENV_FILES=$(find . -name ".env*" -type f)
if [ -n "$ENV_FILES" ]; then
    success "다음 환경변수 파일들이 생성되었습니다:"
    echo "$ENV_FILES" | while read file; do
        echo "  - $file"
    done
else
    warning "환경변수 파일이 생성되지 않았습니다."
fi

# 보안 경고
echo ""
warning "⚠️  보안 주의사항:"
echo "  - .env 파일들은 절대 Git에 커밋하지 마세요"
echo "  - 실제 프로덕션 환경에서는 환경변수 관리 서비스를 사용하세요"
echo "  - JWT_SECRET과 API 키는 정기적으로 변경하세요"

# 다음 단계 안내
echo ""
info "🎯 다음 단계:"
echo "  1. 각 .env 파일에서 실제 값으로 변경하세요"
echo "  2. PostgreSQL 데이터베이스를 설정하세요"
echo "  3. AWS S3와 Firebase 설정을 완료하세요"
echo "  4. 서버를 실행하여 테스트하세요"

echo ""
success "환경변수 설정이 완료되었습니다! 🎉" 