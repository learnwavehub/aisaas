"use client";

import Link from "next/link";
import { ImageIcon, Film, Music, MessageSquare, Code, Sparkles, Zap, Palette, Waves, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

function Card({ 
  title, 
  desc, 
  icon, 
  href, 
  gradient 
}: { 
  title: string; 
  desc: string; 
  icon: React.ReactNode; 
  href: string;
  gradient: string;
}) {
  return (
    <Link href={href} className="block">
      <motion.div 
        className="relative p-6 sm:p-8 rounded-3xl overflow-hidden group cursor-pointer h-full"
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgMTBoLTR2LTNoLTR2M2gtM3Y0aDN2M2g0di0zaDR2LTRoLTZ2LTNoLTR2M2gtM3Y0aDN2M2g0di0zaDR2LTRoLTV2LTNoLTR2M3ptLTYgMTloLTR2LTNoLTR2M2gtM3Y0aDN2M2g0di0zaDR2LTRoLTZ2LTNoLTR2M2gtM3Y0aDN2M2g0di0zaDR2LTRoLTV2LTNoLTR2M3ptLTYgMTloLTR2LTNoLTR2M2gtM3Y0aDN2M2g4di0zaDR2LTRoLTV2LTNoLTR2M3oiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')]" />
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        
        {/* Main content */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg">
              {icon}
            </div>
            <div className="text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700">
              Try Now →
            </div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{title}</h3>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-grow">{desc}</p>
          
          {/* Feature tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {title === "Image Generation" && (
              <>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">AI Art</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700">Photoreal</span>
              </>
            )}
            {title === "Video Generation" && (
              <>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700">Cinematic</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Short Clips</span>
              </>
            )}
            {title === "Music Generation" && (
              <>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">Composition</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-teal-50 text-teal-700">Melodies</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-50 text-cyan-700">Tracks</span>
              </>
            )}
            {title === "Sound Effects" && (
              <>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">SFX</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700">Audio FX</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700">Impact</span>
              </>
            )}
            {title === "Code Generation" && (
              <>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">Production</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-50 text-cyan-700">Snippets</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-sky-50 text-sky-700">UI/API</span>
              </>
            )}
            {title === "AI Chat Assistant" && (
              <>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700">Conversation</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-pink-50 text-pink-700">Gemini AI</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-50 text-violet-700">Brainstorm</span>
              </>
            )}
          </div>
        </div>
        
        {/* Bottom gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 group-hover:opacity-40 transition-opacity" />
      </motion.div>
    </Link>
  );
}

export default function Features() {
  const cards = [
    {
      title: "Image Generation",
      desc: "Create photorealistic images, digital art, and custom avatars with advanced prompt controls and style presets.",
      icon: <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" />,
      href: "/images",
      gradient: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
    },
    {
      title: "Video Generation",
      desc: "Generate cinematic short clips, animations, and transitions with scene composition and motion control.",
      icon: <Film className="h-6 w-6 sm:h-7 sm:w-7 text-rose-500" />,
      href: "/video",
      gradient: "bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500"
    },
    {
      title: "Music Generation",
      desc: "Compose original music, melodies, and full tracks tailored to any mood, genre, or tempo with AI.",
      icon: <Music className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />,
      href: "/realmusic",  // Updated to /realmusic
      gradient: "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
    },
    {
      title: "Sound Effects",
      desc: "Generate impact sounds, ambient audio, UI effects, and specialized audio FX for any project.",
      icon: <Volume2 className="h-6 w-6 sm:h-7 sm:w-7 text-amber-500" />,
      href: "/music",  // Updated to /music
      gradient: "bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500"
    },
    {
      title: "Code Generation",
      desc: "Generate production-ready code, UI components, and API integrations with intelligent context awareness.",
      icon: <Code className="h-6 w-6 sm:h-7 sm:w-7 text-sky-600" />,
      href: "/codegen",
      gradient: "bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500"
    },
    {
      title: "AI Chat Assistant",
      desc: "Conversational AI powered by Gemini for explanations, brainstorming, and intelligent problem-solving.",
      icon: <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" />,
      href: "/chat",
      gradient: "bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500"
    }
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-indigo-50 to-rose-50 mb-3 sm:mb-4"
        >
          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
          <span className="text-xs sm:text-sm font-medium text-indigo-700">Powerful AI Tools</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4"
        >
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">
            create & innovate
          </span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-2xl lg:max-w-3xl mx-auto px-4"
        >
          From multimedia creation to code generation and AI conversations — all powered by state-of-the-art models.
        </motion.p>
      </div>
      
      {/* Fixed grid: 3 cards per row on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
          >
            <Card {...card} />
          </motion.div>
        ))}
      </div>
      
      {/* Stats section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-12 border-t border-gray-200"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">6+</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">AI Features</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">99.9%</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">10K+</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Creators</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">24/7</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Support</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}