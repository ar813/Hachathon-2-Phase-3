"use client";

import { useState } from 'react';
import AddTodoForm from '@/app/(components)/AddTodoForm';
import TodoDashboard from '@/app/(components)/TodoDashboard';
import Chatbot from '@/app/(components)/Chatbot';
import { Todo } from '@/types/todo';

export default function Dashboard() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTodoAdded = (newTodo: Todo) => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <main className="flex w-full flex-col items-center p-4 sm:p-8 mt-10 min-h-screen relative">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-slate-800 dark:text-white tracking-tight">
                        My Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Manage your tasks efficiently.</p>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Add Task Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-xl mr-3 shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </span>
                            Create New Task
                        </h2>
                        <AddTodoForm onTodoAdded={handleTodoAdded} />
                    </div>

                    {/* Dashboard/List Section */}
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-xl mr-3 shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                </svg>
                            </span>
                            Your Tasks
                        </h2>
                        {/* The Dashboard Component handles Filter/Sort/Search/List */}
                        <TodoDashboard refreshKey={refreshKey} />
                    </div>
                </div>
            </div>
            <Chatbot onActionSuccess={() => setRefreshKey(prev => prev + 1)} />
        </main>
    );
}

