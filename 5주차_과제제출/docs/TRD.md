# NeuroLab — Technical Requirements Document (TRD)

## 1. 시스템 아키텍처

### 1.1 아키텍처 개요

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ React UI │  │ TensorFlow.js│  │  Canvas API   │  │
│  │ (Next.js)│  │ (MNIST 추론) │  │ (이미지 증강) │  │
│  └────┬─────┘  └──────────────┘  └───────────────┘  │
│       │                                              │
└───────┼──────────────────────────────────────────────┘
        │ HTTPS
┌───────┼──────────────────────────────────────────────┐
│       ▼         Vercel (Serverless)                  │
│  ┌─────────┐  ┌───────────┐  ┌────────────────────┐ │
│  │ Next.js │  │ NextAuth  │  │ Polar.sh Checkout  │ │
│  │ App     │  │ (Google   │  │ & Webhook Handler  │ │
│  │ Router  │  │  OAuth)   │  │                    │ │
│  └────┬────┘  └─────┬─────┘  └────────┬───────────┘ │
│       │             │                  │             │
└───────┼─────────────┼──────────────────┼─────────────┘
        │             │                  │
   ┌────▼────┐   ┌────▼────┐   ┌────────▼───────┐
   │  Neon   │   │ Google  │   │   Polar.sh     │
   │PostgreSQL│   │  OAuth  │   │  Payment API   │
   │ (Cloud) │   │  Server │   │  (Sandbox)     │
   └─────────┘   └─────────┘   └────────────────┘
```

### 1.2 핵심 설계 원칙
- **서버리스 퍼스트:** Vercel Serverless Functions으로 백엔드 로직 실행
- **브라우저 추론:** ML 모델은 TensorFlow.js로 클라이언트에서 실행 (서버 GPU 불필요)
- **어댑터 패턴:** Prisma + Neon Serverless Adapter로 DB 연결 (커넥션 풀링 자동)

---

## 2. 기술 스택

### 2.1 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.2.3 | App Router 기반 풀스택 프레임워크 |
| React | 19.2.4 | UI 라이브러리 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 4.x | 유틸리티 기반 스타일링 |
| TensorFlow.js | 4.22.0 | 브라우저 ML 추론 (MNIST CNN) |
| Recharts | 3.x | 인터랙티브 차트 (학습 시각화) |

### 2.2 백엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| NextAuth.js | 4.24.13 | Google OAuth 인증 + JWT 세션 |
| Prisma ORM | 7.7.0 | 타입 안전 DB 쿼리 + 마이그레이션 |
| @prisma/adapter-neon | 7.7.0 | Neon Serverless DB 어댑터 |
| @polar-sh/nextjs | 0.9.5 | Polar 결제 Checkout + Webhook |
| @polar-sh/sdk | 0.47.0 | Polar API 클라이언트 |

### 2.3 인프라

| 기술 | 용도 |
|------|------|
| Vercel | 서버리스 배포, CDN, 자동 HTTPS |
| Neon PostgreSQL | 서버리스 클라우드 DB (auto-scaling, connection pooling) |
| GitHub | 소스 코드 관리, Vercel 자동 배포 트리거 |

---

## 3. 프로젝트 구조

```
src/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # 랜딩 페이지
│   ├── layout.tsx                    # 루트 레이아웃 (AuthProvider)
│   ├── globals.css                   # 전역 스타일
│   ├── not-found.tsx                 # 404 페이지
│   ├── (auth)/
│   │   └── login/page.tsx            # 로그인 페이지
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # 대시보드 (결제 내역)
│   │   │   └── loading.tsx           # 스켈레톤 로딩
│   │   ├── products/
│   │   │   ├── page.tsx              # 상품 목록
│   │   │   └── loading.tsx           # 스켈레톤 로딩
│   │   └── demo/
│   │       ├── page.tsx              # AI 체험 허브
│   │       ├── handwriting/page.tsx  # CNN 손글씨 인식
│   │       ├── augmentation/page.tsx # 이미지 증강
│   │       └── training/page.tsx     # 학습 시각화
│   ├── checkout/
│   │   └── success/page.tsx          # 결제 완료
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth 엔드포인트
│       ├── checkout/route.ts            # Polar Checkout 핸들러
│       ├── webhook/polar/route.ts       # Polar Webhook 수신
│       └── access/route.ts             # 결제 여부 확인 API
├── components/
│   ├── ui/
│   │   ├── Navbar.tsx                # 공통 네비게이션 (로그인 상태 반영)
│   │   └── Footer.tsx                # 공통 푸터
│   ├── auth/
│   │   ├── AuthProvider.tsx          # NextAuth SessionProvider 래퍼
│   │   ├── LoginButton.tsx           # Google 로그인 버튼
│   │   ├── LogoutButton.tsx          # 로그아웃 버튼
│   │   └── UserProfile.tsx           # 프로필 사진 + 이름 표시
│   ├── payment/
│   │   └── ProductCard.tsx           # 상품 카드 + 결제 버튼
│   └── ai/
│       ├── HandwritingCanvas.tsx     # Canvas 그리기 + TF.js 추론
│       ├── AugmentationGrid.tsx      # 이미지 업로드 + 9개 변환
│       ├── TrainingChart.tsx         # Recharts 학습 곡선 3종
│       └── PaidFeatureGate.tsx       # 유/무료 접근 제어
├── lib/
│   ├── auth.ts                       # NextAuth 설정
│   ├── prisma.ts                     # Prisma 클라이언트 싱글톤
│   ├── polar.ts                      # Polar SDK 초기화
│   ├── training-data.ts              # 사전 계산된 학습 메트릭
│   └── utils.ts                      # 유틸리티 함수
├── proxy.ts                          # 라우트 보호 미들웨어
├── types/
│   ├── index.ts                      # 공통 타입 정의
│   └── next-auth.d.ts                # NextAuth 세션 타입 확장
└── generated/prisma/                 # Prisma 자동 생성 클라이언트

