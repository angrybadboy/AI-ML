"""
Week 3 과제: PySide6 신경망 인터랙티브 트레이너
스스로 해보기 항목:
  1. 은닉층 뉴런 수 바꿔보기 (2, 8, 16)
  2. 학습률 조정 (0.1, 0.5, 1.0)
  3. 다른 활성화 함수 시도 (Sigmoid, ReLU, Tanh)
  4. 3-layer 네트워크 구현
  5. 다른 데이터셋 시도 (XOR / Circle / Spiral)
"""

import sys
import numpy as np

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QVBoxLayout, QHBoxLayout, QGridLayout,
    QLabel, QComboBox, QSpinBox, QPushButton,
    QGroupBox, QTabWidget, QProgressBar, QSizePolicy,
)
from PySide6.QtCore import Qt, QThread, Signal
from PySide6.QtGui import QFont

import matplotlib
matplotlib.use("QtAgg")
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure


# ── 활성화 함수 ────────────────────────────────────────────────────────────────

def sigmoid(x):
    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

def sigmoid_d(x):
    s = sigmoid(x)
    return s * (1 - s)

def relu(x):
    return np.maximum(0, x)

def relu_d(x):
    return (x > 0).astype(float)

def tanh_fn(x):
    return np.tanh(x)

def tanh_d(x):
    return 1 - np.tanh(x) ** 2

ACTIVATIONS = {
    "Sigmoid": (sigmoid, sigmoid_d),
    "ReLU":    (relu,    relu_d),
    "Tanh":    (tanh_fn, tanh_d),
}


# ── MLP 모델 (2-layer / 3-layer 지원) ─────────────────────────────────────────

