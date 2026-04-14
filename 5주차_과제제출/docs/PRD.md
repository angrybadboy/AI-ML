# NeuroLab — Product Requirements Document (PRD)

## 1. 개요

### 1.1 프로젝트 명
**NeuroLab** — 딥러닝 체험 플랫폼

### 1.2 목적
부산대학교 AI머신러닝 수업 5주차 핵심 개념(CNN, Regularization, Overfitting/Underfitting, Data Augmentation)을 **웹 브라우저에서 직접 체험**할 수 있는 플랫폼을 구축한다. Google 로그인과 Polar.sh 결제 시스템을 통합하여 실제 서비스와 유사한 사용자 경험을 제공한다.

### 1.3 배경
- 딥러닝 개념은 코드와 이론만으로는 직관적 이해가 어려움
- 실제 서비스처럼 인증/결제가 포함된 웹 애플리케이션 구축 경험 필요
- 브라우저 기반으로 별도 환경 설치 없이 누구나 체험 가능해야 함

### 1.4 배포 URL
https://ai-ml-project-blush.vercel.app

---

## 2. 타겟 사용자

| 유형 | 설명 |
|------|------|
| 수업 수강생 | AI머신러닝 수업을 듣는 학생으로, 5주차 개념을 인터랙티브하게 복습 |
| 교수/조교 | 과제 제출물을 확인하고 실제 동작을 검증 |
| 일반 사용자 | 딥러닝에 관심 있는 누구나 (Google 계정만 있으면 접근 가능) |

---

## 3. 핵심 기능

### 3.1 사용자 인증 (Google OAuth)

| 항목 | 상세 |
|------|------|
| 로그인 방식 | Google OAuth 2.0 (소셜 로그인) |
| 세션 관리 | JWT 기반, 30일 유효 |
| 보호 경로 | 대시보드, AI 체험, 상품 페이지는 로그인 필수 |
| 자동 리다이렉트 | 미인증 사용자 → 로그인 페이지, 로그인 후 원래 페이지로 복귀 |

**사용자 흐름:**
```
랜딩 페이지 → "Google로 시작하기" 클릭 → Google 동의 화면 → 로그인 완료 → 대시보드
```

### 3.2 AI 체험 기능 (3가지)

#### 3.2.1 손글씨 숫자 인식기 (CNN)
- **5주차 연관:** `05_mnist_cnn.py` — Convolutional Neural Network
- **기능:** 캔버스에 마우스/터치로 0~9 숫자를 그리면 CNN 모델이 실시간 판별
- **출력:** 각 숫자(0~9)의 softmax 확률을 가로 바 차트로 표시
- **모델:** MNIST 60,000장으로 학습된 CNN (Conv2D → MaxPooling → Dense)
- **실행 환경:** TensorFlow.js — 서버 없이 브라우저에서 직접 추론
- **접근 권한:** 유료 (현재 무료 체험 기간)

#### 3.2.2 이미지 증강 체험 (Data Augmentation)
- **5주차 연관:** `03_data_augmentation.py` — RandomFlip, RandomRotation, RandomZoom
- **기능:** 사용자가 이미지를 업로드하면 9가지 증강 결과를 3×3 그리드로 표시
- **적용 기법:**
  - 좌우 반전 (RandomFlip horizontal)
  - 상하 반전 (RandomFlip vertical)
  - 회전 15° / -20° (RandomRotation)
  - 확대 120% / 축소 80% (RandomZoom)
  - 복합 변환 (회전+확대, 반전+회전)
- **실행 환경:** Canvas 2D API — 추가 라이브러리 없이 브라우저에서 처리
- **접근 권한:** 유료 (현재 무료 체험 기간)

#### 3.2.3 학습 시각화 대시보드 (Regularization + Overfitting)
- **5주차 연관:** `01_regularization.py`, `02_overfitting_underfitting.py`
- **기능:** 인터랙티브 차트로 딥러닝 학습 과정을 시각화
- **차트 구성:**
  - Regularization 기법별 Validation Loss 비교 (None vs L2 vs Dropout vs BatchNorm)
  - 모델 복잡도별 Validation Loss 곡선 (Underfit vs Balanced vs Overfit)
  - 모델 복잡도별 예측 곡선 비교 (sin(x) 근사)
- **핵심 개념 요약 카드:** Regularization, Overfitting/Underfitting 설명
- **접근 권한:** 무료 (로그인만 필요)

### 3.3 결제 시스템 (Polar.sh)

