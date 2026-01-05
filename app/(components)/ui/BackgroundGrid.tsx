"use client";

// import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const BackgroundGrid = () => {
    // const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
            {/* Base background color */}
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-500" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* 3D Glow Orbs */}
            <div className="absolute top-0 left-0 right-0 h-[500px] w-full overflow-hidden pointer-events-none">
                <div className="absolute left-[calc(50%-20rem)] top-[-10rem] h-[40rem] w-[40rem] rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-[80px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
                <div className="absolute right-[calc(50%-20rem)] top-[-10rem] h-[40rem] w-[40rem] rounded-full bg-purple-400/20 dark:bg-indigo-500/10 blur-[80px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
            </div>
        </div>
    );
};
