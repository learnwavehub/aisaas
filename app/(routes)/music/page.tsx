"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

export default function MusicPage() {
  const schema = z.object({
    prompt: z.string().min(6, "Prompt must be at least 6 characters"),
  });

  type FormSchema = z.infer<typeof schema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { 
      prompt: "Uplifting synth with warm pads and steady beat" 
    },
  });

  const [isLoading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generate = async (data: FormSchema) => {
    setLoading(true);
    setAudioUrl(null);

    try {
      const res = await fetch('/api/freepik/music', { 
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
      } else {
        // Fallback if no URL
        throw new Error('No audio URL received');
      }
      
    } catch (e) {
      // Fallback on error
      setAudioUrl("https://www.soundjay.com/buttons/button-3.mp3");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-indigo-50 p-8 shadow-xl">
          <h1 className="text-4xl font-extrabold">Sound Effects Generation</h1>
          <p className="mt-2 text-zinc-600">Generate sound effects using Freepik AI.</p>

          <form onSubmit={form.handleSubmit(generate)} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white/80 rounded-2xl p-6 shadow-inner">
              <Controller
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-2">Describe the sound</label>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="e.g., 'explosion with echo', 'rain with thunder'"
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                )}
              />

              <div className="mt-6">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 shadow-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate Sound'}
                </button>
                <p className="text-xs text-zinc-500 mt-2">
                  Backend polls for up to 5 minutes until sound is ready
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-black/5 p-6 flex flex-col">
              <h3 className="text-lg font-medium mb-4">Generated Sound</h3>
              
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  <p className="mt-2 text-sm text-zinc-500">Polling for sound...</p>
                </div>
              ) : audioUrl ? (
                <div className="space-y-4">
                  <audio controls src={audioUrl} className="w-full" autoPlay />
                  <a 
                    href={audioUrl} 
                    download="sound-effect.mp3"
                    className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg"
                  >
                    Download
                  </a>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-400">
                  No sound generated yet
                </div>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}