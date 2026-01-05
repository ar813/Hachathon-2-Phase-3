"use client";

import { useState } from 'react';
import TodoList from '@/app/(components)/TodoList';
import { useToast } from '@/app/(components)/ToastProvider';
import { Trash2, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'newest' | 'oldest' | 'a-z';
type ViewType = 'list' | 'grid';

export default function TodoDashboard({ refreshKey }: { refreshKey: number }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('newest');
    const [viewMode, setViewMode] = useState<ViewType>('list');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Create a local refresh trigger to combine with the prop
    const [dashboardRefresh, setDashboardRefresh] = useState(0);
    const { showToast } = useToast();

    const handleDeleteAllClick = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteAll = async () => {
        setShowDeleteModal(false);
        setIsDeleting(true);
        try {
            const response = await fetch('/api/todos', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete tasks');
            }

            showToast('All tasks deleted successfully', 'success');
            setDashboardRefresh(prev => prev + 1);
        } catch (error) {
            console.error(error);
            showToast('Failed to delete tasks', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full space-y-6 relative">
            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 w-full max-w-sm overflow-hidden"
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400">
                                    <AlertTriangle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete All Tasks?</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        This action cannot be undone. All your tasks will be permanently removed.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full mt-2">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteAll}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/30 transition-all active:scale-95"
                                    >
                                        Delete All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Dashboard Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                {/* Search */}
                <div className="relative w-full md:w-1/3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters & Actions */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide items-center">
                    {/* Delete All Button */}
                    <button
                        onClick={handleDeleteAllClick}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-900/50"
                        title="Delete All Tasks"
                    >
                        <Trash2 size={20} />
                    </button>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    {/* Filter Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown (Simple Select for now) */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortType)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="a-z">A-Z</option>
                    </select>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Todo List with Props - Combine prop key with local key trigger */}
            <TodoList
                refreshKey={refreshKey + dashboardRefresh}
                searchQuery={searchQuery}
                filter={filter}
                sortBy={sortBy}
                viewMode={viewMode}
            />
        </div>
    );
}
