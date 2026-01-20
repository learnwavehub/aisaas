"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import ThemeSwitcher from "./theme-switcher";
import ThemeCards from "./theme-cards";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { Image, Video, Music,Music2, Code, Settings as SettingsIcon, Shield,MessageCircle, ChevronUp, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "./navigation-menu";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // debug: log mobileOpen changes
  useEffect(() => {
    try { console.debug("mobileOpen ->", mobileOpen); } catch {}
  }, [mobileOpen]);

  const navItems = [
    { href: "/images", label: "Image Generation", icon: <Image className="text-yellow-500 shadow-sm"  size={18} /> },
    { href: "/video", label: "Video Generation", icon: <Video className="text-red-500 shadow-sm rounded" size={18} /> },
    { href: "/realmusic", label: "Music Generation", icon: <Music className="text-emerald-500 shadow-sm rounded" size={18} /> },
    { href: "/music", label: "Sound Effects", icon: <Music2 size={18} className="text-pink-600 shadow-sm rounded"/> },
    { href: "/codegen", label: "Code Generation", icon: <Code className="text-gray-600 shadow-sm rounded" size={18} /> },
    { href: "/chat", label: "ai chat", icon: <MessageCircle  className='text-purple-700 shadow-sm rounded' size={18} /> },
    { href: "/admin", label: "Admin", icon: <Shield size={18} /> },
    { href: "/settings", label: "Settings", icon: <SettingsIcon size={18} /> },
  ];

  // Handle scroll indicators
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Show top indicator if scrolled down
    setShowScrollTop(scrollTop > 20);
    
    // Show bottom indicator if not at the bottom
    setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 20);
  };

  // Scroll to top/bottom functions
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isAnimating) return;
    
    console.log("Menu button clicked, toggling from:", mobileOpen, "to:", !mobileOpen);
    
    setIsAnimating(true);
    setMobileOpen((prev) => {
      const newValue = !prev;
      console.log("Setting mobileOpen to:", newValue);
      return newValue;
    });
    
    // Reset animation lock after a short delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const closeMobileMenu = () => {
    if (isAnimating) return;
    
    console.log("Closing mobile menu");
    setIsAnimating(true);
    setMobileOpen(false);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both menu panel and menu button
      if (
        mobileOpen &&
        menuPanelRef.current && 
        !menuPanelRef.current.contains(event.target as Node) &&
        menuButtonRef.current && 
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        console.log("Click outside detected, closing menu");
        closeMobileMenu();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (mobileOpen && event.key === 'Escape') {
        console.log("Escape key pressed, closing menu");
        closeMobileMenu();
      }
    };

    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scrolling when menu is open
      document.body.style.overflow = 'hidden';
      
      // Reset scroll position when menu opens
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
          handleScroll();
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between relative">
       
        <Link href='/' onClick={closeMobileMenu}>  
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <span className="font-semibold text-lg">AiMagic</span>
          </div>
        </Link>

        {/* Desktop Nav (Shadcn NavigationMenu with dropdown) */}
        <div className="hidden md:flex items-center gap-6 text-zinc-700">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-3 py-1 rounded hover:bg-zinc-100">All Features</NavigationMenuTrigger>
                <NavigationMenuContent className="p-4 w-[min(92vw,1000px)] min-w-[520px] sm:min-w-[720px] lg:min-w-[900px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <NavigationMenuLink asChild>
                      <Link href="/images" className="block p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 border shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-yellow-400 flex items-center justify-center text-white">
                            <Image size={18} />
                          </div>
                          <div>
                            <div className="font-semibold">Image Generation</div>
                            <div className="text-xs text-zinc-500">Create images from prompts</div>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild>
                      <Link href="/video" className="block p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-red-400 flex items-center justify-center text-white">
                            <Video size={18} />
                          </div>
                          <div>
                            <div className="font-semibold">Video Generation</div>
                            <div className="text-xs text-zinc-500">Produce clips from text</div>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild>
                      <Link href="/realmusic" className="block p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-400 flex items-center justify-center text-white">
                            <Music size={18} />
                          </div>
                          <div>
                            <div className="font-semibold">Real Music</div>
                            <div className="text-xs text-zinc-500">Generate realistic music</div>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild>
                      <Link href="/music" className="block p-3 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-pink-400 flex items-center justify-center text-white">
                            <Music2 size={18} />
                          </div>
                          <div>
                            <div className="font-semibold">Sound Effects</div>
                            <div className="text-xs text-zinc-500">Find or generate sfx</div>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    
                    <NavigationMenuLink asChild>
                      <Link href="/codegen" className="block p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-400 flex items-center justify-center text-white">
                            <Code size={18} />
                          </div>
                          <div>
                            <div className="font-semibold">Code Generation</div>
                            <div className="text-xs text-zinc-500">Generate code from prompts</div>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild>
                      <Link href="/chat" className="block p-3 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 border shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-violet-400 flex items-center justify-center text-white">
                            <MessageCircle size={18} />
                          </div>
                          <div>
                            <div className="font-semibold">AI Chat</div>
                            <div className="text-xs text-zinc-500">Interactive assistant</div>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>

                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-3 py-1 rounded hover:bg-zinc-100">Themes</NavigationMenuTrigger>
                <NavigationMenuContent className="p-4 w-[min(92vw,800px)] min-w-[320px] sm:min-w-[500px] md:min-w-[600px] lg:min-w-[720px]">
                  <div className="text-sm text-zinc-700 mb-2">Pick a theme</div>
                  <ThemeCards />
                </NavigationMenuContent>
              </NavigationMenuItem>

              {navItems
                .filter((i) => !["/images", "/video", "/realmusic", "/music"].includes(i.href))
                .map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link href={item.href} className="flex items-center gap-1 px-3 py-1 rounded hover:bg-zinc-100">
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
            </NavigationMenuList>
          </NavigationMenu>

          <UserButton />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-3 relative z-50">
          <UserButton />
          <button
            ref={menuButtonRef}
            onClick={toggleMobileMenu}
            aria-label="Menu"
            className="p-2 rounded-md border z-50 bg-white relative"
            disabled={isAnimating}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>

        {/* Animated Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-[100]">
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/30"
                onClick={closeMobileMenu}
              />
              
              {/* Menu panel */}
              <motion.div
                ref={menuPanelRef}
                key="mobile-menu"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-4 top-16 w-[min(92vw,20rem)] rounded-md bg-white shadow-lg border z-[101] max-h-[70vh] flex flex-col"
              >
                {/* Menu header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Navigation</h3>
                  <button
                    onClick={closeMobileMenu}
                    className="p-1 rounded hover:bg-zinc-100"
                    aria-label="Close menu"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Scrollable content container */}
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto overscroll-contain p-3"
                  onScroll={handleScroll}
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d4d4d8 transparent',
                  }}
                >
                  {/* Scroll top indicator */}
                  {showScrollTop && (
                    <div className="sticky top-0 left-0 right-0 flex justify-center mb-2 z-10">
                      <button
                        onClick={scrollToTop}
                        className="p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border"
                        aria-label="Scroll to top"
                      >
                        <ChevronUp size={16} />
                      </button>
                    </div>
                  )}

                  <motion.nav
                    className="flex flex-col"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.04 } },
                    }}
                  >
                    {/* Main navigation items */}
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 px-2">Features</h4>
                      {navItems.map((item) => (
                        <motion.div
                          key={item.href}
                          variants={{
                            hidden: { opacity: 0, x: -8 },
                            visible: { opacity: 1, x: 0 },
                          }}
                        >
                          <Link
                            href={item.href}
                            className="py-2.5 px-3 rounded-lg hover:bg-zinc-100 flex items-center gap-3 mb-1 transition-colors"
                            onClick={closeMobileMenu}
                          >
                            <div className="flex-shrink-0">
                              {item.icon}
                            </div>
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    {/* Themes section */}
                    <div className="border-t pt-4 mt-2">
                      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 px-2">Themes</h4>
                      <ThemeCards compact onSelect={closeMobileMenu} />
                    </div>

                    {/* Additional links or info */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="text-xs text-zinc-500 px-2 mb-3">
                        <p className="mb-2">Explore all AI features</p>
                        <p className="text-[10px]">More features coming soon...</p>
                      </div>
                    </div>
                  </motion.nav>

                  {/* Scroll bottom indicator */}
                  {showScrollBottom && (
                    <div className="sticky bottom-0 left-0 right-0 flex justify-center mt-2 z-10">
                      <button
                        onClick={scrollToBottom}
                        className="p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border"
                        aria-label="Scroll to bottom"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Menu footer */}
                <div className="p-3 border-t bg-zinc-50/50">
                  <div className="text-xs text-zinc-500 text-center">
                    <p>AI Magic v1.0 • All features included</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}