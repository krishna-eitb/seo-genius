// 'use client'
// import { signIn, useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { useEffect, useRef } from 'react'
// import { gsap } from 'gsap'

// export default function LoginPage() {
//   const { data: session } = useSession()
//   const router = useRouter()
//   const containerRef = useRef<HTMLDivElement>(null)
//   const cardRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (session) {
//       router.push('/dashboard')
//     }
//   }, [session, router])

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       gsap.fromTo('.login-line', { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.1, ease: 'power3.out' })
//       gsap.fromTo('.login-hero', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' })
//       gsap.fromTo('.login-card', { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.6, ease: 'power3.out' })
//       gsap.fromTo('.login-tag', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, delay: 0.9, ease: 'power2.out' })
//     }, containerRef)
//     return () => ctx.revert()
//   }, [])

//   return (
//     <div ref={containerRef} className="min-h-screen bg-ink-950 relative overflow-hidden flex flex-col items-center justify-center px-4">
//       {/* Background grid */}
//       <div className="absolute inset-0 bg-grid-pattern opacity-100" />

//       {/* Ambient orbs */}
//       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-green/5 rounded-full blur-3xl pointer-events-none" />
//       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow-blue/5 rounded-full blur-3xl pointer-events-none" />
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-purple/3 rounded-full blur-3xl pointer-events-none" />

//       {/* Decorative lines */}
//       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glow-green/40 to-transparent login-line" style={{ transformOrigin: 'left' }} />
//       <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glow-blue/40 to-transparent login-line" style={{ transformOrigin: 'left' }} />

//       <div className="relative z-10 w-full max-w-md">
//         {/* Hero text */}
//         <div className="login-hero text-center mb-12">
//           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-glow-green/20 text-xs text-glow-green font-mono mb-6">
//             <span className="w-1.5 h-1.5 rounded-full bg-glow-green animate-pulse" />
//             AI-Powered SEO Intelligence
//           </div>
//           <h1 className="font-display text-5xl font-bold tracking-tight mb-4">
//             <span className="gradient-text">SEO Genius</span>
//           </h1>
//           <p className="text-ink-300 text-lg leading-relaxed">
//             Chat with your Search Console data.<br />
//             Get expert SEO analysis in seconds.
//           </p>
//         </div>

//         {/* Feature tags */}
//         <div className="flex flex-wrap justify-center gap-2 mb-10">
//           {['Real-time GSC data', 'AI suggestions', 'Priority scoring', 'Export reports'].map(tag => (
//             <span key={tag} className="login-tag px-3 py-1 glass rounded-full text-xs text-ink-300 border border-white/5">
//               {tag}
//             </span>
//           ))}
//         </div>

//         {/* Login card */}
//         <div ref={cardRef} className="login-card animated-border rounded-2xl">
//           <div className="glass rounded-2xl p-8">
//             <div className="text-center mb-8">
//               <div className="text-2xl font-display font-bold text-white mb-2">Connect & Analyze</div>
//               <p className="text-ink-300 text-sm">
//                 Sign in with Google to connect your Search Console properties
//               </p>
//             </div>

//             <button
//               onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
//               className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/20"
//             >
//               <svg width="20" height="20" viewBox="0 0 24 24">
//                 <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//                 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//                 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//                 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//               </svg>
//               Continue with Google
//             </button>

//             <p className="text-center text-xs text-ink-400 mt-6">
//               We only request read-only access to your Search Console data.{' '}
//               <span className="text-glow-green/70">Your data is never stored beyond your session.</span>
//             </p>
//           </div>
//         </div>

