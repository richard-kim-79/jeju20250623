# 🚀 Vercel 프론트엔드 배포 가이드

## 📋 사전 준비사항

### 1. Vercel 계정
- [Vercel](https://vercel.com) 계정 생성
- GitHub 계정 연동

### 2. 프로젝트 준비
- GitHub에 프로젝트 업로드
- 환경변수 준비

## 🔧 Vercel 배포 설정

### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

### 2. Vercel 로그인
```bash
vercel login
```

### 3. 프로젝트 설정
```bash
cd jeju20250623/frontend
vercel
```

## ⚙️ 환경변수 설정

### 1. Vercel 대시보드에서 설정
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings → Environment Variables

### 2. 필수 환경변수
```bash
# API 서버 설정
NEXT_PUBLIC_API_URL=https://your-ec2-domain.com
NEXT_PUBLIC_WS_URL=wss://your-ec2-domain.com

# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=실제_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=실제_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=실제_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=실제_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=실제_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=실제_APP_ID

# AWS S3 설정
NEXT_PUBLIC_AWS_REGION=ap-northeast-2
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=jeju-sns-images

# 앱 설정
NEXT_PUBLIC_APP_NAME=제주 SNS
NEXT_PUBLIC_APP_VERSION=1.0.0

# 환경 설정
NODE_ENV=production
```

## 📁 배포 설정 파일

### 1. vercel.json 생성
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. next.config.ts 수정
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'your-s3-bucket.s3.ap-northeast-2.amazonaws.com'
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig
```

## 🚀 배포 실행

### 1. 로컬에서 배포 테스트
```bash
vercel --prod
```

### 2. GitHub 연동 배포
1. GitHub 저장소에 코드 푸시
2. Vercel에서 자동 배포 확인

### 3. 커스텀 도메인 설정 (선택사항)
1. Vercel 대시보드 → Domains
2. 도메인 추가
3. DNS 설정

## 🔧 API URL 업데이트

### 1. 프론트엔드 코드에서 API URL 수정
```typescript
// lib/api.ts 또는 각 컴포넌트에서
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-ec2-domain.com';
```

### 2. WebSocket URL 수정
```typescript
// lib/socket.ts
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://your-ec2-domain.com';
```

## 📊 배포 후 확인사항

### 1. 빌드 성공 확인
- Vercel 대시보드에서 빌드 로그 확인
- 에러가 없는지 확인

### 2. 기능 테스트
- 홈페이지 로딩 확인
- 로그인/회원가입 테스트
- 게시글 작성/조회 테스트
- 댓글 기능 테스트

### 3. API 연결 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인
- API 호출이 정상적으로 되는지 확인

## 🔄 자동 배포 설정

### 1. GitHub Actions 설정 (선택사항)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔧 문제 해결

### 1. 빌드 오류
```bash
# 로컬에서 빌드 테스트
npm run build
```

### 2. 환경변수 오류
- Vercel 대시보드에서 환경변수 재확인
- NEXT_PUBLIC_ 접두사 확인

### 3. API 연결 오류
- CORS 설정 확인
- EC2 보안 그룹 설정 확인
- API URL 정확성 확인

## 📞 지원

배포 중 문제가 발생하면:
1. Vercel 빌드 로그 확인
2. 브라우저 개발자 도구 확인
3. API 서버 상태 확인 