prisma/
├── schema.prisma                     # DB 스키마 정의
├── migrations/                       # 마이그레이션 파일
└── prisma.config.ts                  # Prisma 데이터소스 설정

public/models/mnist/
├── model.json                        # TF.js 모델 토폴로지
└── weights.bin                       # 모델 가중치 (227KB)

scripts/
├── train_mnist.mjs                   # MNIST CNN 학습 스크립트 (Node.js)
└── train_mnist.py                    # MNIST CNN 학습 스크립트 (Python)
```

---

## 4. 데이터베이스 스키마

### 4.1 ERD

```
User 1──N Account      (Google OAuth 계정 연결)
User 1──N Session      (활성 세션 관리)
User 1──N Payment      (결제 내역)
```

### 4.2 모델 정의

#### User (NextAuth 필수)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (CUID) | PK |
| name | String? | Google 프로필 이름 |
| email | String? (unique) | Google 이메일 |
| emailVerified | DateTime? | 이메일 인증 시각 |
| image | String? | Google 프로필 이미지 URL |
| createdAt | DateTime | 생성일 |
| updatedAt | DateTime | 수정일 |

#### Account (NextAuth 필수 — OAuth 계정)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (CUID) | PK |
| userId | String | FK → User |
| provider | String | "google" |
| providerAccountId | String | Google 계정 고유 ID |
| access_token | Text? | OAuth access token |
| refresh_token | Text? | OAuth refresh token |
| expires_at | Int? | 토큰 만료 시각 |

#### Session (NextAuth 필수)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (CUID) | PK |
| sessionToken | String (unique) | 세션 토큰 |
| userId | String | FK → User |
| expires | DateTime | 만료 시각 |

#### Payment (Polar.sh 결제)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (CUID) | PK |
| userId | String | FK → User |
| polarOrderId | String? (unique) | Polar 주문 ID |
| polarProductId | String? | Polar 상품 ID |
| amount | Int | 금액 (cents) |
| currency | String | 통화 (기본: usd) |
| status | String | pending / succeeded / failed |
| productName | String? | 상품명 |
| customerEmail | String? | 구매자 이메일 |
| createdAt | DateTime | 생성일 |
| updatedAt | DateTime | 수정일 |

---

## 5. API 설계

### 5.1 인증 API (NextAuth)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth 핸들러 (로그인, 콜백, 세션, CSRF) |
| GET | `/api/auth/providers` | 등록된 OAuth 프로바이더 목록 |
| GET | `/api/auth/session` | 현재 세션 정보 |
| GET | `/api/auth/csrf` | CSRF 토큰 |

### 5.2 결제 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/checkout?products={id}&customerEmail={email}` | Polar Checkout 세션 생성 → 리다이렉트 |
| POST | `/api/webhook/polar` | Polar Webhook 수신 (서명 검증 후 DB 기록) |

