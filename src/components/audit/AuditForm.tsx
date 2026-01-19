"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useOfflineStore } from "@/features/offline/store";
import { v4 as uuid } from "uuid";

// --- Zod schema (oilMl optional now) ---
const AuditSchema = z.object({
  oilMl: z
    .preprocess((val) => {
      if (val === "" || val === null || typeof val === "undefined") return undefined;
      if (typeof val === "string") return Number(val);
      return val;
    }, z.number().min(1).optional()),
  mealsCount: z
    .preprocess((val) => {
      if (val === "" || val === null || typeof val === "undefined") return undefined;
      if (typeof val === "string") return Number(val);
      return val;
    }, z.number().optional()),
  notes: z.string().optional(),
});

type AuditFormData = z.infer<typeof AuditSchema>;

export default function AuditForm({ householdId }: { householdId: string }) {
  const resolver = zodResolver(AuditSchema) as unknown as Resolver<AuditFormData>;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AuditFormData>({ resolver });

  const addJob = useOfflineStore((s: any) => s.addJob);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Camera handling ---
  const startCamera = async () => {
    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamRef.current = stream;
      }
    } catch {
      alert("Camera access denied or unavailable.");
      setCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCapturing(false);
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const capturedFile = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        setFile(capturedFile);
        const url = URL.createObjectURL(capturedFile);
        setPreview(url);
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // --- File upload handling ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Helper: convert image to base64 for offline queue ---
  const fileToBase64 = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(f);
    });

  // --- Call /api/oil-analyze ---
  const runImageAnalysis = async (f: File) => {
    try {
      const fd = new FormData();
      fd.append("image", f);
      fd.append("householdId", householdId);
      const res = await fetch("/api/oil-analyze", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      return data.estimatedMl as number | undefined;
    } catch (err) {
      console.warn("Image analysis failed:", err);
      return undefined;
    }
  };

  // --- Submit handler ---
  const onSubmit: SubmitHandler<AuditFormData> = async (formData) => {
    setSubmitting(true);
    setResultMsg(null);

    const payloadMeta = { ...formData, timestamp: new Date().toISOString() };

    // ① If image present but oilMl not provided, auto-analyze and fill
    if (!formData.oilMl && file) {
      const estimate = await runImageAnalysis(file);
      if (estimate) {
        payloadMeta.oilMl = estimate;
        setValue("oilMl", estimate); // auto-fill UI field
        setResultMsg(`📷 Image analyzed — estimated oil: ${estimate} ml`);
      } else {
        setResultMsg("⚠️ Could not estimate oil from image. Please enter manually if known.");
      }
    }

    // ② Prevent empty submission (no oil and no image)
    if (!payloadMeta.oilMl && !file) {
      setResultMsg("❌ Please enter oil used or upload an image.");
      setSubmitting(false);
      return;
    }

    // --- Submit online or queue offline ---
    if (navigator.onLine) {
      try {
        if (file) {
          const fd = new FormData();
          fd.append("image", file);
          fd.append("payload", JSON.stringify(payloadMeta));
          await api.post(`/households/${householdId}/audits`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.post(`/households/${householdId}/audits`, payloadMeta);
        }

        setResultMsg("✅ Audit submitted successfully.");
        reset();
        removeImage();
      } catch (err) {
        console.error("Submit failed, queueing offline:", err);
        const job = {
          id: uuid(),
          path: `/households/${householdId}/audits`,
          payload: file
            ? { ...payloadMeta, imageBase64: await fileToBase64(file), imageName: file.name }
            : payloadMeta,
          createdAt: Date.now(),
        };
        addJob(job);
        setResultMsg("⚠️ Submission failed — queued for sync later.");
      } finally {
        setSubmitting(false);
      }
    } else {
      const job = {
        id: uuid(),
        path: `/households/${householdId}/audits`,
        payload: file
          ? { ...payloadMeta, imageBase64: await fileToBase64(file), imageName: file.name }
          : payloadMeta,
        createdAt: Date.now(),
      };
      addJob(job);
      setResultMsg("📥 Offline — data queued for sync later.");
      reset();
      removeImage();
      setSubmitting(false);
    }
  };

  // --- JSX UI ---
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto bg-white dark:bg-zinc-900 p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4 text-center">Record Oil Usage</h2>

      <label className="block">
        <span>Oil Used (ml)</span>
        <input
          type="number"
          {...register("oilMl")}
          className="w-full mt-2 border border-zinc-300 rounded-md p-2 bg-transparent"
        />
        {errors.oilMl && <p className="text-red-600 text-sm mt-1">{errors.oilMl.message}</p>}
      </label>

      <label className="block">
        <span>Meals Count (optional)</span>
        <input
          type="number"
          {...register("mealsCount")}
          className="w-full mt-2 border border-zinc-300 rounded-md p-2 bg-transparent"
        />
      </label>

      <label className="block">
        <span>Notes</span>
        <textarea
          {...register("notes")}
          className="w-full mt-2 border border-zinc-300 rounded-md p-2 bg-transparent"
        />
      </label>

      {/* Image controls */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="imageUpload"
            className="px-3 py-2 bg-amber-500 text-white rounded cursor-pointer hover:bg-amber-600 text-sm"
          >
            Upload Image
          </label>
          <input id="imageUpload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {!capturing ? (
            <button
              type="button"
              onClick={startCamera}
              className="px-3 py-2 border border-amber-500 text-amber-600 rounded text-sm hover:bg-amber-100 dark:hover:bg-zinc-800"
            >
              Capture Using Camera
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={takeSnapshot} className="px-3 py-2 bg-green-600 text-white rounded text-sm">
                Capture
              </button>
              <button type="button" onClick={stopCamera} className="px-3 py-2 bg-red-600 text-white rounded text-sm">
                Cancel
              </button>
            </div>
          )}

          {file && (
            <button type="button" onClick={removeImage} className="px-3 py-2 border rounded text-sm">
              Remove
            </button>
          )}
        </div>

        {capturing && (
          <div className="mt-2">
            <video ref={videoRef} className="w-full rounded-md border" autoPlay playsInline />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {preview && (
          <div className="mt-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Preview</p>
            <img src={preview} alt="preview" className="w-full rounded-md object-contain border" />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-amber-500 text-white font-semibold py-2 rounded-lg hover:bg-amber-600 disabled:opacity-60"
      >
        {submitting ? "Analyzing & Saving..." : "Submit Audit"}
      </button>

      {resultMsg && (
        <div className="mt-3 p-3 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm whitespace-pre-line">
          {resultMsg}
        </div>
      )}
    </form>
  );
}
