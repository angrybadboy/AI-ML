// 사전 계산된 학습 메트릭 (01_regularization.py, 02_overfitting_underfitting.py 기반)

export const regularizationData = Array.from({ length: 10 }, (_, i) => ({
  epoch: i + 1,
  none:       [0.42, 0.38, 0.35, 0.34, 0.36, 0.39, 0.42, 0.45, 0.48, 0.52][i],
  l2:         [0.43, 0.39, 0.36, 0.34, 0.33, 0.33, 0.33, 0.34, 0.34, 0.35][i],
  dropout:    [0.45, 0.40, 0.37, 0.35, 0.34, 0.33, 0.33, 0.32, 0.32, 0.32][i],
  batch_norm: [0.40, 0.35, 0.32, 0.30, 0.29, 0.29, 0.28, 0.28, 0.28, 0.28][i],
}));

// Overfitting vs Underfitting — 검증 손실 곡선
export const overfittingLossData = Array.from({ length: 20 }, (_, i) => {
  const epoch = (i + 1) * 10;
  return {
    epoch,
    underfit:  Math.max(0.08, 0.15 - i * 0.002 + Math.sin(i * 0.3) * 0.005),
    balanced:  Math.max(0.01, 0.12 - i * 0.005 + Math.sin(i * 0.5) * 0.003),
    overfit:   0.10 - i * 0.008 + Math.max(0, (i - 8) * 0.015) + Math.sin(i * 0.4) * 0.005,
  };
});

// Overfitting vs Underfitting — 예측 곡선 데이터
export const predictionData = Array.from({ length: 50 }, (_, i) => {
  const x = -3 + (6 * i) / 49;
  const truth = Math.sin(x);
  return {
    x: Number(x.toFixed(2)),
    truth: Number(truth.toFixed(3)),
    underfit: Number((0.05 * x).toFixed(3)),
    balanced: Number((Math.sin(x) + (Math.random() - 0.5) * 0.08).toFixed(3)),
    overfit: Number(
      (Math.sin(x) + Math.sin(3 * x) * 0.3 + Math.sin(7 * x) * 0.15).toFixed(3)
    ),
  };
});