### 5.3 접근 제어 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/access?userId={id}&email={email}` | 유료 기능 접근 권한 확인 (succeeded 결제 존재 여부) |

---

## 6. 인증/인가 흐름

### 6.1 Google OAuth 흐름
```
1. 사용자가 "Google로 계속하기" 클릭
2. NextAuth가 Google OAuth 동의 화면으로 리다이렉트
3. 사용자가 Google 계정으로 인증
4. Google이 /api/auth/callback/google 으로 리다이렉트
5. NextAuth가 JWT 토큰 생성 + User/Account DB 저장
6. 사용자를 /dashboard 로 리다이렉트
```

### 6.2 라우트 보호 (proxy.ts)
```
요청 → proxy.ts (미들웨어)
  ├── 보호 경로? (/dashboard, /demo, /products, /api/checkout)
  │   ├── JWT 토큰 있음 → 통과
  │   └── JWT 토큰 없음 → /login?callbackUrl=원래경로 리다이렉트
  └── /login 경로?
      ├── JWT 토큰 있음 → /dashboard 리다이렉트
      └── JWT 토큰 없음 → 통과
```

### 6.3 유료 기능 접근 제어
```
PaidFeatureGate 컴포넌트 렌더링
  ├── 무료 체험 기간 (현재 ~ 4/21)?
  │   └── YES → 파란색 배너 표시 + 기능 잠금 해제
  └── NO → /api/access 호출
      ├── succeeded 결제 존재 → 기능 잠금 해제
      └── 결제 없음 → 잠금 화면 + "결제하고 잠금 해제" 버튼
```

---

## 7. ML 모델 상세

### 7.1 MNIST CNN 모델 구조

```
Input (28×28×1)
  → Conv2D(16, 3×3, ReLU)    [160 params]
  → MaxPooling2D(2×2)
  → Conv2D(32, 3×3, ReLU)    [4,640 params]
  → MaxPooling2D(2×2)
  → Flatten
  → Dense(64, ReLU)           [51,264 params]
  → Dense(10, Softmax)        [650 params]

총 파라미터: 56,714
모델 크기: model.json (3.2KB) + weights.bin (227KB)
```

### 7.2 학습 환경
- **프레임워크:** TensorFlow.js (Node.js)
- **데이터:** MNIST 5,000장 (학습) / 1,000장 (검증)
- **Epoch:** 2
- **Batch Size:** 128
- **Optimizer:** Adam
- **Loss:** Sparse Categorical Crossentropy
- **검증 정확도:** ~87.9%

### 7.3 브라우저 추론 파이프라인
```
Canvas (280×280) → 28×28 리사이즈 → Grayscale → Float32 정규화(0~1)
  → tf.tensor4d [1, 28, 28, 1] → model.predict() → softmax [10]
  → 확률 바 차트 렌더링
```

---

## 8. 결제 시스템 상세

### 8.1 Polar.sh Checkout 흐름
```
1. ProductCard에서 "결제하기" 클릭
2. /api/checkout?products={id}&customerEmail={email} 호출
3. @polar-sh/nextjs Checkout 핸들러가 Polar Checkout 세션 생성
4. 사용자를 Polar 호스팅 결제 페이지로 리다이렉트
5. 결제 완료 → POLAR_SUCCESS_URL (/checkout/success) 로 리다이렉트
```

