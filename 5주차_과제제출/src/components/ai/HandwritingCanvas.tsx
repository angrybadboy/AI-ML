"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Prediction {
  digit: number;
  probability: number;
}

export default function HandwritingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [model, setModel] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [tfLib, setTfLib] = useState<typeof import("@tensorflow/tfjs") | null>(null);

  // TF.js와 모델을 동적으로 로드
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const tf = await import("@tensorflow/tfjs");
        if (cancelled) return;
        setTfLib(tf);
        const loaded = await tf.loadLayersModel("/models/mnist/model.json");
        if (cancelled) return;
        setModel(loaded);
      } catch (err) {
        console.error("Model load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Canvas 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 16;
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
    predict();
  };

  const predict = useCallback(async () => {
    if (!model || !tfLib || !canvasRef.current) return;
    const tf = tfLib;
    const m = model as Awaited<ReturnType<typeof tf.loadLayersModel>>;

    // Canvas → 28x28 grayscale
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.drawImage(canvasRef.current, 0, 0, 28, 28);

    const imageData = tempCtx.getImageData(0, 0, 28, 28);
    const input = tf.tidy(() => {
      const tensor = tf.browser.fromPixels(imageData, 1);
      return tensor.toFloat().div(255.0).reshape([1, 28, 28, 1]);
    });

    const output = m.predict(input) as import("@tensorflow/tfjs").Tensor;
    const probs = await output.data();
    input.dispose();
    output.dispose();

    const results: Prediction[] = Array.from(probs).map((p, i) => ({
      digit: i,
      probability: p,
    }));
    setPredictions(results);
  }, [model, tfLib]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPredictions([]);
  };

  const topPrediction = predictions.length > 0
    ? predictions.reduce((a, b) => (a.probability > b.probability ? a : b))
    : null;

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      {/* 캔버스 */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative overflow-hidden rounded-xl border border-gray-200">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80">
              <div className="text-center">
                <svg className="mx-auto h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-2 text-xs text-white/70">모델 로딩 중...</p>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="h-[280px] w-[280px] cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>
        <button
          onClick={clear}
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          지우기
        </button>
      </div>

      {/* 결과 */}
      <div className="flex-1">
        {topPrediction && (
          <div className="mb-4 text-center sm:text-left">
            <p className="text-xs text-gray-400">인식 결과</p>
            <p className="text-5xl font-bold tabular-nums text-gray-900">
              {topPrediction.digit}
            </p>
            <p className="text-xs text-gray-500">
              확률 {(topPrediction.probability * 100).toFixed(1)}%
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          {(predictions.length > 0 ? predictions : Array.from({ length: 10 }, (_, i) => ({ digit: i, probability: 0 }))).map(
            ({ digit, probability }) => (
              <div key={digit} className="flex items-center gap-2">
                <span className="w-4 text-right text-xs tabular-nums text-gray-500">
                  {digit}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-5">
                  <div
                    className="h-full rounded-full bg-gray-900 transition-all duration-300"
                    style={{ width: `${Math.max(probability * 100, 0.5)}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs tabular-nums text-gray-400">
                  {(probability * 100).toFixed(1)}%
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
