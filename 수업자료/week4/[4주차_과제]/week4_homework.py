"""
Week 4 과제 — 물리 데이터 신경망 인터랙티브 트레이너 (PySide6)

Superpowers (Claude AI) 활용 구현

Labs:
  Tab 1 — 1D 함수 근사      : Universal Approximation 인터랙티브 증명
  Tab 2 — 포물선 운동 회귀   : v₀/θ 슬라이더로 실시간 궤적 예측
  Tab 3 — 과적합/과소적합    : 3-모델 동시 학습 및 비교
  Tab 4 — 진자 주기 예측     : L/θ 슬라이더 + RK4 시뮬레이션
"""

import sys
import os
import numpy as np

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QTabWidget,
    QVBoxLayout, QHBoxLayout, QGridLayout,
    QLabel, QComboBox, QSpinBox, QDoubleSpinBox,
    QPushButton, QGroupBox, QProgressBar, QSlider, QSizePolicy,
)
from PySide6.QtCore import Qt, QThread, Signal

import matplotlib
matplotlib.use("QtAgg")
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

import tensorflow as tf
from tensorflow import keras

tf.get_logger().setLevel("ERROR")


# ── 상수 ──────────────────────────────────────────────────────────────────────

G = 9.81  # 중력 가속도 (m/s²)


# ── Matplotlib 캔버스 ─────────────────────────────────────────────────────────

class MplCanvas(FigureCanvas):
    def __init__(self, rows=1, cols=1, figsize=(9, 5)):
        self.fig = Figure(figsize=figsize, tight_layout=True)
        if rows == 1 and cols == 1:
            self.axes = np.array([[self.fig.add_subplot(111)]])
        else:
            raw = self.fig.subplots(rows, cols)
            self.axes = np.array(raw)
            if self.axes.ndim == 1:
                self.axes = self.axes.reshape(1, -1) if rows == 1 else self.axes.reshape(-1, 1)
        super().__init__(self.fig)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)

    def ax(self, r: int = 0, c: int = 0):
        return self.axes[r, c]

    def clear_all(self):
        for row in self.axes:
            for a in row:
                a.cla()


# ── 물리 헬퍼 함수 ────────────────────────────────────────────────────────────

def pendulum_period(L: float, theta_deg: float) -> float:
    """타원 적분 근사를 포함한 진자 주기"""
    rad = np.deg2rad(theta_deg)
    T0 = 2 * np.pi * np.sqrt(L / G)
    return T0 * (1 + (1/16)*rad**2 + (11/3072)*rad**4)


def rk4_pendulum(L: float, theta0_deg: float, n_periods: int = 3, dt: float = 0.01):
    """Runge-Kutta 4차 진자 시뮬레이션"""
    T = pendulum_period(L, theta0_deg)
    t_max = T * n_periods
    theta = np.deg2rad(theta0_deg)
    omega = 0.0
    ts, ths, oms = [0.0], [theta], [0.0]
    t = dt
    while t < t_max:
        th, om = ths[-1], oms[-1]
        k1t, k1o = om, -(G / L) * np.sin(th)
        k2t, k2o = om + 0.5*dt*k1o, -(G/L)*np.sin(th + 0.5*dt*k1t)
        k3t, k3o = om + 0.5*dt*k2o, -(G/L)*np.sin(th + 0.5*dt*k2t)
        k4t, k4o = om + dt*k3o,      -(G/L)*np.sin(th + dt*k3t)
        theta = th + (dt/6)*(k1t + 2*k2t + 2*k3t + k4t)
        omega = om + (dt/6)*(k1o + 2*k2o + 2*k3o + k4o)
        ts.append(t); ths.append(theta); oms.append(omega)
        t += dt
    return np.array(ts), np.rad2deg(np.array(ths)), np.array(oms)


# ── TF 모델 빌더 ──────────────────────────────────────────────────────────────

ARCH_MAP = {
    "Small [32]":             [32],
    "Medium [64, 64]":        [64, 64],
    "Large [128, 128]":       [128, 128],
    "Very Large [128,128,64]":[128, 128, 64],
}


def build_1d_model(layers, act="tanh", lr=0.01):
    m = keras.Sequential([keras.layers.Input(shape=(1,))])
    for u in layers:
        m.add(keras.layers.Dense(u, activation=act))
    m.add(keras.layers.Dense(1))
    m.compile(optimizer=keras.optimizers.Adam(lr), loss="mse", metrics=["mae"])
    return m


def build_projectile_model():
    m = keras.Sequential([
        keras.layers.Input(shape=(3,)),
        keras.layers.Dense(128, activation="relu"), keras.layers.Dropout(0.1),
        keras.layers.Dense(64,  activation="relu"), keras.layers.Dropout(0.1),
        keras.layers.Dense(32,  activation="relu"), keras.layers.Dropout(0.1),
        keras.layers.Dense(2),
    ])
    m.compile(optimizer=keras.optimizers.Adam(0.001), loss="mse", metrics=["mae"])
    return m


