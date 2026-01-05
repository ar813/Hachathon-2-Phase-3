"use client";

import { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, message, type };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-24 right-4 z-50 space-y-2 max-w-sm w-full px-4 sm:px-0">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`rounded-xl p-4 shadow-xl border transform transition-all duration-300 animate-slide-in backdrop-blur-md ${toast.type === 'success'
                                ? 'bg-green-50/90 dark:bg-green-900/20 border-green-200 dark:border-green-500/30'
                                : toast.type === 'error'
                                    ? 'bg-red-50/90 dark:bg-red-900/20 border-red-200 dark:border-red-500/30'
                                    : toast.type === 'warning'
                                        ? 'bg-yellow-50/90 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-500/30'
                                        : 'bg-blue-50/90 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className="flex-shrink-0 pt-0.5">
                                {toast.type === 'success' && (
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                )}
                                {toast.type === 'error' && (
                                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                                {toast.type === 'warning' && (
                                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                )}
                                {toast.type === 'info' && (
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                            </div>

                            {/* Message */}
                            <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                                {toast.message}
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
