"use client";

import { useState, useRef, useCallback } from "react";

type AugmentFn = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) => void;

const augmentations: { name: string; fn: AugmentFn }[] = [
  {
    name: "원본",
    fn: (ctx, img, w, h) => ctx.drawImage(img, 0, 0, w, h),
  },
  {
    name: "좌우 반전",
    fn: (ctx, img, w, h) => {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, w, h);
    },
  },
  {
    name: "상하 반전",
    fn: (ctx, img, w, h) => {
      ctx.translate(0, h);
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, 0, w, h);
    },
  },
  {
    name: "회전 15°",
    fn: (ctx, img, w, h) => {
      ctx.translate(w / 2, h / 2);
      ctx.rotate((15 * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    },
  },
  {
    name: "회전 -20°",
    fn: (ctx, img, w, h) => {
      ctx.translate(w / 2, h / 2);
      ctx.rotate((-20 * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    },
  },
  {
    name: "확대 120%",
    fn: (ctx, img, w, h) => {
      const s = 1.2;
      const dx = (w - w * s) / 2;
      const dy = (h - h * s) / 2;
      ctx.drawImage(img, dx, dy, w * s, h * s);
    },
  },
  {
    name: "축소 80%",
    fn: (ctx, img, w, h) => {
      const s = 0.8;
      const dx = (w - w * s) / 2;
      const dy = (h - h * s) / 2;
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, dx, dy, w * s, h * s);
    },
  },
  {
    name: "회전 + 확대",
    fn: (ctx, img, w, h) => {
      ctx.translate(w / 2, h / 2);
      ctx.rotate((10 * Math.PI) / 180);
      ctx.scale(1.15, 1.15);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    },
  },
  {
    name: "반전 + 회전",
    fn: (ctx, img, w, h) => {
      ctx.translate(w / 2, h / 2);
      ctx.scale(-1, 1);
      ctx.rotate((-12 * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    },
  },
];

export default function AugmentationGrid() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback((img: HTMLImageElement) => {
    setImage(img);
    const size = 200;
    const urls: string[] = [];

    for (const aug of augmentations) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.save();
      aug.fn(ctx, img, size, size);
      ctx.restore();
      urls.push(canvas.toDataURL());
    }
    setResults(urls);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => processImage(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {/* 업로드 영역 */}
      {results.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
            dragging
              ? "border-gray-900 bg-gray-50"
              : "border-gray-300 bg-white"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileRef.current?.click()}
        >
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">
            이미지를 드래그하거나 클릭하여 업로드
          </p>
          <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">Data Augmentation 결과</p>
            <button
              onClick={() => {
                setResults([]);
                setImage(null);
              }}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              다른 이미지 사용 →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {results.map((url, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img
                  src={url}
                  alt={augmentations[i].name}
                  className="aspect-square w-full object-cover"
                />
                <p className="py-1.5 text-center text-xs text-gray-500">
                  {augmentations[i].name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
