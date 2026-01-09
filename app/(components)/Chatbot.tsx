"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Trash2, Bot, User, Sparkles, Mic, MicOff } from 'lucide-react';
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
    const [isListening, setIsListening] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const textBeforeListeningRef = useRef('');

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

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true; // Use continuous to capture full sentences/pauses
            recognitionRef.current.interimResults = true; // Show real-time feedback

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                textBeforeListeningRef.current = input; // Capture existing text
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
                // Clear existing silence timer on every new result
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                // Set new silence timer (2 seconds)
                silenceTimerRef.current = setTimeout(() => {
                    recognitionRef.current?.stop();
                }, 2000);

                let currentSessionTranscript = '';
                for (let i = 0; i < event.results.length; ++i) {
                    currentSessionTranscript += event.results[i][0].transcript;
                }

                // Combine previous text with new transcript
                // Ensure we don't double spacing if previous text was empty
                const previous = textBeforeListeningRef.current;
                const separator = previous && currentSessionTranscript ? ' ' : '';
                setInput(previous + separator + currentSessionTranscript);
            };
        }

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            recognitionRef.current?.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Removed `input` dependency to avoid re-binding listener which breaks continuous flow

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Your browser does not support voice input.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            // Update the ref before starting in case user typed something manually while stopped
            textBeforeListeningRef.current = input;
            recognitionRef.current.start();
        }
    };

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
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/ask', {
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
                                <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 md:p-2 rounded-[26px] md:rounded-[28px] border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/30 transition-all">
                                    <div className="flex-1 relative flex items-center min-w-0">
                                        <textarea
                                            ref={textareaRef}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={isListening ? "Listening..." : "Ask me anything..."}
                                            rows={1}
                                            className="
                                                w-full pl-3 md:pl-4 pr-10 py-2.5 md:py-3 
                                                bg-transparent
                                                text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400
                                                border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none appearance-none
                                                resize-none overflow-y-auto min-h-[40px] md:min-h-[44px]
                                                text-base md:text-[15px] leading-relaxed
                                                [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full
                                            "
                                            disabled={isLoading}
                                            style={{ maxHeight: '120px' }}
                                        />

                                        {/* Sparkle Icon within input area */}
                                        <div className="absolute right-2 top-2.5 md:top-3 text-slate-400 pointer-events-none">
                                            <Sparkles size={16} className={`transition-opacity duration-200 ${input.trim() ? "opacity-0" : "opacity-70"}`} />
                                        </div>
                                    </div>

                                    {/* Action Buttons Group */}
                                    <div className="flex items-center gap-1 pr-1 pb-1 shrink-0">
                                        {/* Mic Button */}
                                        <button
                                            type="button"
                                            onClick={toggleListening}
                                            disabled={isLoading}
                                            className={`
                                                relative flex items-center justify-center
                                                w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-200
                                                ${isListening
                                                    ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400'
                                                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                                }
                                            `}
                                            title={isListening ? "Stop Listening" : "Start Voice Input"}
                                        >
                                            {isListening && (
                                                <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping"></span>
                                            )}
                                            {isListening ? <MicOff size={18} className="md:w-5 md:h-5" /> : <Mic size={18} className="md:w-5 md:h-5" />}
                                        </button>

                                        {/* Send Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoading || !input.trim()}
                                            className={`
                                                flex items-center justify-center
                                                w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-200
                                                ${input.trim()
                                                    ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105 active:scale-95'
                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            <Send size={16} className={`md:w-[18px] md:h-[18px] ${input.trim() ? "ml-0.5" : ""}`} />
                                        </button>
                                    </div>
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
