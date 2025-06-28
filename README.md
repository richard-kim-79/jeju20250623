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
