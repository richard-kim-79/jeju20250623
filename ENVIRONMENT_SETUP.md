# 환경변수 설정 가이드

제주 SNS 프로젝트의 환경변수 설정 방법을 안내합니다.

## 📁 환경변수 파일 구조

```
jeju20250623/
├── backend/
│   ├── env.example      # 백엔드 환경변수 예시
│   └── env.local        # 백엔드 로컬 개발용 (실제 사용)
├── frontend/
│   ├── env.example      # 프론트엔드 환경변수 예시
│   └── env.local        # 프론트엔드 로컬 개발용 (실제 사용)
└── jeju-mobile/
    ├── env.example      # 모바일 앱 환경변수 예시
    └── env.local        # 모바일 앱 로컬 개발용 (실제 사용)
```

## 🚀 빠른 설정

### 1. 백엔드 설정
```bash
cd jeju20250623/backend
cp env.local .env
```

### 2. 프론트엔드 설정
```bash
cd jeju20250623/frontend
cp env.local .env.local
```

### 3. 모바일 앱 설정
```bash
cd jeju20250623/jeju-mobile
cp env.local .env
```

## 🔧 상세 설정

### 백엔드 환경변수

#### 필수 설정
- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 문자열
- `JWT_SECRET`: JWT 토큰 서명용 비밀키
- `PORT`: 서버 포트 (기본값: 3000)

#### 선택적 설정
- `AWS_*`: AWS S3 이미지 업로드용
- `FIREBASE_*`: Firebase 소셜 로그인용
- `ELASTICSEARCH_*`: Elasticsearch 고급 검색용

### 프론트엔드 환경변수

#### 필수 설정
- `NEXT_PUBLIC_API_URL`: 백엔드 API 서버 URL
- `NEXT_PUBLIC_WS_URL`: WebSocket 서버 URL

#### 선택적 설정
- `NEXT_PUBLIC_FIREBASE_*`: Firebase 클라이언트 설정
- `NEXT_PUBLIC_AWS_*`: AWS S3 클라이언트 설정

### 모바일 앱 환경변수

#### 필수 설정
- `EXPO_PUBLIC_API_URL`: 백엔드 API 서버 URL
- `EXPO_PUBLIC_WS_URL`: WebSocket 서버 URL

#### 선택적 설정
- `EXPO_PUBLIC_FIREBASE_*`: Firebase 클라이언트 설정
- `EXPO_PUBLIC_AWS_*`: AWS S3 클라이언트 설정

## 🔐 보안 주의사항

### 1. .env 파일 보안
- `.env` 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 `.env`가 포함되어 있는지 확인하세요
- 실제 프로덕션 환경에서는 환경변수 관리 서비스를 사용하세요

### 2. 비밀키 관리
- JWT_SECRET은 충분히 복잡하게 설정하세요 (최소 32자)
- AWS 키와 Firebase 키는 정기적으로 로테이션하세요
- 프로덕션 환경에서는 환경변수 관리 서비스를 사용하세요

### 3. CORS 설정
- 개발 환경: `http://localhost:3001,http://localhost:3002,http://localhost:8081`
- 프로덕션 환경: 실제 도메인만 허용

## 🛠 개발 환경 설정

### PostgreSQL 설정
```bash
# PostgreSQL 설치 (macOS)
brew install postgresql
brew services start postgresql

# 데이터베이스 생성
createdb jeju_db

# 사용자 생성 (선택사항)
createuser -P jeju_user
```

### Elasticsearch 설정 (선택사항)
```bash
# Docker로 Elasticsearch 실행
docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.11.0
```

## 🌐 프로덕션 환경 설정

### 1. 환경변수 관리
- AWS Systems Manager Parameter Store
- Azure Key Vault
- Google Cloud Secret Manager
- HashiCorp Vault

### 2. 데이터베이스 설정
- AWS RDS PostgreSQL
- Azure Database for PostgreSQL
- Google Cloud SQL

### 3. 파일 스토리지
- AWS S3
- Azure Blob Storage
- Google Cloud Storage

### 4. 인증 서비스
- Firebase Auth
- AWS Cognito
- Auth0

## 🔍 환경변수 검증

### 백엔드 검증
```bash
cd jeju20250623/backend
npm run start:dev
```

### 프론트엔드 검증
```bash
cd jeju20250623/frontend
npm run dev
```

### 모바일 앱 검증
```bash
cd jeju20250623/jeju-mobile
npm start
```

## ❗ 문제 해결

### 1. 환경변수가 로드되지 않는 경우
- 파일명이 정확한지 확인 (`.env`, `.env.local`)
- 파일 위치가 올바른지 확인
- 애플리케이션을 재시작

### 2. 데이터베이스 연결 오류
- PostgreSQL 서비스가 실행 중인지 확인
- 데이터베이스 URL 형식이 올바른지 확인
- 방화벽 설정 확인

### 3. CORS 오류
- CORS_ORIGIN에 클라이언트 URL이 포함되어 있는지 확인
- 프로토콜(http/https)이 일치하는지 확인

### 4. JWT 오류
- JWT_SECRET이 설정되어 있는지 확인
- 토큰 만료 시간이 적절한지 확인

## 📞 지원

환경변수 설정에 문제가 있으면 다음을 확인하세요:
1. 각 프로젝트의 README.md 파일
2. 공식 문서 (NestJS, Next.js, Expo)
3. GitHub Issues 