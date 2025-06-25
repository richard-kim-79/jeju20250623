# 제주 모바일 앱

제주 지역 정보 공유 SNS의 React Native 모바일 앱입니다.

## 📱 주요 기능

### 🔐 인증 시스템
- 이메일/비밀번호 로그인
- 회원가입
- 소셜 로그인 (Google)
- JWT 토큰 기반 인증
- 자동 로그인 유지

### 📝 게시글 관리
- 게시글 목록 조회
- 게시글 상세 보기
- 게시글 작성 (제목, 내용, 위치, 사진)
- 좋아요 기능
- 댓글 시스템 (예정)

### 🔍 검색 기능
- 기본 검색
- 고급 검색 (카테고리, 위치, 태그, 날짜)
- 검색어 제안
- 인기 검색어
- 관련 게시글 추천

### 🔔 실시간 알림
- WebSocket 기반 실시간 알림
- 좋아요 알림
- 댓글 알림
- 알림 읽음 처리

### 🔑 API 키 관리
- API 키 발급
- API 키 목록 조회
- API 키 폐기

### 📍 위치 기반 기능
- 현재 위치 기반 게시글 필터링
- 위치 정보 표시

## 🛠 기술 스택

- **프레임워크**: React Native (Expo)
- **언어**: TypeScript
- **네비게이션**: React Navigation
- **상태 관리**: React Context API
- **HTTP 클라이언트**: Axios
- **로컬 저장소**: AsyncStorage
- **아이콘**: Expo Vector Icons
- **이미지**: Expo Image Picker
- **위치**: Expo Location
- **알림**: Expo Notifications
- **실시간 통신**: Socket.io Client

## 📱 화면 구성

### 인증 화면
- **로그인**: 이메일/비밀번호 입력, 소셜 로그인
- **회원가입**: 사용자 정보 입력, 비밀번호 확인

### 메인 화면
- **홈**: 게시글 목록, 좋아요, 새로고침
- **검색**: 검색어 입력, 필터링 옵션
- **글쓰기**: 제목, 내용, 위치, 사진 업로드
- **프로필**: 사용자 정보, 설정, 로그아웃

### 상세 화면
- **게시글 상세**: 전체 내용, 댓글, 좋아요
- **알림**: 알림 목록, 읽음 처리

## 🚀 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm start
```

### 3. 플랫폼별 실행
```bash
# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web
```

### 4. Expo Go 앱으로 테스트
1. Expo Go 앱 설치 (iOS/Android)
2. QR 코드 스캔
3. 앱 실행

## 📁 프로젝트 구조

```
src/
├── contexts/          # React Context
│   └── AuthContext.tsx
├── screens/           # 화면 컴포넌트
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── SignupScreen.tsx
│   ├── SearchScreen.tsx
│   ├── WriteScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── PostDetailScreen.tsx
│   └── NotificationsScreen.tsx
├── services/          # API 서비스
│   └── api.ts
└── types/             # TypeScript 타입 정의
    └── index.ts
```

## 🔧 환경 설정

### 백엔드 서버 연결
`src/services/api.ts`에서 API_BASE_URL을 설정하세요:
```typescript
const API_BASE_URL = 'http://localhost:3000'; // 개발 환경
// const API_BASE_URL = 'https://your-production-server.com'; // 프로덕션 환경
```

### 환경 변수
`.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:
```
API_BASE_URL=http://localhost:3000
```

## 📱 앱 빌드

### Expo EAS Build
```bash
# EAS CLI 설치
npm install -g @expo/eas-cli

# 로그인
eas login

# 빌드 설정
eas build:configure

# iOS 빌드
eas build --platform ios

# Android 빌드
eas build --platform android
```

### 로컬 빌드
```bash
# Expo 개발 빌드
expo run:ios
expo run:android
```

## 🔍 디버깅

### React Native Debugger
```bash
# React Native Debugger 설치
brew install --cask react-native-debugger

# 실행
open "rndebugger://set-debugger-loc?host=localhost&port=19000"
```

### Flipper
Flipper를 사용하여 네트워크, 로그, 성능을 모니터링할 수 있습니다.

## 📊 성능 최적화

- React.memo를 사용한 컴포넌트 메모이제이션
- FlatList의 getItemLayout 최적화
- 이미지 lazy loading
- 네트워크 요청 캐싱

## 🔒 보안

- JWT 토큰 자동 갱신
- 민감한 정보 암호화 저장
- API 요청 인터셉터를 통한 에러 처리
- 입력값 검증

## 📈 모니터링

- 에러 추적 (Sentry 연동 예정)
- 성능 모니터링
- 사용자 행동 분석

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문제가 있거나 질문이 있으시면 이슈를 생성해주세요. 