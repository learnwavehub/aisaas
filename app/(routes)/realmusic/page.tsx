"use client";

import { useState, useRef, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Music, Play, Pause, Download } from "lucide-react";

const schema = z.object({
  prompt: z.string().min(6, "Prompt must be at least 6 characters"),
});

type FormSchema = z.infer<typeof schema>;

export default function MusicPage() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { 
      prompt: "Uplifting synth with warm pads and steady beat" 
    },
  });

  const [isLoading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generate = async (data: FormSchema) => {
    setLoading(true);
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const res = await fetch('/api/openai/music', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ prompt: data.prompt }) 
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.error || 'generation_failed');
      }

      if (json.audio_url) {
        setAudioUrl(json.audio_url);
      }
      
    } catch (e: any) {
      console.error("Generation error:", e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

const togglePlay = async () => {
  if (!audioUrl) return;
  
  if (isPlaying && audioRef.current) {
    audioRef.current.pause();
    setIsPlaying(false);
  } else {
    // Create fresh audio element each time
    const audio = new Audio(audioUrl);
    
    // Store reference
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = audio;
    
    try {
      await audio.play();
      setIsPlaying(true);
      
      // Update state when audio ends
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
    } catch (error) {
      console.error("Playback error:", error);
      alert("Could not play audio. Try downloading instead.");
    }
  }
};

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!audioUrl) {
      alert("Generate audio first");
      return;
    }
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `gemini-music-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-indigo-50 p-8 shadow-xl">
        <h1 className="text-4xl font-extrabold">Music Generation</h1>
        <p className="mt-2 text-zinc-600">Create music with Google Gemini Lyria API</p>

        <form onSubmit={form.handleSubmit(generate)} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/80 rounded-2xl p-6 shadow-inner">
            <div>
              <label className="block text-sm font-medium mb-2">Describe the music</label>
              <Textarea 
                {...form.register("prompt")}
                rows={4}
                placeholder="e.g., 'uplifting synthwave', 'epic orchestral'"
                className="w-full p-3 border rounded-lg"
              />
              {form.formState.errors.prompt && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.prompt.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 shadow-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Music className="h-4 w-4" />
                  Generate Audio
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl border bg-white p-6 flex flex-col">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Music className="h-5 w-5 text-emerald-500" />
              Generated Audio
            </h3>
            
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
                <p className="text-sm text-zinc-600">Generating...</p>
              </div>
            ) : audioUrl ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-zinc-600 mb-2">
                    {isPlaying ? "🎵 Now playing..." : "✅ Ready to play"}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={togglePlay}
                    type="button"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-8">
                <Music className="h-12 w-12 mb-3 opacity-30" />
                <p>No audio generated yet</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}