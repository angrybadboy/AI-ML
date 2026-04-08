# TRD — Week 4 물리 데이터 신경망 인터랙티브 트레이너

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| GUI 프레임워크 | PySide6 6.x | 크로스플랫폼, Qt 공식 바인딩 |
| 딥러닝 | TensorFlow 2.x / Keras | 주차 수업 내용과 동일한 프레임워크 |
| 수치 연산 | NumPy | RK4 시뮬레이션 및 물리 계산 |
| 시각화 | Matplotlib (QtAgg 백엔드) | PySide6 위젯에 임베딩 |
| Python | 3.12+ | 타입 힌트 지원 |

---

## 2. 아키텍처

```
MainWindow (QMainWindow)
└── QTabWidget
    ├── Tab1_FuncApprox    (Lab 1: 1D 함수 근사)
    ├── Tab2_Projectile    (Lab 2: 포물선 운동)
    ├── Tab3_Overfitting   (Lab 3: 과적합/과소적합)
    └── Tab4_Pendulum      (Lab 4: 진자 주기)

각 Tab:
  QHBoxLayout
  ├── Controls Panel (QWidget, 235px 고정)
  │   ├── QGroupBox: 설정
  │   ├── QGroupBox: 학습 (버튼 + ProgressBar)
  │   └── QGroupBox: 결과
  └── MplCanvas (Matplotlib 임베딩, 확장 가능)
```

---

## 3. 핵심 클래스

### 3.1 `MplCanvas`

`FigureCanvasQTAgg` 상속. rows×cols 서브플롯을 2D numpy 배열(`self.axes`)로 관리.

```python
canvas = MplCanvas(rows=1, cols=3, figsize=(13, 4))
canvas.ax(0, 1)          # axes[0][1] 접근
canvas.clear_all()       # 모든 subplot 초기화
canvas.draw()            # Qt 화면 갱신
```

**설계 이유:** 각 Tab마다 subplot 구성이 달라 유연한 인덱싱이 필요.

---

### 3.2 `make_progress_cb(worker, total)`

Keras 학습 진행률을 Qt Signal로 변환하는 팩토리 함수.

```python
# Signal: progress(int pct, float loss)
callbacks=[make_progress_cb(self, self.epochs)]
```

**설계 이유:** 4개 Worker 모두 동일한 패턴을 사용하므로 중복 제거.

---

### 3.3 학습 스레드 (4종 QThread)

| 클래스 | Signals | 비동기 작업 |
|--------|---------|------------|
| `Worker1D` | `progress(int, float)`, `finished(model, history, data)` | 1D NN 학습 |
| `WorkerProjectile` | `progress(int, float)`, `finished(model, history)` | 포물선 NN 학습 |
| `WorkerOverfit` | `progress(int, float)`, `finished(models, histories, x_te, y_te)` | 3모델 순차 학습 |
| `WorkerPendulum` | `progress(int, float)`, `finished(model, history)` | 진자 NN 학습 |

**QThread 사용 이유:** TF 학습은 수십 초 소요 → 메인 스레드 블로킹 방지.

---

## 4. TF 모델 상세

### 4.1 1D 함수 근사 모델

```
입력: x (1D)
은닉층: [32] / [64,64] / [128,128] / [128,128,64]  ← 사용자 선택
활성화: tanh 또는 relu
출력: y (1D, linear)
Optimizer: Adam(lr=0.01)
Loss: MSE
콜백: ReduceLROnPlateau(factor=0.9, patience=100)
```

### 4.2 포물선 운동 모델

```
입력: (v₀, θ, t) → 3차원
Dense(128, relu) → Dropout(0.1)
Dense(64,  relu) → Dropout(0.1)
Dense(32,  relu) → Dropout(0.1)
출력: (x, y) → 2차원, linear
Optimizer: Adam(lr=0.001), Loss: MSE
학습: 2000샘플, validation_split=0.2, 100 epochs
```

### 4.3 과적합/과소적합 3모델

| 모델 | 구조 | 특징 |
|------|------|------|
| Underfit | Dense(4, relu) → Dense(1) | 파라미터 부족 → 과소적합 |
| Good Fit | Dense(32)→Dropout→Dense(16)→Dropout→Dense(1) | Dropout으로 정규화 |
| Overfit | Dense(256)→Dense(128)→Dense(64)→Dense(32)→Dense(1) | 파라미터 과잉 → 과적합 |

### 4.4 진자 주기 모델

```
입력: (L, θ₀) → 2차원
Dense(64, relu) → Dropout(0.1)
Dense(32, relu) → Dropout(0.1)
Dense(16, relu) → Dropout(0.1)
출력: T (주기, 1D, linear)
학습: 2000샘플, 200 epochs
물리 공식 레이블: T = 2π√(L/g) × (타원 적분 보정)
```

---

## 5. 물리 알고리즘

### 5.1 진자 주기 (타원 적분 근사)

```python
def pendulum_period(L, theta_deg):
    rad = np.deg2rad(theta_deg)
    T0  = 2 * np.pi * np.sqrt(L / G)
    return T0 * (1 + (1/16)*rad**2 + (11/3072)*rad**4)
```

- 작은 각도 근사: T ≈ T₀ = 2π√(L/g)
- 큰 각도 보정: 4차 다항식 근사 (오차 < 0.1% at 80°)

### 5.2 RK4 수치 적분

운동 방정식: `d²θ/dt² = -(g/L)sin(θ)`

```
상태 변수: θ (각도), ω = dθ/dt (각속도)
k1: 현재 상태에서 기울기
k2: Δt/2 후 예측값으로 기울기
k3: k2 보정 후 기울기
k4: Δt 후 예측값으로 기울기
업데이트: θ += (dt/6)(k1+2k2+2k3+k4)
```

**위상 공간:** (θ, ω) 평면에서 타원 궤도 → 에너지 보존 증명

---

## 6. 데이터 흐름

### Tab 1, 3 (학습 후 정적 출력)
```
[사용자 설정] → [Worker.start()] → [TF 학습]
    → progress 시그널 → ProgressBar 업데이트
    → finished 시그널 → _done() → _plot() → canvas.draw()
```

### Tab 2, 4 (학습 후 실시간 인터랙션)
```
[모델 학습] → [self.model 저장]
[슬라이더 변경] → [_update_plot()]
    → model.predict() (빠른 추론)
    → canvas.clear_all() → 그래프 재그리기 → canvas.draw()
```

---

## 7. 실행 방법

```bash
# 의존성 설치
pip install pyside6 tensorflow numpy matplotlib
# 또는 uv 사용
uv add pyside6 tensorflow numpy matplotlib

# 실행
cd 수업자료/week4/[4주차_과제]
python week4_homework.py
```

---

## 8. 파일 구조

```
[4주차_과제]/
├── week4_homework.py   ← PySide6 통합 앱 (단일 파일, ~570 lines)
├── PRD.md              ← 제품 요구사항 문서
└── TRD.md              ← 기술 요구사항 문서 (현재 파일)
```

---

## 9. 알려진 제약 및 참고사항

| 항목 | 내용 |
|------|------|
| 학습 시간 | Tab 3 (3모델) 약 20~40초, Tab 4 약 30초 |
| TF 첫 실행 | TF 초기화로 인해 첫 학습 시작 지연 (약 5초) |
| Overfit 재현성 | random seed=42 고정으로 결과 재현 가능 |
| Tab 2/4 슬라이더 | 추론 속도 빠르므로 실시간 업데이트 가능 |
| MNIST | 이미지 데이터 특성상 미포함 (별도 Lab으로 예정) |