def build_pendulum_model():
    m = keras.Sequential([
        keras.layers.Input(shape=(2,)),
        keras.layers.Dense(64, activation="relu"), keras.layers.Dropout(0.1),
        keras.layers.Dense(32, activation="relu"), keras.layers.Dropout(0.1),
        keras.layers.Dense(16, activation="relu"), keras.layers.Dropout(0.1),
        keras.layers.Dense(1),
    ])
    m.compile(optimizer=keras.optimizers.Adam(0.001), loss="mse", metrics=["mae"])
    return m


# ── 공통 Progress Callback 팩토리 ─────────────────────────────────────────────

def make_progress_cb(worker, total: int):
    """Signal(int, float) 을 가진 worker에 대한 Keras 콜백 생성"""
    class _CB(keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            pct = int((epoch + 1) / total * 100)
            worker.progress.emit(pct, float(logs.get("loss", 0.0)))
    return _CB()


# ── 학습 스레드 (4종) ─────────────────────────────────────────────────────────

class Worker1D(QThread):
    progress = Signal(int, float)
    finished = Signal(object, object, object)   # model, history, data_tuple

    def __init__(self, fn_name, arch_name, act, epochs):
        super().__init__()
        self.fn_name = fn_name; self.arch_name = arch_name
        self.act = act; self.epochs = epochs

    def run(self):
        x_tr = np.linspace(-2*np.pi, 2*np.pi, 200).reshape(-1, 1)
        x_te = np.linspace(-2*np.pi, 2*np.pi, 400).reshape(-1, 1)
        fn_map = {
            "sin(x)":             (np.sin(x_tr), np.sin(x_te)),
            "cos(x)+0.5·sin(2x)": (np.cos(x_tr)+0.5*np.sin(2*x_tr),
                                    np.cos(x_te)+0.5*np.sin(2*x_te)),
            "x·sin(x)":           (x_tr*np.sin(x_tr), x_te*np.sin(x_te)),
            "복합함수":            (np.sin(x_tr)+0.5*np.sin(2*x_tr)+0.3*np.cos(3*x_tr),
                                    np.sin(x_te)+0.5*np.sin(2*x_te)+0.3*np.cos(3*x_te)),
        }
        y_tr, y_te = fn_map[self.fn_name]
        model = build_1d_model(ARCH_MAP[self.arch_name], self.act)
        h = model.fit(
            x_tr, y_tr, epochs=self.epochs, batch_size=32, verbose=0,
            callbacks=[
                make_progress_cb(self, self.epochs),
                keras.callbacks.ReduceLROnPlateau(monitor="loss", factor=0.9,
                                                   patience=100, min_lr=1e-5, verbose=0),
            ],
        )
        self.finished.emit(model, h, (x_tr, y_tr, x_te, y_te))


class WorkerProjectile(QThread):
    progress = Signal(int, float)
    finished = Signal(object, object)   # model, history

    def run(self):
        np.random.seed(42)
        n = 2000
        v0    = np.random.uniform(10, 50, n)
        theta = np.random.uniform(20, 70, n)
        tr    = np.deg2rad(theta)
        t_max = 2 * v0 * np.sin(tr) / G
        t     = np.random.uniform(0, t_max * 0.9, n)
        x = v0*np.cos(tr)*t + np.random.normal(0, 0.5, n)
        y = v0*np.sin(tr)*t - 0.5*G*t**2 + np.random.normal(0, 0.5, n)
        valid = y >= 0
        X = np.column_stack([v0[valid], theta[valid], t[valid]])
        Y = np.column_stack([x[valid], y[valid]])
        model = build_projectile_model()
        h = model.fit(X, Y, validation_split=0.2, epochs=100, batch_size=32, verbose=0,
                      callbacks=[make_progress_cb(self, 100)])
        self.finished.emit(model, h)


class WorkerOverfit(QThread):
    progress = Signal(int, float)
    finished = Signal(object, object, object, object)  # models, histories, x_te, y_te

    def __init__(self, n_train: int, noise: float, epochs: int):
        super().__init__()
        self.n_train = n_train; self.noise = noise; self.epochs = epochs

    def run(self):
        np.random.seed(42)
        x_tr  = np.random.uniform(-2, 2, self.n_train).reshape(-1, 1)
        y_tr  = np.sin(2*x_tr) + 0.5*x_tr + np.random.normal(0, self.noise, (self.n_train, 1))
        x_val = np.random.uniform(-2, 2, 50).reshape(-1, 1)
        y_val = np.sin(2*x_val) + 0.5*x_val + np.random.normal(0, self.noise, (50, 1))
        x_te  = np.linspace(-2, 2, 200).reshape(-1, 1)
        y_te  = np.sin(2*x_te) + 0.5*x_te

        def _make(layers, dropout=False):
            seqs = [keras.layers.Input(shape=(1,))]
            for u in layers:
                seqs.append(keras.layers.Dense(u, activation="relu"))
                if dropout:
                    seqs.append(keras.layers.Dropout(0.2))
            seqs.append(keras.layers.Dense(1))
            m = keras.Sequential(seqs)
            m.compile(optimizer=keras.optimizers.Adam(0.001), loss="mse")
            return m

        configs = {
            "Underfit [4]":          _make([4]),
            "Good Fit [32-16+Drop]": _make([32, 16], dropout=True),
            "Overfit [256-128-64]":  _make([256, 128, 64]),
        }
        total_steps = len(configs) * self.epochs
        models, histories = {}, {}
        step = 0

        for name, model in configs.items():
            _step = step  # capture for closure

            class _CB(keras.callbacks.Callback):
                def __init__(self_cb, w, s, total):
                    super().__init__()
                    self_cb._w = w; self_cb._s = s; self_cb._total = total

                def on_epoch_end(self_cb, epoch, logs=None):
                    pct = int((self_cb._s + epoch + 1) / self_cb._total * 100)
                    self_cb._w.progress.emit(pct, float(logs.get("loss", 0.0)))

            h = model.fit(
                x_tr, y_tr,
                validation_data=(x_val, y_val),
                epochs=self.epochs, batch_size=16, verbose=0,
                callbacks=[_CB(self, _step, total_steps)],
            )
            models[name] = model
            histories[name] = h
            step += self.epochs

        self.finished.emit(models, histories, x_te, y_te)


class WorkerPendulum(QThread):
    progress = Signal(int, float)
    finished = Signal(object, object)   # model, history

    def run(self):
        np.random.seed(42)
        n      = 2000
        L      = np.random.uniform(0.5, 3.0, n)
        theta0 = np.random.uniform(5, 80, n)
        T_true = np.array([pendulum_period(L[i], theta0[i]) for i in range(n)])
        T_noisy = T_true * (1 + np.random.normal(0, 0.01, n))
        X = np.column_stack([L, theta0])
        Y = T_noisy.reshape(-1, 1)
        model = build_pendulum_model()
        h = model.fit(X, Y, validation_split=0.2, epochs=200, batch_size=32, verbose=0,
                      callbacks=[make_progress_cb(self, 200)])
        self.finished.emit(model, h)


# ── Tab 1: 1D 함수 근사 ───────────────────────────────────────────────────────

class Tab1_FuncApprox(QWidget):
    def __init__(self):
        super().__init__()
        self.worker = None
        layout = QHBoxLayout(self)
        layout.addWidget(self._make_controls(), stretch=0)
        self.canvas = MplCanvas(rows=1, cols=3, figsize=(13, 4))
        layout.addWidget(self.canvas, stretch=1)

    def _make_controls(self):
        w = QWidget(); w.setFixedWidth(235)
        v = QVBoxLayout(w)

        cfg = QGroupBox("신경망 설정")
        g = QGridLayout(cfg)

        g.addWidget(QLabel("함수:"), 0, 0)
        self.cb_fn = QComboBox()
        self.cb_fn.addItems(["sin(x)", "cos(x)+0.5·sin(2x)", "x·sin(x)", "복합함수"])
        g.addWidget(self.cb_fn, 0, 1)

        g.addWidget(QLabel("네트워크:"), 1, 0)
        self.cb_arch = QComboBox()
        self.cb_arch.addItems(list(ARCH_MAP.keys()))
        self.cb_arch.setCurrentIndex(1)
        g.addWidget(self.cb_arch, 1, 1)

        g.addWidget(QLabel("활성화 함수:"), 2, 0)
        self.cb_act = QComboBox()
        self.cb_act.addItems(["tanh", "relu"])
        g.addWidget(self.cb_act, 2, 1)

        g.addWidget(QLabel("Epochs:"), 3, 0)
        self.sp_ep = QSpinBox()
        self.sp_ep.setRange(200, 5000); self.sp_ep.setValue(1000); self.sp_ep.setSingleStep(200)
        g.addWidget(self.sp_ep, 3, 1)
        v.addWidget(cfg)

        tb = QGroupBox("학습")
        tv = QVBoxLayout(tb)
        self.btn = QPushButton("▶ 학습 시작")
        self.btn.setFixedHeight(34)
        self.btn.clicked.connect(self._train)
        tv.addWidget(self.btn)
        self.pb = QProgressBar(); self.pb.setRange(0, 100)
        tv.addWidget(self.pb)
        self.lbl = QLabel("준비됨"); self.lbl.setAlignment(Qt.AlignCenter)
        tv.addWidget(self.lbl)
        v.addWidget(tb)

        rb = QGroupBox("결과")
        rv = QGridLayout(rb)
        rv.addWidget(QLabel("MSE:"), 0, 0); self.lbl_mse = QLabel("—"); rv.addWidget(self.lbl_mse, 0, 1)
        rv.addWidget(QLabel("MAE:"), 1, 0); self.lbl_mae = QLabel("—"); rv.addWidget(self.lbl_mae, 1, 1)
        rv.addWidget(QLabel("Max 오차:"), 2, 0); self.lbl_max = QLabel("—"); rv.addWidget(self.lbl_max, 2, 1)
        v.addWidget(rb)

        hint = QGroupBox("Universal Approximation")
        hv = QVBoxLayout(hint)
        hv.addWidget(QLabel("네트워크가 클수록\n함수를 더 정밀하게 근사\n→ 수학적 증명을 시각화"))
        v.addWidget(hint)
        v.addStretch()
        return w

    def _train(self):
        if self.worker and self.worker.isRunning():
            return
        self.btn.setEnabled(False); self.btn.setText("학습 중...")
        self.pb.setValue(0)
        self.worker = Worker1D(
            self.cb_fn.currentText(), self.cb_arch.currentText(),
            self.cb_act.currentText(), self.sp_ep.value()
        )
        self.worker.progress.connect(lambda p, l: (self.pb.setValue(p), self.lbl.setText(f"Loss: {l:.5f}")))
        self.worker.finished.connect(self._done)
        self.worker.start()

    def _done(self, model, history, data):
        self.btn.setEnabled(True); self.btn.setText("▶ 학습 시작")
        self.pb.setValue(100); self.lbl.setText("완료!")
        x_tr, y_tr, x_te, y_te = data
        y_pred = model.predict(x_te, verbose=0)
        mse = float(np.mean((y_pred - y_te)**2))
        mae = float(np.mean(np.abs(y_pred - y_te)))
        maxe = float(np.max(np.abs(y_pred - y_te)))
        self.lbl_mse.setText(f"{mse:.6f}")
        self.lbl_mae.setText(f"{mae:.6f}")
        self.lbl_max.setText(f"{maxe:.6f}")
        self._plot(x_tr, y_tr, x_te, y_te, y_pred, history)

    def _plot(self, x_tr, y_tr, x_te, y_te, y_pred, history):
        self.canvas.clear_all()
        # 1. 함수 근사
        ax1 = self.canvas.ax(0, 0)
        ax1.plot(x_te, y_te, "b-", lw=2.5, label="실제 함수", alpha=0.8)
        ax1.plot(x_te, y_pred, "r--", lw=2, label="NN 예측")
        ax1.scatter(x_tr[::5], y_tr[::5], c="gray", s=12, alpha=0.4, zorder=3)
        ax1.set_title(f"{self.cb_fn.currentText()} 근사\n[{self.cb_arch.currentText()}]",
                      fontsize=11, fontweight="bold")
        ax1.legend(fontsize=9); ax1.grid(True, alpha=0.3)
        # 2. Loss 곡선
        ax2 = self.canvas.ax(0, 1)
        ax2.plot(history.history["loss"], "g-", lw=1.5, label="Train Loss")
        ax2.set_yscale("log"); ax2.set_xlabel("Epoch"); ax2.set_ylabel("MSE")
        ax2.set_title("Training Loss (log scale)", fontsize=11, fontweight="bold")
        ax2.legend(fontsize=9); ax2.grid(True, alpha=0.3)
        # 3. 절대 오차
        ax3 = self.canvas.ax(0, 2)
        err = np.abs(y_pred - y_te)
        ax3.plot(x_te, err, "r-", lw=1.5)
        ax3.fill_between(x_te.flatten(), 0, err.flatten(), color="r", alpha=0.25)
        ax3.set_title(f"절대 오차 분포 (Max={float(np.max(err)):.4f})",
                      fontsize=11, fontweight="bold")
        ax3.set_xlabel("x"); ax3.set_ylabel("|오차|")
        ax3.grid(True, alpha=0.3)
        self.canvas.fig.suptitle("Lab 1: Universal Approximation Theorem 증명", fontsize=13)
        self.canvas.draw()


# ── Tab 2: 포물선 운동 ────────────────────────────────────────────────────────

class Tab2_Projectile(QWidget):
    def __init__(self):
        super().__init__()
        self.model = None; self.worker = None
        layout = QHBoxLayout(self)
        layout.addWidget(self._make_controls(), stretch=0)
        self.canvas = MplCanvas(rows=1, cols=3, figsize=(13, 4))
        layout.addWidget(self.canvas, stretch=1)

    def _make_controls(self):
        w = QWidget(); w.setFixedWidth(235)
        v = QVBoxLayout(w)

        tb = QGroupBox("1단계: 모델 학습")
        tv = QVBoxLayout(tb)
        self.btn = QPushButton("▶ 모델 학습 (100 epochs)")
        self.btn.setFixedHeight(34)
        self.btn.clicked.connect(self._train)
        tv.addWidget(self.btn)
        self.pb = QProgressBar(); self.pb.setRange(0, 100)
        tv.addWidget(self.pb)
        self.lbl = QLabel("학습 전 — 먼저 모델을 학습하세요")
        self.lbl.setAlignment(Qt.AlignCenter); self.lbl.setWordWrap(True)
        tv.addWidget(self.lbl)
        v.addWidget(tb)

        cfg = QGroupBox("2단계: 인터랙티브 파라미터")
        g = QGridLayout(cfg)

        g.addWidget(QLabel("초기 속도 v₀ (m/s):"), 0, 0, 1, 2)
        self.sl_v0 = QSlider(Qt.Horizontal)
        self.sl_v0.setRange(10, 50); self.sl_v0.setValue(30)
        self.lbl_v0 = QLabel("30 m/s")
        self.sl_v0.valueChanged.connect(
            lambda val: (self.lbl_v0.setText(f"{val} m/s"), self._update_plot()))
        g.addWidget(self.sl_v0, 1, 0); g.addWidget(self.lbl_v0, 1, 1)

        g.addWidget(QLabel("발사 각도 θ (°):"), 2, 0, 1, 2)
        self.sl_th = QSlider(Qt.Horizontal)
        self.sl_th.setRange(20, 70); self.sl_th.setValue(45)
        self.lbl_th = QLabel("45°")
        self.sl_th.valueChanged.connect(
            lambda val: (self.lbl_th.setText(f"{val}°"), self._update_plot()))
        g.addWidget(self.sl_th, 3, 0); g.addWidget(self.lbl_th, 3, 1)
        v.addWidget(cfg)

        rb = QGroupBox("예측 결과")
        rv = QGridLayout(rb)
        for lbl_text, attr in [("최대 높이:", "lbl_h"), ("최대 거리:", "lbl_r"), ("MSE:", "lbl_mse")]:
            row = rv.rowCount()
            rv.addWidget(QLabel(lbl_text), row, 0)
            lbl = QLabel("—"); setattr(self, attr, lbl)
            rv.addWidget(lbl, row, 1)
        v.addWidget(rb)
        v.addStretch()
        return w

    def _train(self):
        if self.worker and self.worker.isRunning():
            return
        self.btn.setEnabled(False); self.btn.setText("학습 중...")
        self.pb.setValue(0)
        self.worker = WorkerProjectile()
        self.worker.progress.connect(lambda p, l: (self.pb.setValue(p), self.lbl.setText(f"Loss: {l:.4f}")))
        self.worker.finished.connect(self._done)
        self.worker.start()

    def _done(self, model, history):
        self.model = model
        self.btn.setEnabled(True); self.btn.setText("▶ 재학습")
        self.pb.setValue(100); self.lbl.setText("완료! 슬라이더를 조정하세요.")
        self._update_plot()

    def _update_plot(self):
        if self.model is None:
            return
        v0    = float(self.sl_v0.value())
        theta = float(self.sl_th.value())
        tr    = np.deg2rad(theta)
        t_max = 2 * v0 * np.sin(tr) / G
        t     = np.linspace(0, t_max, 60)
        X_in  = np.column_stack([np.full(60, v0), np.full(60, theta), t])
        pred  = self.model.predict(X_in, verbose=0)
        x_pred, y_pred = pred[:, 0], pred[:, 1]
        x_true = v0 * np.cos(tr) * t
        y_true = v0 * np.sin(tr) * t - 0.5 * G * t**2

        self.lbl_h.setText(f"{float(np.max(y_true)):.2f} m")
        self.lbl_r.setText(f"{float(np.max(x_true)):.2f} m")
        mse = float(np.mean((x_pred-x_true)**2 + (y_pred-y_true)**2))
        self.lbl_mse.setText(f"{mse:.4f}")

        self.canvas.clear_all()
        ax1 = self.canvas.ax(0, 0)
        ax1.plot(x_true, y_true, "b-", lw=2.5, label="물리 공식", alpha=0.8)
        ax1.plot(x_pred, y_pred, "r--", lw=2, label="NN 예측")
        ax1.set_xlabel("x (m)"); ax1.set_ylabel("y (m)")
        ax1.set_title(f"포물선 궤적  v₀={v0:.0f} m/s, θ={theta:.0f}°", fontsize=11, fontweight="bold")
        ax1.legend(fontsize=9); ax1.grid(True, alpha=0.3)
        ax1.set_xlim(left=0); ax1.set_ylim(bottom=0)

        ax2 = self.canvas.ax(0, 1)
        ax2.plot(t, x_true, "b-", lw=2, label="True x", alpha=0.8)
        ax2.plot(t, x_pred, "r--", lw=2, label="Pred x")
        ax2.set_xlabel("Time (s)"); ax2.set_ylabel("x (m)")
        ax2.set_title("수평 위치 x(t)", fontsize=11, fontweight="bold")
        ax2.legend(fontsize=9); ax2.grid(True, alpha=0.3)

        ax3 = self.canvas.ax(0, 2)
        ax3.plot(t, y_true, "b-", lw=2, label="True y", alpha=0.8)
        ax3.plot(t, y_pred, "r--", lw=2, label="Pred y")
        ax3.set_xlabel("Time (s)"); ax3.set_ylabel("y (m)")
        ax3.set_title("수직 위치 y(t)", fontsize=11, fontweight="bold")
        ax3.legend(fontsize=9); ax3.grid(True, alpha=0.3)

        self.canvas.fig.suptitle("Lab 2: 포물선 운동 회귀 — 물리 법칙을 데이터에서 학습", fontsize=13)
        self.canvas.draw()


# ── Tab 3: 과적합/과소적합 ────────────────────────────────────────────────────

class Tab3_Overfitting(QWidget):
    def __init__(self):
        super().__init__()
        self.worker = None
        layout = QHBoxLayout(self)
        layout.addWidget(self._make_controls(), stretch=0)
        self.canvas = MplCanvas(rows=2, cols=3, figsize=(13, 8))
        layout.addWidget(self.canvas, stretch=1)

    def _make_controls(self):
        w = QWidget(); w.setFixedWidth(235)
        v = QVBoxLayout(w)

        cfg = QGroupBox("실험 설정")
        g = QGridLayout(cfg)
        g.addWidget(QLabel("노이즈:"), 0, 0)
        self.sp_noise = QDoubleSpinBox()
        self.sp_noise.setRange(0.05, 1.0); self.sp_noise.setSingleStep(0.05); self.sp_noise.setValue(0.3)
        g.addWidget(self.sp_noise, 0, 1)

        g.addWidget(QLabel("학습 데이터 수:"), 1, 0)
        self.sp_n = QSpinBox(); self.sp_n.setRange(30, 300); self.sp_n.setValue(100)
        g.addWidget(self.sp_n, 1, 1)

        g.addWidget(QLabel("Epochs:"), 2, 0)
        self.sp_ep = QSpinBox(); self.sp_ep.setRange(50, 500); self.sp_ep.setValue(200); self.sp_ep.setSingleStep(50)
        g.addWidget(self.sp_ep, 2, 1)
        v.addWidget(cfg)

        tb = QGroupBox("학습")
        tv = QVBoxLayout(tb)
        self.btn = QPushButton("▶ 3모델 동시 학습")
        self.btn.setFixedHeight(34)
        self.btn.clicked.connect(self._train)
        tv.addWidget(self.btn)
        self.pb = QProgressBar(); self.pb.setRange(0, 100)
        tv.addWidget(self.pb)
        self.lbl = QLabel("준비됨"); self.lbl.setAlignment(Qt.AlignCenter)
        tv.addWidget(self.lbl)
        v.addWidget(tb)

        info = QGroupBox("모델 구조 설명")
        iv = QVBoxLayout(info)
        iv.addWidget(QLabel("Underfit [4]\n  너무 단순 → 패턴 학습 못함"))
        iv.addWidget(QLabel(""))
        iv.addWidget(QLabel("Good Fit [32-16+Dropout]\n  적절한 복잡도 → 일반화 최고"))
        iv.addWidget(QLabel(""))
        iv.addWidget(QLabel("Overfit [256-128-64]\n  너무 복잡 → 노이즈까지 학습"))
        v.addWidget(info)
        v.addStretch()
        return w

    def _train(self):
        if self.worker and self.worker.isRunning():
            return
        self.btn.setEnabled(False); self.btn.setText("학습 중...")
        self.pb.setValue(0)
        self.worker = WorkerOverfit(self.sp_n.value(), self.sp_noise.value(), self.sp_ep.value())
        self.worker.progress.connect(lambda p, l: (self.pb.setValue(p), self.lbl.setText(f"Loss: {l:.4f}")))
        self.worker.finished.connect(self._done)
        self.worker.start()

    def _done(self, models, histories, x_te, y_te):
        self.btn.setEnabled(True); self.btn.setText("▶ 3모델 동시 학습")
        self.pb.setValue(100); self.lbl.setText("완료!")
        self.canvas.clear_all()
        colors = {"Underfit [4]": "#1565C0", "Good Fit [32-16+Drop]": "#2E7D32", "Overfit [256-128-64]": "#C62828"}
        for idx, (name, model) in enumerate(models.items()):
            short = name.split("\n")[0]
            c = list(colors.values())[idx]
            y_pred = model.predict(x_te, verbose=0)
            # Row 0: 예측 비교
            ax = self.canvas.axes[0, idx]
            ax.plot(x_te, y_te, "k-", lw=2, label="실제 함수", alpha=0.7)
            ax.plot(x_te, y_pred, "--", color=c, lw=2, label=short)
            ax.set_title(short, fontsize=12, fontweight="bold", color=c)
            ax.legend(fontsize=9); ax.grid(True, alpha=0.3)
            # Row 1: 학습 곡선
            ax2 = self.canvas.axes[1, idx]
            h = histories[name]
            ax2.plot(h.history["loss"],     "-",  color=c, lw=2, label="Train")
            ax2.plot(h.history["val_loss"], "--", color=c, lw=2, label="Val")
            ax2.set_yscale("log"); ax2.set_xlabel("Epoch"); ax2.set_ylabel("Loss")
            ax2.set_title(f"{short} — Loss 곡선", fontsize=11, fontweight="bold")
            ax2.legend(fontsize=9); ax2.grid(True, alpha=0.3)
        self.canvas.fig.suptitle("Lab 3: 과적합 vs 과소적합 비교", fontsize=13)
        self.canvas.draw()


# ── Tab 4: 진자 주기 예측 ─────────────────────────────────────────────────────

class Tab4_Pendulum(QWidget):
    def __init__(self):
        super().__init__()
        self.model = None; self.worker = None
        layout = QHBoxLayout(self)
        layout.addWidget(self._make_controls(), stretch=0)
        self.canvas = MplCanvas(rows=2, cols=2, figsize=(11, 7))
        layout.addWidget(self.canvas, stretch=1)

    def _make_controls(self):
        w = QWidget(); w.setFixedWidth(235)
        v = QVBoxLayout(w)

        tb = QGroupBox("1단계: 모델 학습")
        tv = QVBoxLayout(tb)
        self.btn = QPushButton("▶ 모델 학습 (200 epochs)")
        self.btn.setFixedHeight(34)
        self.btn.clicked.connect(self._train)
        tv.addWidget(self.btn)
        self.pb = QProgressBar(); self.pb.setRange(0, 100)
        tv.addWidget(self.pb)
        self.lbl = QLabel("학습 전 — 먼저 모델을 학습하세요")
        self.lbl.setAlignment(Qt.AlignCenter); self.lbl.setWordWrap(True)
        tv.addWidget(self.lbl)
        v.addWidget(tb)

        cfg = QGroupBox("2단계: 인터랙티브 파라미터")
        g = QGridLayout(cfg)

        g.addWidget(QLabel("길이 L (0.5 ~ 3.0 m):"), 0, 0, 1, 2)
        self.sl_L = QSlider(Qt.Horizontal)
        self.sl_L.setRange(5, 30); self.sl_L.setValue(10)
        self.lbl_L = QLabel("1.0 m")
        self.sl_L.valueChanged.connect(
            lambda val: (self.lbl_L.setText(f"{val/10:.1f} m"), self._update_plot()))
        g.addWidget(self.sl_L, 1, 0); g.addWidget(self.lbl_L, 1, 1)

        g.addWidget(QLabel("초기 각도 θ₀ (5 ~ 80°):"), 2, 0, 1, 2)
        self.sl_th = QSlider(Qt.Horizontal)
        self.sl_th.setRange(5, 80); self.sl_th.setValue(30)
        self.lbl_th = QLabel("30°")
        self.sl_th.valueChanged.connect(
            lambda val: (self.lbl_th.setText(f"{val}°"), self._update_plot()))
        g.addWidget(self.sl_th, 3, 0); g.addWidget(self.lbl_th, 3, 1)
        v.addWidget(cfg)

        rb = QGroupBox("예측 결과")
        rv = QGridLayout(rb)
        for text, attr in [("NN 예측 주기:", "lbl_Tp"), ("실제 주기:", "lbl_Tt"), ("오차:", "lbl_err")]:
            row = rv.rowCount()
            rv.addWidget(QLabel(text), row, 0)
            lbl = QLabel("—"); setattr(self, attr, lbl)
            rv.addWidget(lbl, row, 1)
        v.addWidget(rb)

        physics = QGroupBox("물리적 통찰")
        pv = QVBoxLayout(physics)
        pv.addWidget(QLabel("• 작은 각도: 등시성 (T ≈ T₀)\n• 큰 각도: 주기 증가\n• L ↑ 4배 → T ↑ 2배 (√L 관계)"))
        v.addWidget(physics)
        v.addStretch()
        return w

    def _train(self):
        if self.worker and self.worker.isRunning():
            return
        self.btn.setEnabled(False); self.btn.setText("학습 중...")
        self.pb.setValue(0)
        self.worker = WorkerPendulum()
        self.worker.progress.connect(lambda p, l: (self.pb.setValue(p), self.lbl.setText(f"Loss: {l:.6f}")))
        self.worker.finished.connect(self._done)
        self.worker.start()

    def _done(self, model, history):
        self.model = model
        self.btn.setEnabled(True); self.btn.setText("▶ 재학습")
        self.pb.setValue(100); self.lbl.setText("완료! 슬라이더를 조정하세요.")
        self._update_plot()

    def _update_plot(self):
        if self.model is None:
            return
        L      = self.sl_L.value() / 10.0
        theta0 = float(self.sl_th.value())

        T_true = pendulum_period(L, theta0)
        T_pred = float(self.model.predict(np.array([[L, theta0]]), verbose=0)[0, 0])
        err    = abs(T_pred - T_true)
        self.lbl_Tp.setText(f"{T_pred:.4f} s")
        self.lbl_Tt.setText(f"{T_true:.4f} s")
        self.lbl_err.setText(f"{err:.4f} s ({err/T_true*100:.2f}%)")

        # 곡선 데이터
        angles  = np.linspace(5, 80, 60)
        lengths = np.linspace(0.5, 3.0, 50)
        T_pa = self.model.predict(np.column_stack([np.full(60, L), angles]),  verbose=0).flatten()
        T_ta = np.array([pendulum_period(L, a) for a in angles])
        T_pl = self.model.predict(np.column_stack([lengths, np.full(50, theta0)]), verbose=0).flatten()
        T_tl = np.array([pendulum_period(l, theta0) for l in lengths])

        # RK4
        ts, ths, oms = rk4_pendulum(L, theta0, n_periods=3)

        self.canvas.clear_all()

        # (0,0) 주기 vs 각도
        ax1 = self.canvas.axes[0, 0]
        ax1.plot(angles, T_ta, "b-", lw=2.5, label="물리 공식", alpha=0.8)
        ax1.plot(angles, T_pa, "r--", lw=2, label="NN 예측")
        ax1.axvline(theta0, color="g", lw=1.5, linestyle=":", label=f"현재 θ={theta0:.0f}°")
        ax1.set_xlabel("초기 각도 (°)"); ax1.set_ylabel("주기 T (s)")
        ax1.set_title(f"주기 vs 각도 (L={L:.1f} m)", fontsize=11, fontweight="bold")
        ax1.legend(fontsize=9); ax1.grid(True, alpha=0.3)

        # (0,1) 주기 vs 길이
        ax2 = self.canvas.axes[0, 1]
        ax2.plot(lengths, T_tl, "b-", lw=2.5, label="물리 공식", alpha=0.8)
        ax2.plot(lengths, T_pl, "r--", lw=2, label="NN 예측")
        ax2.axvline(L, color="g", lw=1.5, linestyle=":", label=f"현재 L={L:.1f}m")
        ax2.set_xlabel("길이 L (m)"); ax2.set_ylabel("주기 T (s)")
        ax2.set_title(f"주기 vs 길이 (θ₀={theta0:.0f}°)", fontsize=11, fontweight="bold")
        ax2.legend(fontsize=9); ax2.grid(True, alpha=0.3)

        # (1,0) RK4 각도-시간 그래프
        ax3 = self.canvas.axes[1, 0]
        ax3.plot(ts, ths, "b-", lw=2)
        for i in range(1, 4):
            ax3.axvline(T_true * i, color="r", lw=1, linestyle="--", alpha=0.5)
        ax3.set_xlabel("시간 (s)"); ax3.set_ylabel("각도 (°)")
        ax3.set_title(f"RK4 시뮬레이션  T_true={T_true:.3f}s  T_pred={T_pred:.3f}s",
                      fontsize=11, fontweight="bold")
        ax3.grid(True, alpha=0.3)

        # (1,1) 위상 공간
        ax4 = self.canvas.axes[1, 1]
        ax4.plot(ths, np.rad2deg(oms), "g-", lw=1.5, alpha=0.8)
        ax4.plot(ths[0], np.rad2deg(oms[0]), "ro", ms=9, label="시작점")
        ax4.set_xlabel("각도 (°)"); ax4.set_ylabel("각속도 (°/s)")
        ax4.set_title("위상 공간 (Phase Space)", fontsize=11, fontweight="bold")
        ax4.legend(fontsize=9); ax4.grid(True, alpha=0.3)

        self.canvas.fig.suptitle(
            f"Lab 4: 진자 주기 예측 + RK4 시뮬레이션   L={L:.1f}m  θ₀={theta0:.0f}°", fontsize=13)
        self.canvas.draw()


# ── 메인 윈도우 ───────────────────────────────────────────────────────────────

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Week 4 과제 — 물리 데이터 신경망 인터랙티브 트레이너")
        self.resize(1350, 750)
        tabs = QTabWidget()
        tabs.addTab(Tab1_FuncApprox(), "Lab 1: 1D 함수 근사")
        tabs.addTab(Tab2_Projectile(), "Lab 2: 포물선 운동")
        tabs.addTab(Tab3_Overfitting(), "Lab 3: 과적합/과소적합")
        tabs.addTab(Tab4_Pendulum(), "Lab 4: 진자 주기 + RK4")
        self.setCentralWidget(tabs)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
