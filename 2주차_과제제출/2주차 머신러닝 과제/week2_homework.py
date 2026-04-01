"""
2주차 과제: 하이퍼파라미터 실험 (Hyperparameter Experiments)

스스로 해보기 (week2.md 628~631줄):
  1. learning_rate를 바꿔보기 (0.01, 0.1, 1.0)
  2. epochs를 바꿔보기 (100, 1000, 5000)
  3. 노이즈 크기를 바꿔보기 (scale=0.5, 2.0, 5.0)
  4. 다른 데이터로 실험하기

기반 코드: 01_linear_regression_spring.py (훅의 법칙 - 용수철 실험)
numpy로 경사 하강법(Gradient Descent)을 직접 구현
"""

import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import os

matplotlib.rcParams['font.family'] = ['Arial Unicode MS', 'DejaVu Sans']
matplotlib.rcParams['axes.unicode_minus'] = False

# 결과 저장 폴더
output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'outputs')
os.makedirs(output_dir, exist_ok=True)


# ============================================================
# 선형 회귀 - 경사 하강법 구현 (TensorFlow 없이)
# ============================================================
def train_linear_model(x, y, learning_rate=0.01, epochs=500):
    """
    numpy로 구현한 선형 회귀 (y = w*x + b)
    경사 하강법(Gradient Descent)으로 w, b 학습
    발산(NaN/inf) 감지 시 조기 종료
    """
    w, b = 0.0, 0.0
    n = len(x)
    loss_history = []
    diverged = False

    for _ in range(epochs):
        y_pred = w * x + b
        error  = y_pred - y
        loss   = np.mean(error ** 2)

        if not np.isfinite(loss):
            diverged = True
            break

        dw = (2 / n) * np.dot(error, x)
        db = (2 / n) * np.sum(error)

        w -= learning_rate * dw
        b -= learning_rate * db

        if not np.isfinite(w) or not np.isfinite(b):
            diverged = True
            break

        loss_history.append(loss)

    return w, b, loss_history, diverged


# ============================================================
# 기본 데이터 준비 (용수철 실험 - 훅의 법칙)
# ============================================================
weights      = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
true_lengths = 2 * weights + 10      # 진짜 공식: 길이 = 2*무게 + 10

np.random.seed(42)
noise            = np.random.normal(0, 1.5, len(weights))
measured_lengths = true_lengths + noise


# ============================================================
# 실험 1: Learning Rate 비교 (0.01, 0.1, 1.0)
# ============================================================
print("=" * 60)
print("실험 1: Learning Rate 변화 실험")
print("=" * 60)

lr_values = [0.01, 0.1, 1.0]
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.suptitle('Experiment 1: Learning Rate Comparison\n(epochs=500, noise_scale=1.5)', fontsize=12)

for ax, lr in zip(axes, lr_values):
    w, b, loss_hist, div = train_linear_model(weights, measured_lengths,
                                              learning_rate=lr, epochs=500)
    ax.scatter(weights, measured_lengths, color='blue', label='Measured Data', zorder=5)
    ax.plot(weights, true_lengths, 'g--', label='True Law (y=2x+10)')

    if div:
        ax.text(0.5, 0.5, 'DIVERGED\n(learning rate too large!)',
                transform=ax.transAxes, ha='center', va='center',
                fontsize=12, color='red',
                bbox=dict(boxstyle='round', facecolor='lightyellow'))
        title_str = f'learning_rate = {lr}\n발산! (Diverged)'
        print(f"  lr={lr:4.2f} -> 발산! learning rate가 너무 큼")
    else:
        final_loss = loss_hist[-1]
        plot_w = np.linspace(0, 12, 100)
        ax.plot(plot_w, w * plot_w + b, 'r-',
                label=f'AI Prediction\ny={w:.2f}x+{b:.2f}')
        title_str = f'learning_rate = {lr}\nFinal Loss: {final_loss:.4f}'
        print(f"  lr={lr:4.2f} -> 예측식: 길이 = {w:.3f} * 무게 + {b:.3f}  (Loss: {final_loss:.4f})")

    ax.set_title(title_str)
    ax.set_xlabel('Weight (kg)')
    ax.set_ylabel('Spring Length (cm)')
    ax.legend(fontsize=8)
    ax.grid(True)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'exp1_learning_rate.png'), dpi=120)
print(f"  저장 완료: outputs/exp1_learning_rate.png\n")
plt.close()

