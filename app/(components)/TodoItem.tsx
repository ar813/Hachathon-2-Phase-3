"use client";

import { useState } from 'react';
import { Todo } from '@/types/todo';
import Modal from '@/app/(components)/ui/Modal';
import Confetti from '@/app/(components)/ui/Confetti';
import { useToast } from '@/app/(components)/ToastProvider';

interface TodoItemProps {
    todo: Todo;
    onUpdate: (updatedTodo: Todo) => void;
    onDelete: (id: string) => void;
    index: number;
}

export default function TodoItem({ todo, onUpdate, onDelete, index }: TodoItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(todo.title);
    const [editedDescription, setEditedDescription] = useState(todo.description || '');
    const [loading, setLoading] = useState(false);

    // UI States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const { showToast } = useToast();

    // Check if "New" (created within last 5 mins)
    const isNew = new Date().getTime() - new Date(todo.created_at).getTime() < 5 * 60 * 1000;

    const handleToggleCompletion = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/todos/${todo.id}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !todo.completed }),
            });

            if (!response.ok) throw new Error('Failed to toggle completion.');

            const updatedTodo: Todo = await response.json();
            onUpdate(updatedTodo);

            if (updatedTodo.completed) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
                showToast("Task completed! 🎉", "success");
            }
        } catch (err: unknown) {
            console.error(err);
            showToast("Failed to update task", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete todo.');
            onDelete(todo.id);
            showToast("Task deleted", "info");
        } catch (err: unknown) {
            console.error(err);
            showToast("Failed to delete task", "error");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            if (!editedTitle.trim()) {
                showToast("Title cannot be empty", "warning");
                setLoading(false);
                return;
            }
            const response = await fetch(`/api/todos/${todo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editedTitle, description: editedDescription }),
            });

            if (!response.ok) throw new Error('Failed to update todo.');

            const updatedTodo: Todo = await response.json();
            onUpdate(updatedTodo);
            setIsEditing(false);
            showToast("Task updated successfully", "success");
        } catch (err: unknown) {
            console.error(err);
            showToast("Failed to update task", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        const text = `${todo.title}\n${todo.description || ''}`;
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard", "success");
    };

    return (
        <>
            {showConfetti && <Confetti />}

            <li
                className={`group relative bg-white dark:bg-slate-800 border p-4 rounded-xl shadow-sm transition-all duration-200 flex flex-col gap-3
                    ${todo.completed ? 'border-slate-100 dark:border-slate-800 opacity-60' : 'border-slate-200 dark:border-slate-700'}
                    hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md
                `}
            >
                {/* New Badge */}
                {isNew && !todo.completed && (
                    <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-full shadow-lg z-10 animate-bounce">New</span>
                )}

                <div className="flex items-start gap-4">

                    {/* Completion Checkbox (Custom) */}
                    <div className="pt-1">
                        <button
                            onClick={handleToggleCompletion}
                            disabled={loading}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed
                                    ? 'bg-green-500 border-green-500 text-white scale-110'
                                    : 'border-slate-300 dark:border-slate-500 hover:border-blue-500 dark:hover:border-blue-400'
                                }`}
                        >
                            {todo.completed && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                    </div>

                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="w-full text-lg font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-black/20 border-b-2 border-blue-500 focus:outline-none px-2 py-1 rounded-t"
                                    disabled={loading}
                                    autoFocus
                                />
                                <div className="text-xs text-right text-slate-400">{editedTitle.length} chars</div>
                            </div>
                        ) : (
                            <h3 className={`text-lg font-semibold text-slate-800 dark:text-white break-words transition-all ${todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                {todo.title}
                            </h3>
                        )}

                        {isEditing ? (
                            <div className="mt-2 space-y-2">
                                <textarea
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    rows={3}
                                    className="w-full text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none p-2 resize-none"
                                    disabled={loading}
                                    placeholder="Add a description..."
                                ></textarea>
                                <div className="text-xs text-right text-slate-400">{editedDescription.length} chars</div>
                            </div>
                        ) : (
                            todo.description && (
                                <div className={`mt-1 text-sm text-slate-500 dark:text-slate-400 break-words ${todo.completed ? 'opacity-50' : ''}`}>
                                    {todo.description}
                                </div>
                            )
                        )}

                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                            <span>{new Date(todo.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {isEditing ? (
                            <>
                                <button onClick={handleUpdate} disabled={loading} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Save">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </button>
                                <button onClick={() => { setIsEditing(false); setEditedTitle(todo.title); setEditedDescription(todo.description || ''); }} disabled={loading} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Cancel">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Copy">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                                <button onClick={() => setIsEditing(true)} disabled={loading} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Edit">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </button>
                                <button onClick={() => setShowDeleteModal(true)} disabled={loading} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Delete">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </li>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Task"
            >
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                        Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{todo.title}"</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
