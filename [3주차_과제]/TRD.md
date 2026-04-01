# TRD — Week 3 신경망 인터랙티브 트레이너

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| GUI 프레임워크 | PySide6 6.x | 크로스플랫폼, Qt 공식 Python 바인딩 |
| 수치 연산 | NumPy | 외부 ML 프레임워크 없이 순수 구현 (학습 목적) |
| 시각화 | Matplotlib (QtAgg 백엔드) | PySide6와 임베디드 통합 |
| Python | 3.12+ | `X | None` 타입 힌트 문법 지원 |

---

## 2. 아키텍처

```
MainWindow
├── _make_control_panel()   ← QWidget (fixed 240px)
│   ├── QGroupBox: 신경망 설정
│   │   ├── QComboBox: cb_dataset   (XOR / Circle / Spiral)
│   │   ├── QComboBox: cb_h1        (2 / 4 / 8 / 16)
│   │   ├── QComboBox: cb_h2        (없음 / 2 / 4 / 8 / 16)
│   │   ├── QComboBox: cb_act       (Sigmoid / ReLU / Tanh)
│   │   ├── QComboBox: cb_lr        (0.01 / 0.1 / 0.5 / 1.0)
│   │   └── QSpinBox:  sp_epochs    (100 ~ 30000)
│   ├── QGroupBox: 학습
│   │   ├── QPushButton: btn_train
│   │   └── QProgressBar: progress_bar
│   └── QGroupBox: 결과
│       ├── lbl_loss, lbl_acc, lbl_arch
│
└── _make_viz_panel()       ← QTabWidget
    ├── Tab 1: MplCanvas (Loss 곡선)
    ├── Tab 2: MplCanvas (결정 경계)
    └── Tab 3: MplCanvas (은닉층 활성화)
```

---

## 3. 핵심 클래스 설명

### 3.1 `MLP`

순수 NumPy로 구현한 2-layer / 3-layer MLP.

| 메서드 | 역할 |
|--------|------|
| `__init__` | Xavier 초기화, `hidden2=None`이면 2-layer |
| `forward(X)` | 순전파, 중간 활성화 값 `self.a1`, `self.a2` 저장 |
| `backward(X, y, out)` | Chain Rule로 역전파, 가중치 업데이트 |
| `train(X, y, epochs, progress_cb)` | 학습 루프, 100 epoch마다 콜백 호출 |

**출력층 활성화:** 항상 Sigmoid (이진 분류 확률 출력)
**은닉층 활성화:** 사용자가 선택한 함수 (Sigmoid / ReLU / Tanh)

#### 순전파 수식 (2-layer)
```
z1 = X @ W1 + b1
a1 = act(z1)
z2 = a1 @ W2 + b2
a2 = sigmoid(z2)   ← 출력
```

#### 순전파 수식 (3-layer)
```
z1 = X @ W1 + b1
a1 = act(z1)
z2 = a1 @ W2 + b2
a2 = act(z2)
z3 = a2 @ W3 + b3
a3 = sigmoid(z3)   ← 출력
```

#### 역전파 핵심 (3-layer)
```
δ3 = a3 - y
dW3 = (1/m) * a2ᵀ @ δ3

δ2 = (δ3 @ W3ᵀ) ⊙ act'(z2)
dW2 = (1/m) * a1ᵀ @ δ2

δ1 = (δ2 @ W2ᵀ) ⊙ act'(z1)
dW1 = (1/m) * Xᵀ @ δ1
```

---

### 3.2 활성화 함수

| 함수 | 수식 | 미분 | 특징 |
|------|------|------|------|
| Sigmoid | `1/(1+e^{-x})` | `σ(1-σ)` | Vanishing gradient 위험 |
| ReLU | `max(0, x)` | `x>0 ? 1 : 0` | 수렴 빠름, Dead neuron 위험 |
| Tanh | `tanh(x)` | `1-tanh²(x)` | 출력 [-1,1], Sigmoid보다 안정 |

---

### 3.3 데이터셋

| 이름 | 샘플 수 | 설명 |
|------|--------|------|
| XOR | 4 | 2개 뉴런으로 해결 가능한 최소 예제 |
| Circle | 200 | 동심원 구조, 비선형 경계 |
| Spiral | 300 | 나선형, 가장 어려운 패턴 |

---

### 3.4 `TrainWorker` (QThread)

학습을 메인 스레드와 분리하여 UI 응답성 유지.

```python
Signal progress(int pct, float loss)   # 100 epoch마다 emit
Signal finished(MLP mlp)               # 학습 완료 시 emit
```

메인 스레드는 `finished` 시그널을 받아 시각화 3종을 갱신한다.

---

### 3.5 `MplCanvas`

`FigureCanvasQTAgg`를 상속하여 PySide6 QWidget에 matplotlib Figure를 임베딩.
각 탭마다 독립적인 캔버스 인스턴스를 사용한다.

---

## 4. 데이터 흐름

```
[사용자 파라미터 선택]
        ↓
  _on_train() 호출
        ↓
  TrainWorker 생성 → QThread.start()
        ↓  (별도 스레드)
  MLP.train() 실행
  └─ 100 epoch마다 → progress 시그널 → progress_bar 업데이트
        ↓
  finished 시그널 → _on_finished()
        ↓
  _plot_loss()   → Tab 1 갱신
  _plot_boundary() → Tab 2 갱신
  _plot_hidden() → Tab 3 갱신
```

---

## 5. 실행 방법

```bash
# 의존성 설치
pip install pyside6 numpy matplotlib
# 또는 uv 사용
uv add pyside6 numpy matplotlib

# 실행
cd 수업자료/week3/[3주차_과제]
python week3_homework.py
```

---

## 6. 파일 구조

```
[3주차_과제]/
├── week3_homework.py   ← PySide6 앱 (단일 파일)
├── PRD.md              ← 제품 요구사항
└── TRD.md              ← 기술 요구사항 (현재 파일)
```

---

## 7. 알려진 제약사항

| 항목 | 내용 |
|------|------|
| XOR 정확도 | 랜덤 초기화로 인해 간혹 로컬 미니멈에 빠질 수 있음 → 재학습으로 해결 |
| ReLU + XOR | hidden=2일 때 Dead neuron 발생 가능 → hidden 늘리거나 Tanh 사용 |
| Spiral 데이터 | 2-layer + 작은 뉴런 수로는 100% 정확도 달성 어려움 (의도된 제약) |
| MNIST | 이미지 데이터 특성상 별도 전처리 필요 → v2.0 과제로 예정 |
