"use client";

import React, { useRef, useState } from "react";

type Props = {
  onSubmit?: (file: File | null, preview: string | null) => void;
};

export default function OilImageUploader({ onSubmit }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /** Start webcam for live capture */
  const startCamera = async () => {
    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
      }
    } catch (err) {
      alert("Unable to access camera. Please allow camera permissions.");
      setCapturing(false);
    }
  };

  /** Take snapshot from camera */
  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setFile(capturedFile);
      const url = URL.createObjectURL(blob);
      setPreview(url);
      stopCamera();
    }, "image/jpeg");
  };

  /** Stop webcam stream */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCapturing(false);
  };

  /** Handle file upload (from disk) */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  };

  /** Simulate submit (send to backend or ML model later) */
  const handleSubmit = () => {
    if (!file) {
      alert("Please upload or capture an image first!");
      return;
    }
    alert("Image submitted successfully!");
    if (onSubmit) onSubmit(file, preview);
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Measure Oil Consumption via Image</h2>

      <div className="flex flex-col items-center gap-4">
        {/* Upload Button */}
        <label
          htmlFor="imageUpload"
          className="px-4 py-2 bg-amber-500 text-white rounded cursor-pointer hover:bg-amber-600 transition"
        >
          Upload Image
        </label>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* OR */}
        <span className="text-sm text-zinc-500 dark:text-zinc-400">or</span>

        {/* Capture via camera */}
        {!capturing ? (
          <button
            onClick={startCamera}
            className="px-4 py-2 border border-amber-500 text-amber-600 rounded hover:bg-amber-100 dark:hover:bg-zinc-800 transition"
          >
            Capture Using Camera
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <video ref={videoRef} className="rounded-lg w-80 border" />
            <div className="flex gap-2">
              <button
                onClick={takeSnapshot}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Preview section */}
        {preview && (
          <div className="mt-4 w-full text-center">
            <p className="text-sm mb-2 text-zinc-600 dark:text-zinc-400">Preview:</p>
            <img
              src={preview}
              alt="preview"
              className="rounded-xl border w-full max-h-96 object-contain shadow"
            />
          </div>
        )}

        {/* Hidden canvas for snapshot */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="mt-4 px-6 py-2 bg-amber-500 text-white font-semibold rounded hover:bg-amber-600 transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