print("[관찰]")
print("  - lr=0.01: 수렴은 하지만 느림 (500번에 loss~1.18)")
print("  - lr=0.1 : 발산! gradient가 너무 크게 뛰어 NaN 발생")
print("  - lr=1.0 : 발산! 완전히 폭발")
print("  -> 핵심: learning rate는 데이터 스케일에 맞게 조정해야 함\n")


# ============================================================
# 실험 2: Epochs 비교 (100, 1000, 5000)
# ============================================================
print("=" * 60)
print("실험 2: Epochs 변화 실험")
print("=" * 60)

epoch_values = [100, 1000, 5000]
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.suptitle('Experiment 2: Epochs Comparison\n(lr=0.01, noise_scale=1.5)', fontsize=12)

all_loss_histories = {}
for ax, ep in zip(axes, epoch_values):
    w, b, loss_hist, div = train_linear_model(weights, measured_lengths,
                                              learning_rate=0.01, epochs=ep)
    all_loss_histories[ep] = loss_hist
    final_loss = loss_hist[-1]

    ax.scatter(weights, measured_lengths, color='blue', label='Measured Data', zorder=5)
    ax.plot(weights, true_lengths, 'g--', label='True Law (y=2x+10)')
    plot_w = np.linspace(0, 12, 100)
    ax.plot(plot_w, w * plot_w + b, 'r-',
            label=f'AI Prediction\ny={w:.2f}x+{b:.2f}')
    ax.set_title(f'epochs = {ep}\nFinal Loss: {final_loss:.4f}')
    ax.set_xlabel('Weight (kg)')
    ax.set_ylabel('Spring Length (cm)')
    ax.legend(fontsize=8)
    ax.grid(True)
    print(f"  epochs={ep:5d} -> 예측식: 길이 = {w:.3f} * 무게 + {b:.3f}  (Loss: {final_loss:.4f})")

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'exp2_epochs.png'), dpi=120)
print(f"  저장 완료: outputs/exp2_epochs.png\n")
plt.close()

# Loss 감소 곡선 비교
fig, ax = plt.subplots(figsize=(8, 5))
for ep, loss_hist in all_loss_histories.items():
    ax.plot(loss_hist, label=f'epochs={ep}')
ax.set_title('Loss Curve by Epochs (lr=0.01)')
ax.set_xlabel('Epoch')
ax.set_ylabel('MSE Loss')
ax.legend()
ax.grid(True)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'exp2_loss_curve.png'), dpi=120)
print(f"  Loss 곡선 저장 완료: outputs/exp2_loss_curve.png")
plt.close()

print("[관찰]")
print("  - epochs=100 : 학습 부족, 예측선이 실제와 다름 (Loss 높음)")
print("  - epochs=1000: 충분히 수렴, 좋은 예측")
print("  - epochs=5000: 1000번과 비슷 - 이미 수렴 후엔 변화 없음\n")


# ============================================================
# 실험 3: 노이즈 크기 비교 (scale=0.5, 2.0, 5.0)
# ============================================================
print("=" * 60)
print("실험 3: 노이즈 크기 변화 실험")
print("=" * 60)

noise_scales = [0.5, 2.0, 5.0]
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.suptitle('Experiment 3: Noise Scale Comparison\n(lr=0.01, epochs=500)', fontsize=12)

for ax, scale in zip(axes, noise_scales):
    np.random.seed(42)
    noisy_lengths = true_lengths + np.random.normal(0, scale, len(weights))
    w, b, loss_hist, div = train_linear_model(weights, noisy_lengths,
                                              learning_rate=0.01, epochs=500)
    final_loss = loss_hist[-1]

    ax.scatter(weights, noisy_lengths, color='blue', label='Measured Data', zorder=5)
    ax.plot(weights, true_lengths, 'g--', label='True Law (y=2x+10)')
    plot_w = np.linspace(0, 12, 100)
    ax.plot(plot_w, w * plot_w + b, 'r-',
            label=f'AI Prediction\ny={w:.2f}x+{b:.2f}')
    ax.set_title(f'noise scale = {scale}\nFinal Loss: {final_loss:.4f}')
    ax.set_xlabel('Weight (kg)')
    ax.set_ylabel('Spring Length (cm)')
    ax.legend(fontsize=8)
    ax.grid(True)
    print(f"  scale={scale:3.1f} -> 예측식: 길이 = {w:.3f} * 무게 + {b:.3f}  (Loss: {final_loss:.4f})")

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'exp3_noise_scale.png'), dpi=120)
print(f"  저장 완료: outputs/exp3_noise_scale.png\n")
plt.close()