### 8.2 Webhook 처리
```
Polar 서버 → POST /api/webhook/polar
  1. 서명 검증 (POLAR_WEBHOOK_SECRET)
  2. onOrderPaid 이벤트 수신
  3. 중복 체크 (polarOrderId unique)
  4. Payment 레코드 생성 (status: "succeeded")
```

---

## 9. 배포 구성

### 9.1 Vercel 설정
- **Framework:** Next.js (자동 감지)
- **Build Command:** `prisma migrate deploy && prisma generate && next build`
- **Output:** Serverless Functions + Static Assets
- **Auto Deploy:** GitHub main 브랜치 push 시 자동 배포

### 9.2 환경변수

| 변수 | 용도 | 예시 |
|------|------|------|
| `DATABASE_URL` | Neon PostgreSQL 연결 | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_URL` | 앱 기본 URL | `https://ai-ml-project-blush.vercel.app` |
| `NEXTAUTH_SECRET` | JWT 암호화 키 | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | `822357...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 시크릿 | `GOCSPX-...` |
| `POLAR_ACCESS_TOKEN` | Polar API 토큰 | `polar_oat_...` |
| `POLAR_WEBHOOK_SECRET` | Webhook 서명 검증 키 | Polar 대시보드에서 생성 |
| `POLAR_SUCCESS_URL` | 결제 성공 리다이렉트 | `https://...vercel.app/checkout/success` |
| `POLAR_SERVER` | Polar 환경 | `sandbox` 또는 `production` |
| `POLAR_PRODUCT_ID` | 판매 상품 ID | UUID |

### 9.3 보안 헤더 (next.config.ts)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 10. 성능 최적화

| 최적화 | 구현 방식 |
|--------|----------|
| TF.js 지연 로드 | `import("@tensorflow/tfjs")` 동적 import — 해당 페이지 진입 시에만 로드 |
| 모델 캐싱 | 브라우저 캐시로 model.json/weights.bin 재다운로드 방지 |
| 이미지 증강 | Canvas 2D API 사용 (TF.js 없이 처리) — 추가 번들 0KB |
| 차트 데이터 | 사전 계산된 JSON 하드코딩 — API 호출 없음 |
| 스켈레톤 UI | loading.tsx로 페이지 전환 시 자연스러운 로딩 표시 |
| Prisma 싱글톤 | 개발 환경 핫 리로드 시 DB 커넥션 누수 방지 |

---

## 11. 테스트 시나리오

### 11.1 인증 플로우
| # | 시나리오 | 예상 결과 |
|---|---------|----------|
| 1 | 미로그인 상태에서 /dashboard 접근 | /login으로 리다이렉트 |
| 2 | Google 로그인 완료 | /dashboard 도착, 프로필 표시 |
| 3 | 로그아웃 클릭 | 랜딩 페이지로 이동, 세션 제거 |
| 4 | 새로고침 후 세션 유지 확인 | 로그인 상태 유지 |

### 11.2 결제 플로우
| # | 시나리오 | 예상 결과 |
|---|---------|----------|
| 5 | 상품 페이지에서 "결제하기" 클릭 | Polar Checkout으로 이동 |
| 6 | Sandbox 테스트 결제 완료 | /checkout/success 페이지 표시 |
| 7 | 대시보드에서 결제 내역 확인 | 결제 건수/금액 표시 |

### 11.3 AI 기능
| # | 시나리오 | 예상 결과 |
|---|---------|----------|
| 8 | 손글씨 인식기에서 숫자 5 그리기 | 5가 가장 높은 확률로 표시 |
| 9 | 이미지 업로드 후 증강 결과 확인 | 9개 변환 이미지 그리드 표시 |
| 10 | 학습 시각화 차트 확인 | 3개 인터랙티브 차트 렌더링 |