| 항목 | 상세 |
|------|------|
| 결제 플랫폼 | Polar.sh (Sandbox 테스트 모드) |
| 결제 방식 | Polar Checkout (Polar 호스팅 결제 페이지) |
| 결제 후 처리 | Webhook으로 결제 결과 수신 → DB에 기록 |
| 결제 내역 | 대시보드에서 결제 건수, 금액, 상세 내역 확인 가능 |

**결제 흐름:**
```
상품 페이지 → "결제하기" 클릭 → Polar Checkout → 결제 완료 → 성공 페이지 → 대시보드
```

### 3.4 접근 제어 (유/무료 구분)

| 기능 | 접근 권한 | 비고 |
|------|----------|------|
| 학습 시각화 대시보드 | 무료 (로그인만) | |
| 손글씨 인식기 | 유료 | 현재 4/21까지 무료 체험 |
| 이미지 증강 체험 | 유료 | 현재 4/21까지 무료 체험 |

- 무료 체험 기간 중 파란색 배너로 안내 표시
- 체험 기간 종료 후 결제하지 않으면 잠금 화면 + 결제 유도 UI 노출

---

## 4. 페이지 구성

| 경로 | 페이지 | 인증 | 설명 |
|------|--------|------|------|
| `/` | 랜딩 페이지 | 불필요 | 서비스 소개, 기능 카드, 기술 스택 |
| `/login` | 로그인 | 불필요 | Google OAuth 로그인 |
| `/dashboard` | 대시보드 | 필수 | 결제 요약, 결제 내역 리스트 |
| `/demo` | AI 체험 허브 | 필수 | 3개 기능 카드 (유/무료 뱃지) |
| `/demo/handwriting` | 손글씨 인식기 | 필수 + 결제 | CNN 캔버스 + 확률 차트 |
| `/demo/augmentation` | 이미지 증강 | 필수 + 결제 | 이미지 업로드 + 9개 변환 그리드 |
| `/demo/training` | 학습 시각화 | 필수 | Recharts 인터랙티브 차트 3개 |
| `/products` | 상품 페이지 | 필수 | Polar 상품 정보 + 결제 버튼 |
| `/checkout/success` | 결제 완료 | 불필요 | 성공 메시지 + 대시보드 이동 |

---

## 5. 비기능 요구사항

### 5.1 성능
- MNIST 모델 브라우저 로드: 1초 이내 (모델 파일 ~230KB)
- 숫자 인식 추론: 100ms 이내
- 이미지 증강 9개 생성: 50ms 이내
- 차트 렌더링: 첫 로드 500ms 이내

### 5.2 호환성
- 최신 Chrome, Safari, Firefox, Edge 지원
- 모바일 반응형 (터치 드로잉 지원)
- Python/GPU 불필요 — 브라우저만 있으면 동작

### 5.3 보안
- 환경변수로 모든 시크릿 관리 (하드코딩 없음)
- Polar Webhook 서명 검증
- CSRF 보호 (NextAuth 내장)
- 보안 헤더 적용 (X-Frame-Options, X-Content-Type-Options 등)
- 프로덕션 환경에서 민감 정보 로깅 차단

### 5.4 디자인
- 미니멀리스트 디자인 (AI 생성 느낌 배제)
- Geist 서체, gray-900 주색, #fafafa 배경
- 스켈레톤 로딩 UI로 자연스러운 전환
- Sticky 네비게이션 + backdrop-blur

---

## 6. 5주차 수업 내용 매핑

| 수업 자료 | 웹 구현 | 핵심 개념 시연 |
|----------|---------|---------------|
| `01_regularization.py` | 학습 시각화 대시보드 (Regularization 차트) | L2, Dropout, BatchNorm 효과 비교 |
| `02_overfitting_underfitting.py` | 학습 시각화 대시보드 (Overfitting 차트) | 모델 복잡도와 일반화 성능의 관계 |
| `03_data_augmentation.py` | 이미지 증강 체험 | RandomFlip, RandomRotation, RandomZoom |
| `04_transfer_learning.py` | 기술 기반 (TensorFlow.js 모델 변환) | 사전학습 모델의 웹 환경 활용 |
| `05_mnist_cnn.py` | 손글씨 숫자 인식기 | Conv2D, MaxPooling2D, Dense, Softmax |

---

## 7. 성공 기준

- [ ] Google 로그인 → 대시보드 진입까지 끊김 없이 동작
- [ ] 3개 AI 체험 기능이 모두 브라우저에서 정상 실행
- [ ] 결제 → 유료 기능 잠금 해제 흐름이 정상 동작
- [ ] Vercel 배포 상태에서 외부 접속 가능
- [ ] 모바일에서도 기본 기능 사용 가능
