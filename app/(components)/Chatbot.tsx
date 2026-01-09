"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Trash2, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/lib/auth-client';

interface Message {
    role: 'user' | 'bot';
    text: string;
}

interface ChatbotProps {
    onActionSuccess?: () => void;
}

export default function Chatbot({ onActionSuccess }: ChatbotProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: 'Hello! I am your advanced AI assistant. Ready to help you organize your tasks.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Max height 120px
        }
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            if (window.innerWidth > 768) {
                setTimeout(() => textareaRef.current?.focus(), 300);
            }
        }
    }, [messages, isOpen]);

    useEffect(() => {
        adjustTextareaHeight();
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (!session?.user?.id) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Please sign in to continue.' }]);
            return;
        }

        const userMessage = input.trim();
        const userId = session.user.id;

        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');

        // Reset height immediately after send
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://backend-phase-3.onrender.com/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userMessage,
                    userId: userId,
                    history: messages
                }),
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
            if (onActionSuccess) onActionSuccess();
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: 'Connection error. Please check your network.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'bot', text: 'Chat cleared. How can I assist you now?' }]);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 text-sans">
                        {/* Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Chat Window Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={`
                                relative z-[101] flex flex-col overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl
                                w-full h-full rounded-none
                                md:w-[600px] md:h-[700px] md:rounded-3xl md:border md:border-white/20 dark:md:border-slate-700
                            `}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                        <Bot size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg tracking-tight">AI Assistant</h3>
                                        <div className="flex items-center gap-1.5 opacity-80">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span className="text-xs font-medium">Always Online</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={clearChat}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        title="Clear Chat"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={idx}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                            ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600'}
                                        `}>
                                            {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                                        </div>

                                        <div className={`
                                            max-w-[80%] p-4 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words
                                            ${msg.role === 'user'
                                                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tr-none border border-slate-200 dark:border-slate-700'
                                                : 'bg-indigo-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-none border border-indigo-100 dark:border-slate-700/50'
                                            }
                                        `}>
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                            <Bot size={14} className="text-white" />
                                        </div>
                                        <div className="bg-indigo-50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl rounded-tl-none border border-indigo-100 dark:border-slate-700/50 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 md:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={textareaRef}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Ask something..."
                                            rows={1}
                                            className="
                                                w-full pl-5 pr-12 py-3.5 
                                                bg-slate-100 dark:bg-slate-800 
                                                text-slate-900 dark:text-slate-100 placeholder:text-slate-400
                                                rounded-2xl border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-950
                                                focus:outline-none focus:ring-0 transition-all font-medium
                                                resize-none overflow-y-auto min-h-[50px]
                                                [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full
                                            "
                                            disabled={isLoading}
                                            style={{ maxHeight: '120px' }}
                                        />
                                        <div className="absolute right-3 top-4 text-slate-400">
                                            <Sparkles size={18} />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="
                                            p-3.5 bg-gradient-to-br from-indigo-600 to-blue-600 
                                            hover:from-indigo-500 hover:to-blue-500 
                                            text-white rounded-2xl shadow-lg shadow-indigo-500/20
                                            disabled:opacity-50 disabled:cursor-not-allowed 
                                            transition-all hover:scale-105 active:scale-95
                                            h-[50px] w-[50px] flex items-center justify-center
                                        "
                                    >
                                        <Send size={22} />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`
                    fixed bottom-8 right-8 z-[90] p-4 
                    bg-gradient-to-r from-blue-600 to-indigo-600 
                    text-white rounded-full 
                    shadow-lg shadow-blue-500/30 border-4 border-white dark:border-slate-900
                    hover:shadow-2xl hover:shadow-blue-500/40
                    transition-all
                    ${isOpen ? 'hidden' : 'flex'}
                `}
            >
                <div className="relative">
                    <MessageCircle size={28} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                </div>
            </motion.button>
        </>
    );
}
