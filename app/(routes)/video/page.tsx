"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

export default function VideoPage() {
  const schema = z.object({
    prompt: z.string().min(8, "Prompt must be at least 8 characters").max(2000, "Prompt must be less than 2000 characters"),
  });

  type FormSchema = z.infer<typeof schema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: "A lion chasing a rabbit in the desert with giraffes nearby",
    },
  });

  const [isLoading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const onSubmit = async (data: FormSchema) => {
    console.log("Generating video...");
    setLoading(true);
    setVideoUrl(null);
    setStatus("Creating task...");

    try {
      const res = await fetch('/api/freepik/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.prompt }),
      });

      const json = await res.json();
      console.log("Response:", json);
      
      if (json.video_url) {
        console.log("🎉 Got video URL!");
        setVideoUrl(json.video_url);
        setStatus(`✅ Ready after ${json.wait_time_seconds}s`);
      } else {
        setStatus(`❌ ${json.message || json.error || "Failed"}`);
      }

    } catch (error: any) {
      console.error('Error:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="rounded-3xl bg-gradient-to-br from-rose-50 to-indigo-50 p-8 shadow-xl">
          <h1 className="text-4xl font-extrabold">Text-to-Video Generation</h1>
          <p className="mt-2 text-zinc-600">
            Enter a prompt and get a real video URL from Freepik API
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Form */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-inner space-y-6">
              <Controller
                control={form.control}
                name="prompt"
                render={({ field, fieldState }) => (
                  <div>
                    <label className="block text-sm font-medium mb-2">Describe your video *</label>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="A cinematic shot of mountains at sunrise with flying eagles..."
                      className={`w-full p-3 border rounded-lg ${
                        fieldState.error ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <div className="flex justify-between mt-2">
                      <div className="text-xs text-zinc-500">
                        {field.value.length}/2000 characters
                      </div>
                      {fieldState.error && (
                        <div className="text-xs text-red-600">
                          {fieldState.error.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Generating..." : "Generate Video"}
                </button>
                <p className="text-xs text-zinc-500 mt-3 text-center">
                  Backend polls until video is ready (up to 10 min)
                </p>
              </div>

              {status && (
                <div className={`p-3 rounded-lg ${
                  status.includes('✅') ? 'bg-green-50 border-green-200' :
                  status.includes('❌') ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <p className="text-sm">{status}</p>
                  <p className="text-xs mt-1 opacity-75">
                    Check server console for detailed logs
                  </p>
                </div>
              )}

              <div className="p-3 bg-gray-100 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">How it works:</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Creates task with your prompt</li>
                  <li>Polls <code>/ai/image-to-video/minimax-hailuo-02-768p/{'{taskId}'}</code></li>
                  <li>Returns video from <code>data.generated[0]</code> when ready</li>
                </ol>
              </div>
            </div>

            {/* Right Column: Video Player */}
            <div className="bg-black/5 rounded-2xl p-6 flex flex-col">
              <h3 className="text-lg font-medium mb-4">
                {videoUrl ? "Your Video" : isLoading ? "Generating..." : "Preview"}
              </h3>
              
              <div className="flex-1 flex flex-col items-center justify-center">
                {isLoading ? (
                  <div className="text-center w-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
                    <p className="mt-4 text-zinc-500">Polling for video...</p>
                    <p className="text-sm text-zinc-400">Typically takes 30-120 seconds</p>
                  </div>
                ) : videoUrl ? (
                  <div className="w-full space-y-4">
                    <div className="bg-black rounded-lg overflow-hidden">
                      <video
                        controls
                        autoPlay
                        muted
                        className="w-full h-auto"
                        src={videoUrl}
                      >
                        Your browser doesn't support video
                      </video>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={videoUrl}
                        download="generated-video.mp4"
                        className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Download Video
                      </a>
                      <button
                        onClick={() => window.open(videoUrl, '_blank')}
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                      >
                        Open in New Tab
                      </button>
                    </div>
                    <p className="text-xs text-green-600 text-center">
                      ✅ Real video from Freepik API
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-5xl mb-4">🎬</div>
                    <p className="text-zinc-500">Your video will appear here</p>
                    <p className="text-sm text-zinc-400 mt-2">
                      Enter a prompt and click Generate
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}