//         {/* Bottom note */}
//         <p className="text-center text-ink-500 text-xs mt-8">
//           Requires Google Search Console property ownership
//         </p>
//       </div>
//     </div>
//   )
// }
"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);

  // Redirect logic lives in its own effect so it can't interfere
  // with the animation effect's mount/cleanup cycle.
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Animation effect runs once on mount. gsap.context + ctx.revert()
  // guarantees that even if this effect runs twice (React Strict Mode,
  // fast refresh, etc.) the elements are fully reset to their original
  // CSS state before the animation is rebuilt — so it can never get
  // stuck "from 0 opacity to 0 opacity".
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      tl.from(
        [line1Ref.current, line2Ref.current, line3Ref.current],
        {
          y: 80,
          opacity: 0,
          filter: "blur(12px)",
          duration: 1,
          stagger: 0.15,
        }
      ).from(
        cardRef.current,
        {
          y: 30,
          opacity: 0,
          duration: 0.8,
        },
        "-=0.4"
      );

      // Floating heading
      gsap.to(headingRef.current, {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-10 overflow-hidden bg-white"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-aiii.png"
          alt="AI Assistant"
          width={1920}
          height={1080}
          priority
          className="w-full h-full object-contain object-center"
        />
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 min-h-screen px-6">
        <div className="grid min-h-screen lg:grid-cols-3 items-center gap-10">
          {/* LEFT SIDE */}
          <div className="relative h-[650px] space-y-6 hidden xl:block">
            {/* Floating Card 1 */}
            <div
              className="
  group
  backdrop-blur-2xl
  bg-white/60
  border border-white/80
  rounded-[32px]
  p-6
  shadow-[0_20px_80px_rgba(0,0,0,0.08)]
  hover:-translate-y-2
  transition-all
  duration-500
"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Search Visibility
                </span>

                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                  ↗
                </div>
              </div>

              <h3 className="text-5xl font-black text-slate-900">+38%</h3>

              <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-orange-500 to-yellow-400" />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Average organic growth identified
              </p>
            </div>

            <div
              className="
  backdrop-blur-2xl
  bg-white/60
  border border-white/80
  rounded-[32px]
  p-6
  shadow-[0_20px_80px_rgba(0,0,0,0.08)]
"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-600">
                  AI Opportunity Detected
                </span>
              </div>

              <h3 className="text-4xl font-black text-slate-900">10.2K</h3>

              <p className="text-sm text-slate-500 mt-2">
                Untapped keyword impressions
              </p>

              <div className="mt-5 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                  High Impact
                </span>

                <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
                  Quick Win
                </span>
              </div>
            </div>

            <div
              className="
  backdrop-blur-2xl
  bg-gradient-to-br
  from-slate-900
  to-slate-800
  text-white
  rounded-[32px]
  p-6
  shadow-[0_20px_80px_rgba(0,0,0,0.15)]
"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">AI Monitoring</span>

                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
              </div>

              <h3 className="text-5xl font-black mt-5">24/7</h3>

              <p className="mt-3 text-slate-400">
                Continuous ranking intelligence
              </p>
            </div>
          </div>

          {/* CENTER EMPTY - IMAGE ALREADY THERE */}
          <div />

          {/* RIGHT SIDE */}
          <div className="max-w-xl lg:ml-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm mb-8">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />

              <span className="text-sm font-medium text-slate-700">
                AI Powered Search Intelligence
              </span>
            </div>

            {/* Heading */}
            <h1
              ref={headingRef}
              className="text-4xl md:text-6xl xl:text-7xl font-black leading-[0.95] tracking-[-0.06em]"
            >
              <div ref={line1Ref} className="overflow-hidden pb-1 text-slate-900">
                Scale Your
              </div>

              <div
                ref={line2Ref}
                className="
                  overflow-hidden
                  pb-1
                  bg-gradient-to-r
                  from-orange-500
                  via-amber-400
                  to-yellow-500
                  bg-[length:300%_300%]
                  bg-clip-text
                  text-transparent
                  animate-gradient
                "
              >
                Organic Growth
              </div>

              <div ref={line3Ref} className="overflow-hidden pb-1 text-slate-900">
                With AI
              </div>
            </h1>

            {/* Paragraph */}
            <p className="mt-8 text-lg text-slate-600 leading-relaxed">
              Transform Google Search Console data into actionable business
              intelligence. Discover ranking opportunities, traffic drops,
              keyword wins and AI-generated growth recommendations in seconds.
            </p>

            {/* CTA */}
            <div ref={cardRef} className="mt-10 flex flex-wrap gap-4">
              <button
                className="
                px-8
                py-4
                rounded-2xl
                bg-[#111827]
                text-white
                font-semibold
                shadow-xl
                hover:scale-105
                transition-all
                duration-300
              "
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                Connect Google Search Console
              </button>

              <button
                className="
                px-8
                py-4
                rounded-2xl
                bg-white/90
                border
                border-slate-200
                text-slate-700
                font-semibold
                hover:bg-white
                transition-all
              "
              >
                View Demo
              </button>
            </div>

            {/* Trust Line */}
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
              <span>✓ No Credit Card</span>
              <span>✓ Secure OAuth</span>
              <span>✓ 2 Minute Setup</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}