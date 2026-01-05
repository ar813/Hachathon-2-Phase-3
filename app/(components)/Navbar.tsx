"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Use better-auth session hook
    const { data: session, isPending } = useSession();
    const isLoggedIn = !!session?.user;
    const userName = session?.user?.name || "";
    const userEmail = session?.user?.email || "";

    // Handle Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Handle Dark Mode
    useEffect(() => {
        // Check local storage or preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setDarkMode(true);
        }
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const getInitials = (name: string) => {
        return name
            ? name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : 'U';
    };

    if (isPending) return null; // Or a skeleton

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800" : "bg-transparent border-b border-transparent"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                            <div className="bg-blue-600 rounded-lg p-1.5 text-white group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Todo<span className="text-blue-600">.</span></span>
                        </Link>
                    </div>


                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle Dark Mode"
                        >
                            {darkMode ? (
                                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            ) : (
                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            )}
                        </button>

                        {!isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Login
                                </Link>
                                <Link href="/signup" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                                    Sign Up
                                </Link>
                            </div>
                        ) : (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]">
                                        <div className="h-full w-full rounded-full bg-white dark:bg-slate-900 p-0.5 overflow-hidden">
                                            {session?.user?.image ? (
                                                <Image src={session.user.image} alt="User" width={32} height={32} className="rounded-full object-cover h-full w-full" unoptimized />
                                            ) : (
                                                <div className="h-full w-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-600 uppercase">
                                                    {getInitials(userName)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{userName}</p>
                                        <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{userEmail}</p>
                                    </div>
                                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-2 transform opacity-100 scale-100 transition-all z-50">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Signed in as</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{userEmail}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <svg className="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                                Dashboard
                                            </Link>
                                            <a href="#" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <svg className="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                Settings
                                            </a>
                                        </div>
                                        <div className="py-1 border-t border-slate-100 dark:border-slate-700">
                                            <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>
                </div>
            </div>

        </nav>
    );
}
