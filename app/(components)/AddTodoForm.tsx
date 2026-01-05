"use client";

import { useState } from 'react';
import { Todo } from '@/types/todo';
import { useToast } from '@/app/(components)/ToastProvider';

interface AddTodoFormProps {
  onTodoAdded: (newTodo: Todo) => void;
}

export default function AddTodoForm({ onTodoAdded }: AddTodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title.trim()) {
      showToast('Title cannot be empty', 'warning');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to add todo.');
      }

      const newTodo: Todo = await response.json();
      onTodoAdded(newTodo);
      setTitle('');
      setDescription('');
      showToast('Task added successfully!', 'success');
    } catch (err: unknown) {
      console.error(err);
      showToast('Failed to add task', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative group">
        <input
          type="text"
          id="title"
          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner group-hover:shadow-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          placeholder="What needs to be done?"
          required
        />
        <div className="absolute top-3.5 right-4 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {title.length} chars
        </div>
      </div>

      <div className="relative group">
        <textarea
          id="description"
          rows={3}
          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none shadow-inner group-hover:shadow-md"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          placeholder="Add some details... (Optional)"
        ></textarea>
        <div className="absolute top-3.5 right-4 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {description.length} chars
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </>
        ) : (
          'Add Task'
        )}
      </button>
    </form>
  );
}
