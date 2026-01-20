"use client";


// using plain <img> with picsum.photos for reliable free previews
import Hero from "@/components/ui/hero";
import Features from "@/components/ui/features";
import Footer from "@/components/ui/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg--to-b from-white via-zinc-50 to-zinc-100 font-sans">
      <main>
        <Hero />
        <Features />
       
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-3xl p-8 bg-gradient-to-r from-blue-900 via-indigo-800 to-sky-700 text-white shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Plans that scale with you</h2>
                <p className="mt-2 text-white/90">From free trials to production-grade APIs — pick what fits.</p>
              </div>
              <div className="text-sm text-white/80">Trusted by creators & teams • Cancel anytime</div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-white/5 to-white/3 border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#7c3aed22,transparent_40%)] pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600/20 to-sky-400/10 text-xs font-medium text-white/90">
                    Starter
                  </div>
                  <h3 className="mt-4 text-4xl font-extrabold text-white">Free</h3>
                  <p className="mt-2 text-sm text-white/80">Experiment and prototype with limited usage.</p>
                  <ul className="mt-4 space-y-2 text-sm text-white/70">
                    <li>• 50 image credits / month</li>
                    <li>• Community support</li>
                    <li>• Basic models</li>
                  </ul>
                  <div className="mt-6 text-3xl font-bold text-white">$0</div>
                  <button className="mt-6 w-full rounded-lg bg-gradient-to-r from-indigo-500 to-sky-400 text-white py-3 shadow-[0_10px_30px_rgba(99,102,241,0.18)] hover:scale-[1.02] transition">Get started</button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#0f172a]/40 to-[#312e81]/30 border border-white/10 shadow-2xl transform hover:scale-105 transition">
                <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-tr from-sky-400/30 to-indigo-500/20 blur-3xl opacity-80 pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-xs font-medium text-white/90">
                    Popular
                  </div>
                  <h3 className="mt-4 text-4xl font-extrabold text-white">Scale</h3>
                  <p className="mt-2 text-sm text-white/80">For growing teams and production apps — higher limits.</p>
                  <ul className="mt-4 space-y-2 text-sm text-white/70">
                    <li>• 5,000 API credits / month</li>
                    <li>• Priority queue</li>
                    <li>• Advanced models</li>
                  </ul>
                  <div className="mt-6 text-3xl font-bold text-white">$49<span className="text-sm font-medium text-white/80"> / mo</span></div>
                  <button className="mt-6 w-full rounded-lg bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3 shadow-[0_12px_40px_rgba(236,72,153,0.16)] hover:translate-y-[-2px] transition">Choose plan</button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white/6 to-white/4 border border-white/8 shadow-lg">
                <div className="absolute -left-10 -bottom-10 w-56 h-56 rounded-full bg-gradient-to-br from-pink-500/10 to-yellow-400/8 blur-3xl opacity-60 pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400/18 to-pink-400/12 text-xs font-medium text-white/90">
                    For teams
                  </div>
                  <h3 className="mt-4 text-4xl font-extrabold text-white">Enterprise</h3>
                  <p className="mt-2 text-sm text-white/80">Custom SLAs, dedicated support, and on-prem options.</p>
                  <ul className="mt-4 space-y-2 text-sm text-white/70">
                    <li>• Dedicated account manager</li>
                    <li>• SSO & SCIM</li>
                    <li>• On-prem / VPC</li>
                  </ul>
                  <div className="mt-6 text-2xl font-semibold text-white">Contact us</div>
                  <button className="mt-6 w-full rounded-lg border border-white/20 text-white py-3 hover:bg-white/6 transition">Contact sales</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
