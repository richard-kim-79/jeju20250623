# 제주 - 제주 지역 정보 공유 SNS

제주 지역의 다양한 정보를 공유하고 소통하는 SNS 플랫폼입니다.

## 🚀 프로젝트 개요

- **목적**: 제주 지역 정보 공유 및 소통 플랫폼
- **특징**: 로그인 없이 글 읽기 가능, 로그인 시 글 작성 및 사진 업로드
- **기술 스택**: Next.js, NestJS, PostgreSQL, Prisma ORM, AWS S3, Firebase Auth, WebSocket, Elasticsearch, React Native

## 🔒 보안 기능

### 비밀번호 보안
- **해시화**: bcrypt를 사용한 안전한 비밀번호 해시화 (salt rounds: 12)
- **정책 검증**: 
  - 최소 8자 이상
  - 소문자 포함
  - 대문자 포함
  - 숫자 포함
  - 특수문자 포함 (!@#$%^&* 등)
- **실시간 검증**: 프론트엔드에서 실시간 비밀번호 정책 확인
- **비밀번호 변경**: 현재 비밀번호 확인 후 새 비밀번호로 변경

### 인증 보안
- **JWT 토큰**: 안전한 토큰 기반 인증
- **소셜 로그인**: Firebase Auth를 통한 안전한 소셜 인증
- **API 키 관리**: 개별 API 키 발급 및 폐기
- **세션 관리**: 자동 로그아웃 및 토큰 만료 처리

### 데이터 보안
- **CORS 설정**: 허용된 도메인에서만 API 접근
- **입력 검증**: 서버 측 데이터 검증 및 sanitization
- **SQL Injection 방지**: Prisma ORM 사용으로 자동 방지
- **XSS 방지**: 입력 데이터 이스케이프 처리

## 📋 핵심 기능

### 1순위 (완료 ✅)
- [x] 회원가입/로그인 API
- [x] 게시글 CRUD API
- [x] 기본 프론트엔드 UI
- [x] PostgreSQL 데이터베이스 연동
- [x] Prisma ORM 설정
- [x] 비밀번호 해시화 및 보안

### 2순위 (완료 ✅)
- [x] 프론트엔드 개발 (Next.js + Tailwind CSS)
- [x] 로그인/회원가입 페이지
- [x] 게시글 작성 페이지 (이미지 업로드 포함)
- [x] 메인 페이지 (게시글 목록)
- [x] 검색 기능 페이지
- [x] JWT 인증 시스템
- [x] CORS 설정
- [x] API 문서화 (Swagger)
- [x] 비밀번호 정책 검증 UI

### 3순위 (완료 ✅)
- [x] AWS S3 연동 (이미지 업로드)
- [x] API 키 발급 시스템
- [x] 의미 검색 (키워드 기반)
- [x] 광고 배너 시스템
- [x] 프로필 페이지 (API 키 관리)
- [x] 비밀번호 변경 기능

### 4순위 (완료 ✅)
- [x] 소셜 로그인 (Firebase Auth - Google)
- [x] 실시간 알림 (WebSocket)
- [x] 고급 검색 (Elasticsearch)
- [x] 모바일 앱 (React Native)
- [x] 모바일 앱 비밀번호 보안
- [x] 댓글 시스템 (웹 & 모바일)
- [ ] 수익화 시스템 고도화

## 🛠 기술 스택

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Firebase Auth
- **Documentation**: Swagger
- **File Upload**: AWS S3
- **Real-time**: WebSocket (Socket.io)
- **Search Engine**: Elasticsearch
- **Cloud**: AWS, Firebase

### Frontend (Web)
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, React Icons
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Authentication**: Firebase Auth
- **Real-time**: Socket.io Client

### Mobile App
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Local Storage**: AsyncStorage
- **Icons**: Expo Vector Icons
- **Image**: Expo Image Picker
- **Location**: Expo Location
- **Notifications**: Expo Notifications
- **Real-time**: Socket.io Client

## 🚀 실행 방법

### 백엔드 실행
```bash
cd jeju20250623/backend
npm install
npm run start:dev
```

### 프론트엔드 실행
```bash
cd jeju20250623/frontend
npm install
npm run dev
```

### 모바일 앱 실행
```bash
cd jeju20250623/jeju-mobile
npm install
npm start

# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web
```

### 데이터베이스 설정
```bash
cd jeju20250623/backend
npx prisma migrate dev
npx prisma generate
```

### Elasticsearch 설정 (선택사항)
```bash
# Docker로 Elasticsearch 실행
docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:8.11.0
```

## 📱 모바일 앱

### 주요 기능
- **인증 시스템**: 이메일/비밀번호 로그인, 회원가입, 소셜 로그인
- **게시글 관리**: 목록 조회, 상세 보기, 작성, 좋아요
- **검색 기능**: 기본 검색, 고급 검색, 검색어 제안
- **실시간 알림**: WebSocket 기반 알림, 읽음 처리
- **API 키 관리**: 발급, 조회, 폐기
- **위치 기반 기능**: 현재 위치 기반 필터링

### 화면 구성
- **인증 화면**: 로그인, 회원가입
- **메인 화면**: 홈, 검색, 글쓰기, 프로필
- **상세 화면**: 게시글 상세, 알림

### 실행 방법
1. Expo Go 앱 설치 (iOS/Android)
2. `npm start` 실행
3. QR 코드 스캔
4. 앱 실행

자세한 내용은 [모바일 앱 README](./jeju-mobile/README.md)를 참조하세요.

## 📚 API 문서

- **Swagger UI**: http://localhost:3000/api
- **API Base URL**: http://localhost:3000

### 주요 엔드포인트
- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/social-login` - 소셜 로그인 (Firebase ID 토큰)
- `GET /auth/profile` - 내 프로필 조회 (인증 필요)
- `POST /auth/profile` - 프로필 수정 (인증 필요)
- `POST /auth/change-password` - 비밀번호 변경 (인증 필요)
- `GET /posts` - 게시글 목록
- `GET /posts/search` - 게시글 검색
- `POST /posts` - 게시글 작성 (인증 필요)
- `POST /posts/:id/like` - 게시글 좋아요 (인증 필요)
- `GET /posts/:id` - 게시글 상세
- `DELETE /posts/:id` - 게시글 삭제 (인증 필요)
- `GET /notifications` - 내 알림 목록 (인증 필요)
- `GET /notifications/unread-count` - 읽지 않은 알림 개수 (인증 필요)
- `POST /notifications/:id/read` - 알림 읽음 처리 (인증 필요)
- `POST /notifications/mark-all-read` - 모든 알림 읽음 처리 (인증 필요)
- `DELETE /notifications/:id` - 알림 삭제 (인증 필요)
- `POST /api-keys` - API 키 발급 (인증 필요)
- `GET /api-keys` - 내 API 키 목록 (인증 필요)
- `DELETE /api-keys/:id` - API 키 폐기 (인증 필요)

### 고급 검색 API
- `GET /search/advanced` - 고급 검색
- `GET /search/suggestions` - 검색어 제안
- `GET /search/popular` - 인기 검색어
- `GET /search/related/:postId` - 관련 게시글
- `GET /search/facets` - 검색 패싯
- `GET /search/trending` - 트렌딩 게시글

### WebSocket 이벤트
- `join` - 사용자 룸 참가
- `markAsRead` - 알림 읽음 처리
- `markAllAsRead` - 모든 알림 읽음 처리
- `newNotification` - 새 알림 수신
- `notificationMarkedAsRead` - 알림 읽음 처리 응답
- `allNotificationsMarkedAsRead` - 모든 알림 읽음 처리 응답

## 🎨 화면 구성

### 메인 페이지
- 게시글 목록 표시
- 로그인 상태에 따른 글쓰기 버튼
- 게시글 좋아요, 댓글, 공유 기능
- 광고 배너 (상단, 중간, 하단)
- 실시간 알림 벨

### 로그인/회원가입
- 이메일, 비밀번호, 사용자명 입력
- Google 소셜 로그인
- 실시간 유효성 검사
- 에러 메시지 표시

### 게시글 작성
- 제목, 내용, 위치 입력
- 이미지 업로드 (AWS S3, 최대 5개)
- 실시간 미리보기

### 고급 검색 페이지
- 의미 기반 검색 (Elasticsearch)
- 다중 필터 (카테고리, 위치, 날짜, 태그)
- 검색어 제안 및 자동완성
- 인기 검색어 표시
- 검색 결과 하이라이팅
- 관련도 기반 정렬
- 검색 패싯 및 집계
- 페이지네이션

### 프로필 페이지
- API 키 발급/관리
- API 키 목록 조회
- API 키 폐기 기능
- 프로필 정보 수정

### 실시간 알림
- 알림 벨 아이콘 (읽지 않은 알림 개수 표시)
- 알림 드롭다운 목록
- 실시간 알림 수신
- 알림 읽음 처리
- 알림 삭제 기능

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- PostgreSQL 12+
- AWS 계정 (S3 사용)
- Firebase 계정 (Auth 사용)
- Elasticsearch 8.x (선택사항)
- npm 또는 yarn

### 🚀 빠른 환경변수 설정

#### 자동 설정 (권장)
```bash
# 프로젝트 루트에서 실행
./setup-env.sh
```

#### 수동 설정
```bash
# 백엔드
cd backend && cp env.local .env

# 프론트엔드
cd frontend && cp env.local .env.local

# 모바일 앱
cd jeju-mobile && cp env.local .env
```

### 환경 변수 설정

#### 백엔드 환경변수 (backend/.env)
```bash
# 데이터베이스 설정
DATABASE_URL="postgresql://username:password@localhost:5432/jeju_db"

# JWT 설정
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# 서버 설정
PORT=3000
NODE_ENV=development

# AWS S3 설정 (이미지 업로드용)
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="ap-northeast-2"
AWS_S3_BUCKET_NAME="jeju-sns-images"

# Firebase 설정 (소셜 로그인용)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase Private Key Here\n-----END PRIVATE KEY-----\n"

# Elasticsearch 설정 (고급 검색용, 선택사항)
ELASTICSEARCH_URL="http://localhost:9200"
ELASTICSEARCH_USERNAME="elastic"
ELASTICSEARCH_PASSWORD="changeme"

# CORS 설정
CORS_ORIGIN="http://localhost:3001,http://localhost:3002,http://localhost:8081"

# API 키 설정
API_KEY_SECRET="your-api-key-secret-here"
```

#### 프론트엔드 환경변수 (frontend/.env.local)
```bash
# API 서버 설정
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3000"

# Firebase 설정 (소셜 로그인용)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# AWS S3 설정 (클라이언트 측)
NEXT_PUBLIC_AWS_REGION="ap-northeast-2"
NEXT_PUBLIC_AWS_S3_BUCKET_NAME="jeju-sns-images"

# 앱 설정
NEXT_PUBLIC_APP_NAME="제주 SNS"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

#### 모바일 앱 환경변수 (jeju-mobile/.env)
```bash
# API 서버 설정
EXPO_PUBLIC_API_URL="http://localhost:3000"
EXPO_PUBLIC_WS_URL="ws://localhost:3000"

# Firebase 설정 (소셜 로그인용)
EXPO_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
EXPO_PUBLIC_FIREBASE_APP_ID="your-app-id"

# AWS S3 설정 (클라이언트 측)
EXPO_PUBLIC_AWS_REGION="ap-northeast-2"
EXPO_PUBLIC_AWS_S3_BUCKET_NAME="jeju-sns-images"

# 앱 설정
EXPO_PUBLIC_APP_NAME="제주 SNS"
EXPO_PUBLIC_APP_VERSION="1.0.0"
```

### 🔐 보안 주의사항
- `.env` 파일들은 절대 Git에 커밋하지 마세요
- 실제 프로덕션 환경에서는 환경변수 관리 서비스를 사용하세요
- JWT_SECRET과 API 키는 정기적으로 변경하세요
- 자세한 설정 방법은 [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)를 참조하세요

## 📁 프로젝트 구조

```
jeju20250623/
├── backend/                 # NestJS 백엔드
│   ├── src/
│   │   ├── auth/           # 인증 관련
│   │   ├── posts/          # 게시글 관련
│   │   ├── api-keys/       # API 키 관리
│   │   ├── notifications/  # 실시간 알림
│   │   ├── search/         # 고급 검색
│   │   ├── elasticsearch/  # Elasticsearch 연동
│   │   ├── s3/             # AWS S3 연동
│   │   ├── firebase/       # Firebase Auth
│   │   └── prisma.service.ts
│   ├── prisma/             # 데이터베이스 스키마
│   └── package.json
├── frontend/               # Next.js 프론트엔드
│   ├── app/               # 페이지 컴포넌트
│   │   ├── login/         # 로그인 페이지
│   │   ├── signup/        # 회원가입 페이지
│   │   ├── write/         # 게시글 작성 페이지
│   │   ├── search/        # 고급 검색 페이지
│   │   ├── profile/       # 프로필 페이지
│   │   └── components/    # 공통 컴포넌트
│   ├── lib/               # 유틸리티 라이브러리
│   │   ├── firebase.ts    # Firebase 설정
│   │   └── socket.ts      # WebSocket 클라이언트
│   └── package.json
└── README.md
```

## 🎯 주요 기능 상세

### 🔐 인증 시스템
- JWT 토큰 기반 인증
- Firebase Auth 소셜 로그인 (Google)
- 비밀번호 해시화 (bcrypt)
- 사용자명 중복 확인
- 토큰 만료 시간 설정

### 📝 게시글 시스템
- 제목, 내용, 위치 정보
- 다중 이미지 업로드 (AWS S3)
- 이미지 미리보기
- 게시글 수정/삭제 (작성자만)
- 게시글 좋아요 기능

### 🔍 고급 검색 시스템
- Elasticsearch 기반 의미 검색
- 한국어 동의어 및 유사어 지원
- 다중 필터 (카테고리, 위치, 날짜, 태그)
- 검색어 제안 및 자동완성
- 검색 결과 하이라이팅
- 관련도, 날짜, 인기순 정렬
- 검색 패싯 및 집계
- 관련 게시글 추천
- 인기 검색어 및 트렌딩 게시글

### 🔑 API 키 시스템
- API 키 발급/폐기
- 해시화된 키 저장
- 사용 이력 추적
- 보안 강화

### 📢 광고 시스템
- 다중 광고 배너
- 자동 광고 순환
- 클릭 추적
- 닫기 기능

### 🌐 소셜 로그인
- Google 로그인 지원
- Firebase Auth 연동
- 자동 계정 생성
- 프로필 이미지 연동

### 🔔 실시간 알림 시스템
- WebSocket 기반 실시간 통신
- 좋아요, 댓글, 팔로우 알림
- 시스템 알림
- 읽음 처리 및 삭제
- 실시간 알림 카운터

## 🎯 다음 단계

1. **모바일 앱**: React Native 개발
2. **수익화 고도화**: 광고 관리 시스템
3. **추가 소셜 로그인**: Kakao, Naver 지원
4. **댓글 시스템**: 실시간 댓글 기능
5. **추천 시스템**: 개인화된 콘텐츠 추천

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요. 