class MLP:
    def __init__(self, hidden1: int, hidden2: int | None, act_name: str, lr: float):
        self.hidden2 = hidden2
        self.lr = lr
        self.act, self.act_d = ACTIVATIONS[act_name]
        self.loss_history: list[float] = []

        # Layer 1: 2 → hidden1
        self.W1 = np.random.randn(2, hidden1) * np.sqrt(2.0 / 2)
        self.b1 = np.zeros((1, hidden1))

        if hidden2:
            self.W2 = np.random.randn(hidden1, hidden2) * np.sqrt(2.0 / hidden1)
            self.b2 = np.zeros((1, hidden2))
            self.W3 = np.random.randn(hidden2, 1) * np.sqrt(2.0 / hidden2)
            self.b3 = np.zeros((1, 1))
        else:
            self.W2 = np.random.randn(hidden1, 1) * np.sqrt(2.0 / hidden1)
            self.b2 = np.zeros((1, 1))

    def forward(self, X: np.ndarray) -> np.ndarray:
        self.z1 = X @ self.W1 + self.b1
        self.a1 = self.act(self.z1)

        if self.hidden2:
            self.z2 = self.a1 @ self.W2 + self.b2
            self.a2 = self.act(self.z2)
            self.z3 = self.a2 @ self.W3 + self.b3
            self.a3 = sigmoid(self.z3)
            return self.a3
        else:
            self.z2 = self.a1 @ self.W2 + self.b2
            self.a2 = sigmoid(self.z2)
            return self.a2

    def backward(self, X: np.ndarray, y: np.ndarray, out: np.ndarray):
        m = X.shape[0]
        if self.hidden2:
            dz3 = out - y
            dW3 = (1/m) * self.a2.T @ dz3
            db3 = (1/m) * np.sum(dz3, axis=0, keepdims=True)
            da2 = dz3 @ self.W3.T
            dz2 = da2 * self.act_d(self.z2)
            dW2 = (1/m) * self.a1.T @ dz2
            db2 = (1/m) * np.sum(dz2, axis=0, keepdims=True)
            da1 = dz2 @ self.W2.T
            dz1 = da1 * self.act_d(self.z1)
            dW1 = (1/m) * X.T @ dz1
            db1 = (1/m) * np.sum(dz1, axis=0, keepdims=True)
            self.W3 -= self.lr * dW3; self.b3 -= self.lr * db3
            self.W2 -= self.lr * dW2; self.b2 -= self.lr * db2
            self.W1 -= self.lr * dW1; self.b1 -= self.lr * db1
        else:
            dz2 = out - y
            dW2 = (1/m) * self.a1.T @ dz2
            db2 = (1/m) * np.sum(dz2, axis=0, keepdims=True)
            da1 = dz2 @ self.W2.T
            dz1 = da1 * self.act_d(self.z1)
            dW1 = (1/m) * X.T @ dz1
            db1 = (1/m) * np.sum(dz1, axis=0, keepdims=True)
            self.W2 -= self.lr * dW2; self.b2 -= self.lr * db2
            self.W1 -= self.lr * dW1; self.b1 -= self.lr * db1

    def train(self, X, y, epochs, progress_cb=None):
        self.loss_history = []
        for epoch in range(epochs):
            out = self.forward(X)
            loss = float(np.mean((out - y) ** 2))
            self.loss_history.append(loss)
            self.backward(X, y, out)
            if progress_cb and (epoch + 1) % max(1, epochs // 100) == 0:
                progress_cb(epoch + 1, epochs, loss)

    def predict(self, X):
        return (self.forward(X) > 0.5).astype(int)


# ── 데이터셋 ───────────────────────────────────────────────────────────────────

def make_xor():
    X = np.array([[0,0],[0,1],[1,0],[1,1]], dtype=float)
    y = np.array([[0],[1],[1],[0]], dtype=float)
    return X, y

def make_circle(n=200, noise=0.1):
    np.random.seed(42)
    angles = np.random.uniform(0, 2*np.pi, n)
    r_inner = np.random.uniform(0, 0.4, n//2)
    r_outer = np.random.uniform(0.6, 1.0, n//2)
    r = np.concatenate([r_inner, r_outer])
    angles_all = np.concatenate([angles[:n//2], angles[n//2:]])
    X = np.column_stack([r * np.cos(angles_all), r * np.sin(angles_all)])
    X += np.random.randn(*X.shape) * noise
    y = np.array([[0]]*(n//2) + [[1]]*(n//2), dtype=float)
    return X, y

def make_spiral(n=150, noise=0.2):
    np.random.seed(42)
    def spiral(delta):
        t = np.linspace(0, 4*np.pi, n)
        x = t * np.cos(t + delta) / (4*np.pi)
        y_s = t * np.sin(t + delta) / (4*np.pi)
        return np.column_stack([x, y_s])
    X = np.vstack([spiral(0), spiral(np.pi)])
    X += np.random.randn(*X.shape) * noise
    y = np.array([[0]]*n + [[1]]*n, dtype=float)
    return X, y

DATASETS = {
    "XOR":    make_xor,
    "Circle": make_circle,
    "Spiral": make_spiral,
}


# ── 학습 스레드 ────────────────────────────────────────────────────────────────

class TrainWorker(QThread):
    progress = Signal(int, float)   # epoch, loss
    finished = Signal(object)       # trained MLP

    def __init__(self, cfg: dict):
        super().__init__()
        self.cfg = cfg

    def run(self):
        cfg = self.cfg
        np.random.seed(None)
        mlp = MLP(
            hidden1=cfg["hidden1"],
            hidden2=cfg["hidden2"],
            act_name=cfg["act"],
            lr=cfg["lr"],
        )

        def cb(ep, total, loss):
            self.progress.emit(int(ep * 100 / total), loss)

        mlp.train(cfg["X"], cfg["y"], cfg["epochs"], progress_cb=cb)
        self.finished.emit(mlp)


# ── Matplotlib 캔버스 ──────────────────────────────────────────────────────────

class MplCanvas(FigureCanvas):
    def __init__(self, rows=1, cols=1, figsize=(6, 4)):
        self.fig = Figure(figsize=figsize, tight_layout=True)
        self.axes = self.fig.subplots(rows, cols)
        super().__init__(self.fig)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)


# ── 메인 윈도우 ────────────────────────────────────────────────────────────────

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Week 3 과제 — 신경망 인터랙티브 트레이너")
        self.resize(1100, 680)
        self.mlp: MLP | None = None
        self.worker: TrainWorker | None = None
        self._build_ui()

    # ── UI 구성 ────────────────────────────────────────────────────────────────

    def _build_ui(self):
        root = QWidget()
        self.setCentralWidget(root)
        layout = QHBoxLayout(root)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(10)

        layout.addWidget(self._make_control_panel(), stretch=0)
        layout.addWidget(self._make_viz_panel(), stretch=1)

    def _make_control_panel(self) -> QWidget:
        panel = QWidget()
        panel.setFixedWidth(240)
        vbox = QVBoxLayout(panel)
        vbox.setSpacing(10)

        # ── 신경망 설정 ────────────────────────────────────────────────────────
        net_box = QGroupBox("신경망 설정")
        grid = QGridLayout(net_box)
        grid.setSpacing(6)

        # 데이터셋
        grid.addWidget(QLabel("데이터셋:"), 0, 0)
        self.cb_dataset = QComboBox()
        self.cb_dataset.addItems(list(DATASETS.keys()))
        grid.addWidget(self.cb_dataset, 0, 1)

        # 은닉층 1
        grid.addWidget(QLabel("은닉층 1 뉴런:"), 1, 0)
        self.cb_h1 = QComboBox()
        self.cb_h1.addItems(["2", "4", "8", "16"])
        self.cb_h1.setCurrentText("4")
        grid.addWidget(self.cb_h1, 1, 1)

        # 은닉층 2 (3-layer)
        grid.addWidget(QLabel("은닉층 2 (3-layer):"), 2, 0)
        self.cb_h2 = QComboBox()
        self.cb_h2.addItems(["없음", "2", "4", "8", "16"])
        grid.addWidget(self.cb_h2, 2, 1)

        # 활성화 함수
        grid.addWidget(QLabel("활성화 함수:"), 3, 0)
        self.cb_act = QComboBox()
        self.cb_act.addItems(list(ACTIVATIONS.keys()))
        grid.addWidget(self.cb_act, 3, 1)

        # 학습률
        grid.addWidget(QLabel("학습률:"), 4, 0)
        self.cb_lr = QComboBox()
        self.cb_lr.addItems(["0.01", "0.1", "0.5", "1.0"])
        self.cb_lr.setCurrentText("0.5")
        grid.addWidget(self.cb_lr, 4, 1)

        # Epochs
        grid.addWidget(QLabel("Epochs:"), 5, 0)
        self.sp_epochs = QSpinBox()
        self.sp_epochs.setRange(100, 30000)
        self.sp_epochs.setSingleStep(500)
        self.sp_epochs.setValue(5000)
        grid.addWidget(self.sp_epochs, 5, 1)

        vbox.addWidget(net_box)

        # ── 학습 컨트롤 ────────────────────────────────────────────────────────
        train_box = QGroupBox("학습")
        tbox = QVBoxLayout(train_box)

        self.btn_train = QPushButton("▶  학습 시작")
        self.btn_train.setFixedHeight(36)
        self.btn_train.clicked.connect(self._on_train)
        tbox.addWidget(self.btn_train)

        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setValue(0)
        tbox.addWidget(self.progress_bar)

        self.lbl_status = QLabel("준비됨")
        self.lbl_status.setAlignment(Qt.AlignCenter)
        tbox.addWidget(self.lbl_status)

        vbox.addWidget(train_box)

        # ── 결과 ───────────────────────────────────────────────────────────────
        result_box = QGroupBox("결과")
        rbox = QGridLayout(result_box)

        rbox.addWidget(QLabel("최종 Loss:"), 0, 0)
        self.lbl_loss = QLabel("—")
        self.lbl_loss.setFont(QFont("Monospace", 10))
        rbox.addWidget(self.lbl_loss, 0, 1)

        rbox.addWidget(QLabel("정확도:"), 1, 0)
        self.lbl_acc = QLabel("—")
        self.lbl_acc.setFont(QFont("Monospace", 10))
        rbox.addWidget(self.lbl_acc, 1, 1)

        rbox.addWidget(QLabel("레이어 구조:"), 2, 0)
        self.lbl_arch = QLabel("—")
        self.lbl_arch.setFont(QFont("Monospace", 9))
        rbox.addWidget(self.lbl_arch, 2, 1)

        vbox.addWidget(result_box)
        vbox.addStretch()
        return panel

    def _make_viz_panel(self) -> QWidget:
        self.tabs = QTabWidget()

        # Tab 1: Loss 곡선
        self.canvas_loss = MplCanvas(figsize=(6, 4))
        self.tabs.addTab(self.canvas_loss, "Loss 곡선")

        # Tab 2: 결정 경계
        self.canvas_boundary = MplCanvas(figsize=(6, 4))
        self.tabs.addTab(self.canvas_boundary, "결정 경계")

        # Tab 3: 은닉층 활성화
        self.canvas_hidden = MplCanvas(figsize=(6, 4))
        self.tabs.addTab(self.canvas_hidden, "은닉층 활성화")

        return self.tabs

    # ── 학습 시작 ──────────────────────────────────────────────────────────────

    def _on_train(self):
        if self.worker and self.worker.isRunning():
            return

        dataset_fn = DATASETS[self.cb_dataset.currentText()]
        X, y = dataset_fn()

        h2_text = self.cb_h2.currentText()
        cfg = {
            "X":       X,
            "y":       y,
            "hidden1": int(self.cb_h1.currentText()),
            "hidden2": int(h2_text) if h2_text != "없음" else None,
            "act":     self.cb_act.currentText(),
            "lr":      float(self.cb_lr.currentText()),
            "epochs":  self.sp_epochs.value(),
        }

        h2 = cfg["hidden2"]
        arch = f"2 → {cfg['hidden1']}" + (f" → {h2}" if h2 else "") + " → 1"
        self.lbl_arch.setText(arch)

        self.btn_train.setEnabled(False)
        self.btn_train.setText("학습 중...")
        self.progress_bar.setValue(0)
        self.lbl_status.setText("학습 중...")

        self.worker = TrainWorker(cfg)
        self.worker.progress.connect(self._on_progress)
        self.worker.finished.connect(self._on_finished)
        self.worker.start()

    def _on_progress(self, pct: int, loss: float):
        self.progress_bar.setValue(pct)
        self.lbl_status.setText(f"Loss: {loss:.5f}")

    def _on_finished(self, mlp: MLP):
        self.mlp = mlp
        self.btn_train.setEnabled(True)
        self.btn_train.setText("▶  학습 시작")
        self.progress_bar.setValue(100)

        dataset_fn = DATASETS[self.cb_dataset.currentText()]
        X, y = dataset_fn()

        final_loss = mlp.loss_history[-1]
        preds = mlp.predict(X)
        acc = float(np.mean(preds == y.astype(int))) * 100

        self.lbl_loss.setText(f"{final_loss:.6f}")
        self.lbl_acc.setText(f"{acc:.1f}%")
        self.lbl_status.setText("완료!")

        self._plot_loss(mlp)
        self._plot_boundary(mlp, X, y)
        self._plot_hidden(mlp, X, y)

    # ── 시각화 ─────────────────────────────────────────────────────────────────

    def _plot_loss(self, mlp: MLP):
        ax = self.canvas_loss.axes
        ax.cla()
        ax.plot(mlp.loss_history, color="#2196F3", linewidth=1.5)
        ax.set_title("Training Loss (MSE)", fontsize=13, fontweight="bold")
        ax.set_xlabel("Epoch")
        ax.set_ylabel("Loss")
        ax.set_yscale("log")
        ax.grid(True, alpha=0.3)
        self.canvas_loss.draw()

    def _plot_boundary(self, mlp: MLP, X: np.ndarray, y: np.ndarray):
        ax = self.canvas_boundary.axes
        ax.cla()

        pad = 0.3
        x_min, x_max = X[:,0].min() - pad, X[:,0].max() + pad
        y_min, y_max = X[:,1].min() - pad, X[:,1].max() + pad
        xx, yy = np.meshgrid(
            np.linspace(x_min, x_max, 200),
            np.linspace(y_min, y_max, 200),
        )
        Z = mlp.forward(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

        cf = ax.contourf(xx, yy, Z, levels=20, cmap="RdYlBu", alpha=0.8)
        self.canvas_boundary.fig.colorbar(cf, ax=ax, label="출력 확률")

        colors = ["#1565C0" if label == 0 else "#B71C1C" for label in y.ravel()]
        ax.scatter(X[:,0], X[:,1], c=colors, edgecolors="white",
                   linewidths=0.8, s=60, zorder=5)
        ax.set_title("결정 경계 (Decision Boundary)", fontsize=13, fontweight="bold")
        ax.set_xlim(x_min, x_max)
        ax.set_ylim(y_min, y_max)
        ax.grid(True, alpha=0.2)
        self.canvas_boundary.draw()

    def _plot_hidden(self, mlp: MLP, X: np.ndarray, y: np.ndarray):
        ax = self.canvas_hidden.axes
        ax.cla()

        mlp.forward(X)
        act = mlp.a1  # (n_samples, hidden1)
        n_samples, n_neurons = act.shape

        im = ax.imshow(act.T, cmap="viridis", aspect="auto",
                       vmin=0, vmax=1)
        self.canvas_hidden.fig.colorbar(im, ax=ax, label="활성화 값")

        ax.set_yticks(range(n_neurons))
        ax.set_yticklabels([f"H{i+1}" for i in range(n_neurons)], fontsize=8)
        ax.set_xticks(range(n_samples))
        ax.set_xticklabels([f"S{i+1}" for i in range(n_samples)], fontsize=8)

        if n_samples <= 20:
            for i in range(n_neurons):
                for j in range(n_samples):
                    ax.text(j, i, f"{act[j,i]:.2f}",
                            ha="center", va="center",
                            color="white", fontsize=7, fontweight="bold")

        ax.set_title("은닉층 1 활성화 히트맵", fontsize=13, fontweight="bold")
        ax.set_xlabel("샘플")
        ax.set_ylabel("은닉 뉴런")
        self.canvas_hidden.draw()


# ── 진입점 ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