print("[관찰]")
print("  - scale=0.5: 노이즈 작음 -> 정확한 예측, loss 낮음")
print("  - scale=2.0: 중간 노이즈 -> 대략적 예측 가능")
print("  - scale=5.0: 노이즈 큼  -> 예측선과 실제 공식이 크게 차이날 수 있음\n")


# ============================================================
# 실험 4: 다른 데이터 - 기온 vs 아이스크림 판매량
# ============================================================
print("=" * 60)
print("실험 4: 다른 데이터 - 기온 vs 아이스크림 판매량")
print("=" * 60)

# 새 데이터: 기온(°C) -> 아이스크림 판매량
# 가정: 판매량 = 5 * 기온 - 20
temperature  = np.array([10, 15, 18, 20, 22, 25, 28, 30, 32, 35], dtype=float)
true_sales   = 5 * temperature - 20

np.random.seed(7)
measured_sales = true_sales + np.random.normal(0, 8, len(temperature))

print("  [새 데이터]")
print("  기온(°C)         :", temperature)
print("  아이스크림 판매량  :", np.round(measured_sales, 1))
print(f"  실제 공식: 판매량 = 5 * 기온 - 20\n")

# 데이터 스케일이 크므로 lr을 작게 설정
lr_values_new = [0.0001, 0.001, 0.01]
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.suptitle('Experiment 4: New Data - Temperature vs Ice Cream Sales\n(epochs=2000)', fontsize=12)

for ax, lr in zip(axes, lr_values_new):
    w, b, loss_hist, div = train_linear_model(temperature, measured_sales,
                                              learning_rate=lr, epochs=2000)

    ax.scatter(temperature, measured_sales, color='orange', label='Measured Sales', zorder=5)
    ax.plot(temperature, true_sales, 'g--', label='True Law (y=5x-20)')

    if div:
        ax.text(0.5, 0.5, 'DIVERGED!',
                transform=ax.transAxes, ha='center', va='center',
                fontsize=14, color='red',
                bbox=dict(boxstyle='round', facecolor='lightyellow'))
        title_str = f'lr={lr} / epochs=2000\n발산!'
        print(f"  lr={lr:6.4f} -> 발산!")
    else:
        final_loss = loss_hist[-1]
        plot_t = np.linspace(8, 38, 100)
        ax.plot(plot_t, w * plot_t + b, 'r-',
                label=f'AI Prediction\ny={w:.2f}x+{b:.2f}')
        title_str = f'lr={lr} / epochs=2000\nFinal Loss: {final_loss:.2f}'
        print(f"  lr={lr:6.4f} -> 예측식: 판매량 = {w:.3f} * 기온 + {b:.3f}  (Loss: {final_loss:.4f})")

    ax.set_title(title_str)
    ax.set_xlabel('Temperature (C)')
    ax.set_ylabel('Ice Cream Sales')
    ax.legend(fontsize=8)
    ax.grid(True)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'exp4_new_data.png'), dpi=120)
print(f"  저장 완료: outputs/exp4_new_data.png\n")
plt.close()

print("[관찰]")
print("  - 용수철 데이터와 완전히 다른 도메인에도 동일한 선형 회귀 적용 가능")
print("  - 데이터 스케일(y값의 크기)이 크면 lr을 더 작게 설정해야 안정적\n")


# ============================================================
# 최종 요약
# ============================================================
print("=" * 60)
print("최종 요약")
print("=" * 60)
print("""
[실험 1 - Learning Rate]
  - lr=0.01: 느리지만 안정적 수렴 (데이터 스케일 0~10에 적합)
  - lr=0.1 : 발산! gradient 업데이트가 너무 큼
  - lr=1.0 : 즉시 발산! 절대 사용 불가
  -> 핵심: 데이터 스케일에 맞는 lr 선택이 중요

[실험 2 - Epochs]
  - 100번:  학습 부족, 예측 부정확
  - 1000번: 충분히 수렴, 좋은 예측
  - 5000번: 이미 수렴 후엔 추가 효과 없음 (시간만 낭비)

[실험 3 - Noise Scale]
  - 노이즈 작을수록 (0.5): 정확한 예측 가능, loss 낮음
  - 노이즈 클수록 (5.0):  예측선이 실제 공식과 멀어질 수 있음
  -> 현실 데이터는 항상 노이즈를 포함하므로 완벽한 예측은 불가능

[실험 4 - 다른 데이터]
  - 기온→아이스크림 판매량도 선형 관계라면 동일 모델 사용 가능
  - 데이터 스케일이 크면 lr을 더 작게 (0.001 이하) 조정 필요
""")
print("모든 그래프가 outputs/ 폴더에 저장되었습니다.")
