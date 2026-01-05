"use client";

import Link from 'next/link';
import { useSession } from "@/lib/auth-client";
import { BackgroundGrid } from "@/app/(components)/ui/BackgroundGrid";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";

export default function LandingPage() {

    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;

    return (
        <div className="relative flex flex-col items-center w-full min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">

            {/* 3D Background */}
            <BackgroundGrid />

            {/* Hero Section */}
            <section className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 text-center pt-20">

                {/* Status Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-sm mb-8 animate-fade-in-up">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">v2.0 Now Available</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 max-w-5xl leading-[1.1] sm:leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400">
                        Master your day.
                    </span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
                        Achieve more.
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl leading-relaxed mx-auto">
                    The task management platform designed for professionals who value clarity, focus, and speed. seamless, secure, and beautiful.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                    <Link
                        href={isLoggedIn ? "/dashboard" : "/signup"}
                        className="group relative px-8 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center min-w-[200px]"
                    >
                        {isLoggedIn ? "Go to Dashboard" : "Start for Free"}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 dark:ring-black/10 group-hover:ring-4 transition-all" />
                    </Link>

                    <Link
                        href={isLoggedIn ? "/dashboard" : "/login"}
                        className="px-8 py-4 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur text-slate-700 dark:text-slate-200 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center min-w-[200px]"
                    >
                        {isLoggedIn ? "Manage Tasks" : "Login"}
                    </Link>
                </div>

                {/* Social Proof / Tech Stack */}
                <div className="mt-20 pt-10 border-t border-slate-200/60 dark:border-slate-800/60 w-full max-w-xl">
                    <p className="text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold mb-6">Powered By Modern Tech</p>
                    <div className="flex justify-between items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500 gap-6">
                        {/* Replaced Text with simple span placeholders for logos to avoid external image deps issues */}
                        <span className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><div className="w-6 h-6 bg-black rounded-full"></div>Next.js</span>
                        <span className="text-xl font-bold text-blue-500 flex items-center gap-2"><div className="w-6 h-6 bg-blue-500 rounded-full"></div>React</span>
                        <span className="text-xl font-bold text-teal-500 flex items-center gap-2"><div className="w-6 h-6 bg-teal-500 rounded-full"></div>Tailwind</span>
                    </div>
                </div>
            </section>

            {/* Feature Grid Section */}
            <section className="relative z-10 w-full max-w-7xl px-4 py-24 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Why choose Todo?</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Built with a focus on usability and performance, so you can spend less time organizing and more time doing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Lightning Fast</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Optimized for speed with instant page loads and seamless interactions. No waiting, just doing.
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Stay Organized</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Intuitive categorization, filtering, and search to keep your tasks under control.
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Shield className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Secure by Design</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Enterprise-grade security to ensure your personal data remains private and protected.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 w-full py-12 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg">
                            <span className="font-bold text-lg">T</span>
                        </div>
                        <span className="font-bold text-xl text-slate-800 dark:text-slate-200">Todo.</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} Todo App. Crafted with ❤️ for Hackathon.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</a>
                        <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</a>
                        <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
