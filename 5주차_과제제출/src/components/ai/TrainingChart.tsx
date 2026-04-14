"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  regularizationData,
  overfittingLossData,
  predictionData,
} from "@/lib/training-data";

const COLORS = {
  none: "#94a3b8",
  l2: "#f59e0b",
  dropout: "#3b82f6",
  batch_norm: "#10b981",
  underfit: "#ef4444",
  balanced: "#10b981",
  overfit: "#8b5cf6",
  truth: "#94a3b8",
};

export function RegularizationChart() {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-gray-900">
        Regularization 기법별 Validation Loss
      </h3>
      <p className="mb-4 text-xs text-gray-400">
        규제가 없으면(None) 과적합으로 손실이 다시 증가합니다
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={regularizationData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="epoch"
            tick={{ fontSize: 11 }}
            label={{ value: "Epoch", position: "insideBottom", offset: -3, fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 11 }} domain={[0.2, 0.55]} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="none" name="None" stroke={COLORS.none} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="l2" name="L2" stroke={COLORS.l2} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="dropout" name="Dropout" stroke={COLORS.dropout} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="batch_norm" name="BatchNorm" stroke={COLORS.batch_norm} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OverfittingLossChart() {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-gray-900">
        모델 복잡도별 Validation Loss
      </h3>
      <p className="mb-4 text-xs text-gray-400">
        Overfit 모델은 훈련이 진행될수록 검증 손실이 다시 증가합니다
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={overfittingLossData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="epoch"
            tick={{ fontSize: 11 }}
            label={{ value: "Epoch", position: "insideBottom", offset: -3, fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 0.25]} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="underfit" name="Underfit" stroke={COLORS.underfit} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="balanced" name="Balanced" stroke={COLORS.balanced} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="overfit" name="Overfit" stroke={COLORS.overfit} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PredictionChart() {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-gray-900">
        모델 복잡도별 예측 곡선
      </h3>
      <p className="mb-4 text-xs text-gray-400">
        Underfit은 패턴을 못 잡고, Overfit은 노이즈까지 학습합니다
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={predictionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="x" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[-1.5, 1.5]} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="truth" name="sin(x) 정답" stroke={COLORS.truth} strokeWidth={2} strokeDasharray="5 5" dot={false} />
          <Line type="monotone" dataKey="underfit" name="Underfit" stroke={COLORS.underfit} strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="balanced" name="Balanced" stroke={COLORS.balanced} strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="overfit" name="Overfit" stroke={COLORS.overfit} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
