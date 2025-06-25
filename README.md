# 제주(Jeju) SNS 프로젝트

## 프로젝트 개요
제주도 지역 정보에 특화된 트위터 형식의 마이크로블로깅 소셜 미디어 플랫폼

## 핵심 기능
- 로그인 없이 모든 정보 열람 가능
- 인증된 사용자는 간편하게 글 작성 및 사진 업로드
- 의미 기반 검색 (AWS OpenSearch 활용)
- Public API 제공
- 소셜 로그인 (구글, 네이버, 카카오)

## 기술 스택
- **프론트엔드**: Next.js (React)
- **백엔드**: NestJS (Node.js)
- **데이터베이스**: PostgreSQL
- **검색 엔진**: AWS OpenSearch
- **파일 저장소**: AWS S3
- **인증**: Firebase Auth

## 폴더 구조
```
jeju20250623/
├── backend/      # 백엔드 API 서버 (NestJS)
├── frontend/     # 프론트엔드 웹앱 (Next.js)
└── docs/         # 기획/설계 문서
```

## 시작 방법
각 폴더의 README 참고

## 개발 로드맵
1. **Phase 1 (MVP)**: 기본 회원가입/로그인, 글쓰기/읽기, 사진 업로드
2. **Phase 2**: 소셜 로그인, Public API, UI/UX 개선
3. **Phase 3**: 의미 검색, 광고 시스템, 서비스 안정화 