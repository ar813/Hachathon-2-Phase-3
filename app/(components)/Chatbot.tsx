"use client";

import { useState, useRef, useEffect } from 'react';
import {
    MessageCircle, X, Send, Loader2, Sparkles, RefreshCcw, Command,
    Plus, Trash2, CheckCircle2, List, Trash, Edit3, Terminal,
    Monitor, Activity, Cpu, ChevronRight, Layout
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useSession } from '@/lib/auth-client';

interface Message {
    role: 'user' | 'bot';
    text: string;
}

interface Action {
    type: string;
    details: string;
    timestamp: string;
}

interface ChatbotProps {
    onActionSuccess?: () => void;
}

export default function Chatbot({ onActionSuccess }: ChatbotProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: 'Welcome to Nexus OS. I am your AI Core. System is active and ready for task operations.' }
    ]);
    const [actionHistory, setActionHistory] = useState<Action[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCommands, setShowCommands] = useState(false);
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
    const [showHistory, setShowHistory] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const commands = [
        { icon: <Plus size={16} />, label: 'Add Todo', value: '/add', description: 'Create task', template: '/add ' },
        { icon: <List size={16} />, label: 'Show Todos', value: '/show', description: 'List tasks', template: '/show' },
        { icon: <Edit3 size={16} />, label: 'Update Task', value: '/update', description: 'Modify task', template: '/update task ' },
        { icon: <CheckCircle2 size={16} />, label: 'Mark Task', value: '/mark', description: 'Toggle state', template: '/mark task ' },
        { icon: <Trash2 size={16} />, label: 'Delete Task', value: '/delete', description: 'Remove task', template: '/delete task ' },
        { icon: <Trash size={16} />, label: 'Delete All', value: '/deleteall', description: 'Wipe all', template: '/delete all tasks' },
    ];

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const recordAction = (text: string) => {
        const lower = text.toLowerCase();
        let action = null;

        if (lower.includes('added') || lower.includes('created')) action = 'CREATE';
        else if (lower.includes('updated') || lower.includes('changed') || lower.includes('marked')) action = 'MODIFY';
        else if (lower.includes('deleted') || lower.includes('removed')) action = 'REMOVE';

        if (action) {
            const newAction = {
                type: action,
                details: text.length > 50 ? text.substring(0, 47) + '...' : text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setActionHistory(prev => [newAction, ...prev].slice(0, 10));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);
        setShowCommands(value.startsWith('/'));
    };

    const selectCommand = (template: string) => {
        setInput(template);
        setShowCommands(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showCommands) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedCommandIndex(prev => (prev + 1) % commands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedCommandIndex(prev => (prev - 1 + commands.length) % commands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                selectCommand(commands[selectedCommandIndex].template);
            } else if (e.key === 'Escape') {
                setShowCommands(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        if (!session?.user?.id) {
            setMessages(prev => [...prev, { role: 'bot', text: 'AUTHENTICATION_REQUIRED: Please sign in to establish connection.' }]);
            return;
        }

        const userMessage = input.trim();
        const userId = session.user.id;

        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        let finalPrompt = userMessage;
        if (userMessage.startsWith('/')) {
            finalPrompt = `[SYSTEM INSTRUCTION: You are an AI Task Manager. The user is using a slash command. 
            - IF they use /add: Check if they provided a title and description. If NOT, do NOT create the task yet; instead, ASK the user to provide the missing title/description.
            - IF they use /add todo user: Immediately SHOW a list of all existing tasks.
            - IF intent is ambiguous: Always ASK for clarification.
            - INTERACTIVE FORMATTING: Whenever you list tasks, you MUST use the format: "[ID: #] Task Title".
            User Message: ]\n\n${userMessage}`;
        }

        try {
            const response = await fetch('http://localhost:8000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    userId: userId,
                    history: messages,
                    actionHistory: actionHistory
                }),
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
            recordAction(data.reply);
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: 'SYSTEM_ERROR: Connection lost. Re-attempting...' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'bot', text: 'CORE_RESET_COMPLETE: Memory wiped. Waiting for new instructions.' }]);
        setActionHistory([]);
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 50, rotateX: 10 },
        visible: {
            opacity: 1, scale: 1, y: 0, rotateX: 0,
            transition: { type: "spring", damping: 20, stiffness: 200 }
        },
        exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 perspective-1000">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="
                                relative
                                w-full max-w-[900px] h-[85vh] max-h-[800px]
                                nexus-glass
                                rounded-[2.5rem]
                                flex flex-row
                                overflow-hidden
                                z-[101]
                            "
                        >
                            {/* Left Sidebar - History (Nexus HUD Style) */}
                            <AnimatePresence>
                                {showHistory && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 260, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        className="hidden md:flex flex-col border-r border-slate-800 bg-slate-950/40"
                                    >
                                        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                                            <Activity size={18} className="text-blue-500 animate-pulse" />
                                            <span className="text-xs font-black tracking-widest text-slate-400 uppercase">Log_History</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
                                            {actionHistory.map((action, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 group hover:border-blue-500/30 transition-all">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-bold text-blue-500">{action.type}</span>
                                                        <span className="text-[9px] text-slate-500">{action.timestamp}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 leading-tight">{action.details}</p>
                                                </div>
                                            ))}
                                            {actionHistory.length === 0 && (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-30">
                                                    <Cpu size={32} />
                                                    <span className="text-[10px] font-bold">NO_DATA</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Main Chat Area */}
                            <div className="flex-1 flex flex-col relative">
                                {/* Header */}
                                <div className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-white/5 backdrop-blur-md">
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-12 transition-transform hover:rotate-0">
                                                <Cpu size={24} className="text-white" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-xl text-white tracking-tighter">NEXUS AI</h3>
                                                <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20">V2.0</span>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-50">
                                                <div className="w-1 h-1 bg-blue-400 rounded-full" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantum_Core_Linked</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setShowHistory(!showHistory)} className={`p-3 rounded-2xl transition-all ${showHistory ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-400 hover:bg-white/5'}`}>
                                            <Layout size={20} />
                                        </button>
                                        <button onClick={clearChat} className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                            <RefreshCcw size={20} />
                                        </button>
                                        <button onClick={() => setIsOpen(false)} className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scrollbar-none">
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`
                                                relative max-w-[80%] px-6 py-5 text-[15px] leading-relaxed transition-all
                                                ${msg.role === 'user'
                                                    ? 'bg-slate-800 text-white rounded-[2rem] rounded-tr-none shadow-xl border border-white/5'
                                                    : 'bg-white/5 backdrop-blur-md text-slate-200 rounded-[2rem] rounded-tl-none border border-white/10 shadow-lg'
                                                }
                                            `}>
                                                {msg.role === 'bot' && (
                                                    <div className="absolute top-0 left-0 w-1 h-12 bg-blue-500 rounded-full -translate-x-1 translate-y-4 shadow-[0_0_10px_#3b82f6]" />
                                                )}

                                                <div className="space-y-4">
                                                    <div>
                                                        {msg.text.split(/(\[ID: \d+\])/g).map((part, i) => {
                                                            const match = part.match(/\[ID: (\d+)\]/);
                                                            if (match) {
                                                                return (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => selectCommand(`/update task ${match[1]}`)}
                                                                        className="inline-flex items-center gap-1.5 mx-1 px-3 py-1 bg-blue-600 text-white rounded-lg font-black text-[11px] shadow-lg shadow-blue-500/40 hover:scale-110 transition-transform active:scale-90"
                                                                    >
                                                                        <Terminal size={10} />
                                                                        #{match[1]}
                                                                    </button>
                                                                );
                                                            }
                                                            return part;
                                                        })}
                                                    </div>

                                                    {msg.text.includes('[ID:') && (
                                                        <div className="flex gap-3 overflow-x-auto no-scrollbar pt-2">
                                                            {Array.from(msg.text.matchAll(/\[ID: (\d+)\]\s*([^ \n\[]+)/g)).map((match, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => selectCommand(`/update task ${match[1]}`)}
                                                                    className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-blue-600 rounded-xl border border-white/10 transition-all group active:scale-95"
                                                                >
                                                                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-[10px] font-black group-hover:bg-white group-hover:text-blue-600">
                                                                        {match[1]}
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-tighter">{match[2].substring(0, 12)}</span>
                                                                    <ChevronRight size={12} className="opacity-30 group-hover:opacity-100" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 backdrop-blur-md px-6 py-5 rounded-[2rem] rounded-tl-none border border-white/10 flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                </div>
                                                <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase">Processing...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* HUD Command Menu */}
                                <AnimatePresence>
                                    {showCommands && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                            className="absolute bottom-[110px] left-8 right-8 bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-blue-500/30 overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.2)] z-[102]"
                                        >
                                            <div className="p-4 bg-blue-600/10 border-b border-blue-500/20 flex items-center justify-between px-6">
                                                <div className="flex items-center gap-2">
                                                    <Command size={14} className="text-blue-500" />
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Nexus_HUD_Overload</span>
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Select_Directive</div>
                                            </div>
                                            <div className="max-h-[320px] overflow-y-auto py-3 px-3 space-y-1">
                                                {commands.map((cmd, idx) => (
                                                    <button
                                                        key={cmd.value}
                                                        onClick={() => selectCommand(cmd.template)}
                                                        onMouseEnter={() => setSelectedCommandIndex(idx)}
                                                        className={`
                                                            w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all
                                                            ${idx === selectedCommandIndex ? 'bg-blue-600 shadow-xl shadow-blue-500/20' : 'hover:bg-white/5'}
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className={`p-3 rounded-xl ${idx === selectedCommandIndex ? 'bg-white/20' : 'bg-slate-800 text-slate-400'}`}>
                                                                {cmd.icon}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className={`text-sm font-black tracking-tight ${idx === selectedCommandIndex ? 'text-white' : 'text-slate-200'}`}>
                                                                    {cmd.value}
                                                                </div>
                                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${idx === selectedCommandIndex ? 'text-blue-100' : 'text-slate-500'}`}>
                                                                    {cmd.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {idx === selectedCommandIndex && (
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-white px-3 py-1.5 bg-black/20 rounded-lg">
                                                                INITIATE <ChevronRight size={12} />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Input Console */}
                                <div className="p-8 bg-black/20 backdrop-blur-xl border-t border-white/5 relative">
                                    <form onSubmit={handleSubmit} className="flex gap-4">
                                        <div className="flex-1 relative group">
                                            <div className="absolute inset-0 bg-blue-500/5 rounded-[1.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={input}
                                                onChange={handleInputChange}
                                                onKeyDown={handleKeyDown}
                                                placeholder="COMMAND_INPUT_REQUIRED..."
                                                className="
                                                    relative w-full px-8 py-5
                                                    bg-slate-900 shadow-inner
                                                    text-white placeholder:text-slate-700
                                                    rounded-[1.5rem] border border-white/5
                                                    focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10
                                                    transition-all text-sm font-bold tracking-tight
                                                "
                                                disabled={isLoading}
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                                                <span className="p-1 px-2 rounded-md bg-slate-800 text-[10px] font-black text-slate-500 border border-white/5">/</span>
                                                <span className="p-1 px-1.5 rounded-md bg-slate-800 text-[10px] font-black text-slate-500 border border-white/5">Enter</span>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading || !input.trim()}
                                            className="
                                                px-8
                                                bg-gradient-to-tr from-blue-600 to-indigo-600
                                                hover:from-blue-500 hover:to-indigo-500
                                                text-white
                                                rounded-[1.5rem]
                                                shadow-xl shadow-blue-500/20 border border-white/10
                                                disabled:opacity-20 disabled:grayscale
                                                transition-all active:scale-95 active:rotate-1
                                                flex items-center justify-center
                                            "
                                        >
                                            <Send size={24} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Launcher Button (Nexus Floating Node) */}
            <div className="fixed bottom-10 right-10 z-50">
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="
                        relative w-20 h-20
                        bg-slate-950 dark:bg-white
                        text-white dark:text-slate-900
                        rounded-[2rem]
                        shadow-2xl shadow-blue-500/30
                        flex items-center justify-center
                        border border-white/10
                        transition-all
                        group
                    "
                >
                    <div className="absolute inset-0 bg-blue-500/20 rounded-[2rem] animate-pulse-glow" />
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                                <X size={32} />
                            </motion.div>
                        ) : (
                            <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                <div className="flex flex-col items-center">
                                    <Monitor size={32} className="group-hover:text-blue-500 transition-colors" />
                                    <span className="text-[8px] font-black tracking-widest mt-1">NEXUS</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
}
