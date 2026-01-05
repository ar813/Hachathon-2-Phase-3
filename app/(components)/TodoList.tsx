"use client";

import { useState, useEffect, useMemo } from 'react';
import { Todo } from '@/types/todo';
import TodoItem from '@/app/(components)/TodoItem';

interface TodoListProps {
  refreshKey: number;
  searchQuery?: string;
  filter?: 'all' | 'active' | 'completed';
  sortBy?: 'newest' | 'oldest' | 'a-z';
  viewMode?: 'list' | 'grid';
}

export default function TodoList({
  refreshKey,
  searchQuery = '',
  filter = 'all',
  sortBy = 'newest',
  viewMode = 'list'
}: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch todos.');
      }
      const data: Todo[] = await response.json();
      setTodos(data);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [refreshKey]);

  const handleUpdateTodo = (updatedTodo: Todo) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
  };

  const handleDeleteTodo = (deletedTodoId: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== deletedTodoId));
  };

  // Client-side Filtering & Sorting
  const processedTodos = useMemo(() => {
    let result = [...todos];

    // 1. Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // 2. Filter
    if (filter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter(t => t.completed);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'a-z') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [todos, searchQuery, filter, sortBy]);

  if (loading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center text-red-600 dark:text-red-400">
        <p>Error: {error}</p>
        <button onClick={fetchTodos} className="mt-2 text-sm underline hover:text-red-800 dark:hover:text-red-300">Try Again</button>
      </div>
    );
  }

  if (processedTodos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white/50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
        <div className="w-24 h-24 mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No tasks found</h3>
        <p className="text-slate-500 dark:text-slate-400">
          {searchQuery ? `No matches for "${searchQuery}"` : "You're all caught up! Add a new task to get started."}
        </p>
      </div>
    );
  }

  return (
    <ul className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4 w-full'}>
      {processedTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={handleUpdateTodo}
          onDelete={handleDeleteTodo}
        />
      ))}
    </ul>
  );
}
