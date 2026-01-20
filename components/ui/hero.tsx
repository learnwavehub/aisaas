"use client";

import { Camera, Video, Music, MessageSquare, Code, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const words = ["images", "cinematic video", "sound effects", "original music", "production-ready code", "AI chat conversations"];

function useTypewriter(wordList: string[], speed = 60, pause = 1200) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    let mounted = true;
    let w = 0;
    let i = 0;

    const run = async () => {
      while (mounted) {
        const word = wordList[i];
        for (w = 1; w <= word.length; w++) {
          if (!mounted) return;
          setDisplay(word.slice(0, w));
          await new Promise((r) => setTimeout(r, speed));
        }
        await new Promise((r) => setTimeout(r, pause));
        for (w = word.length; w >= 0; w--) {
          if (!mounted) return;
          setDisplay(word.slice(0, w));
          await new Promise((r) => setTimeout(r, Math.max(20, speed / 3)));
        }
        i = (i + 1) % wordList.length;
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [wordList, speed, pause]);

  return display;
}

export default function Hero() {
  const typed = useTypewriter(words, 90, 2000);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <motion.div className="rounded-full bg-gradient-to-r from-indigo-50 to-rose-50 inline-flex px-3 py-1 text-indigo-700 font-medium text-sm sm:text-base" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              Launch faster with AI
            </motion.div>

            <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Generate stunning <span className="text-indigo-600 block sm:inline">{typed}</span> — instantly.
            </h1>

            <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto lg:mx-0">
              SynthWave combines state-of-the-art AI models with a developer-friendly API to help creators ship multimedia features in minutes.
            </p>

            {/* Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <a className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white shadow hover:brightness-105 transition-all" href="/codegen">
                <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                Generate Code
              </a>
              <a className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white shadow hover:brightness-105 transition-all" href="/chat">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Start Chat
              </a>
              <a className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white shadow hover:brightness-105 transition-all" href="/music">
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Create Sound
              </a>
            </div>

            {/* Feature Cards */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto lg:mx-0">
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-semibold">Image</div>
                  <div className="text-xs text-zinc-500">Photoreal or stylized</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Video className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-semibold">Video</div>
                  <div className="text-xs text-zinc-500">Short clips & transitions</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Volume2 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-semibold">Sound Effects</div>
                  <div className="text-xs text-zinc-500">Impact, ambient, UI</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Music className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-semibold">Music</div>
                  <div className="text-xs text-zinc-500">Melodies, stems, loops</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Code className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-semibold">Code</div>
                  <div className="text-xs text-zinc-500">Production-ready</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-semibold">Chat</div>
                  <div className="text-xs text-zinc-500">AI conversations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Preview */}
          <motion.div className="relative flex items-center justify-center" initial={{ scale: 0.98 }} animate={{ scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl lg:rounded-3xl bg-gradient-to-br from-indigo-500/20 to-rose-400/10 p-4 sm:p-6 lg:p-8 shadow-xl lg:shadow-2xl">
              <div className="relative w-full aspect-[3/2] rounded-xl bg-gradient-to-b from-black/80 to-neutral-900 overflow-hidden">
                {/* SVG Visualization */}
                <svg viewBox="0 0 600 400" className="w-full h-full opacity-80" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="g2" x1="0" x2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#fb7185" stopOpacity="0.95" />
                    </linearGradient>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#g2)" opacity="0.06" />
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Feature Icons - Simplified for mobile */}
                  <g transform="translate(80, 40)" className="opacity-90">
                    <rect x="0" y="0" width="120" height="80" rx="12" fill="#8b5cf6" opacity="0.3" />
                    <circle cx="30" cy="20" r="6" fill="#ffffff" opacity="0.8" />
                    <rect x="40" y="16" width="60" height="8" rx="4" fill="#ffffff" opacity="0.6" />
                  </g>
                  
                  <g transform="translate(340, 90)" className="opacity-90">
                    <rect x="0" y="0" width="160" height="100" rx="8" fill="#0ea5e9" opacity="0.25" />
                    <rect x="20" y="20" width="120" height="6" rx="3" fill="#ffffff" opacity="0.9" />
                    <rect x="20" y="34" width="80" height="6" rx="3" fill="#60a5fa" opacity="0.7" />
                  </g>
                  
                  <g transform="translate(180, 240)" className="opacity-90">
                    <rect x="0" y="0" width="80" height="80" rx="12" fill="#fb7185" opacity="0.25" />
                    <circle cx="40" cy="30" r="12" fill="#ffffff" opacity="0.8" />
                  </g>
                  
                  <g transform="translate(380, 240)" className="opacity-90">
                    <rect x="0" y="0" width="100" height="60" rx="10" fill="#10b981" opacity="0.25" />
                    <rect x="20" y="10" width="6" height="40" rx="3" fill="#ffffff" />
                    <rect x="35" y="15" width="6" height="30" rx="3" fill="#ffffff" />
                  </g>
                  
                  <g transform="translate(240, 150)" className="opacity-90">
                    <rect x="0" y="0" width="90" height="70" rx="14" fill="#f97316" opacity="0.25" />
                    <polygon points="35,25 55,40 35,55" fill="#ffffff" opacity="0.9" />
                  </g>
                  
                  <g transform="translate(320, 150)" className="opacity-90">
                    <rect x="0" y="0" width="90" height="70" rx="14" fill="#f59e0b" opacity="0.25" />
                    <path d="M25,30 Q35,20 45,30 T65,30" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.9" />
                  </g>
                </svg>
                
                {/* Feature Labels - Only on larger screens */}
                <div className="hidden lg:block">
                  <div className="absolute top-10 left-16">
                    <div className="bg-indigo-500/90 text-white text-xs px-2 py-1 rounded">AI Chat</div>
                  </div>
                  <div className="absolute top-36 right-28">
                    <div className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded">Code Gen</div>
                  </div>
                  <div className="absolute bottom-28 left-28">
                    <div className="bg-rose-500/90 text-white text-xs px-2 py-1 rounded">Images</div>
                  </div>
                  <div className="absolute bottom-28 right-36">
                    <div className="bg-emerald-500/90 text-white text-xs px-2 py-1 rounded">Music</div>
                  </div>
                  <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-orange-500/90 text-white text-xs px-2 py-1 rounded">Video</div>
                  </div>
                  <div className="absolute top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2">
                    <div className="bg-amber-500/90 text-white text-xs px-2 py-1 rounded">Sound FX</div>
                  </div>
                </div>
              </div>
              
              {/* Mobile feature indicator */}
              <div className="lg:hidden mt-4 text-center">
                <p className="text-xs text-zinc-500">Interactive feature visualization</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}