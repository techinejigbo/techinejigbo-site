"use client";

import React, { useEffect, useState } from 'react';
import { getQuestions, saveQuestion, deleteQuestion, QuestionData } from '@techinejigbo/firebase/src/firestore';
import { Database, Plus, Edit2, Trash2, Save, X, BookOpen } from 'lucide-react';
// @ts-ignore
import { canvaQuestions, htmlQuestions } from '../../../questions';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState('graphic-design');
  const [allCourses, setAllCourses] = useState<string[]>(['graphic-design', 'web-development']);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionData> | null>(null);

  useEffect(() => {
    loadAllQuestions();
  }, []);

  async function loadAllQuestions() {
    setLoading(true);
    // Since we don't have a getAllQuestions helper, we'll fetch known ones. 
    // Wait, the user wants to add new courses dynamically.
    // If we only have getQuestions(courseId), we can't easily fetch ALL questions across all courses 
    // unless we know the courseIds.
    // Let's iterate through the known courses.
    const allQ: QuestionData[] = [];
    for (const course of allCourses) {
      const q = await getQuestions(course);
      allQ.push(...q);
    }
    setQuestions(allQ);
    setLoading(false);
  }

  const handleSeed = async () => {
    if (!window.confirm("Are you sure you want to seed the hardcoded questions to Firestore? This might create duplicates if already seeded.")) return;
    setIsSeeding(true);
    try {
      for (const q of canvaQuestions) {
        await saveQuestion({
          courseId: 'graphic-design',
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        });
      }
      for (const q of htmlQuestions) {
        await saveQuestion({
          courseId: 'web-development',
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        });
      }
      alert("Seeding complete!");
      loadAllQuestions();
    } catch (e) {
      alert("Error seeding questions.");
    }
    setIsSeeding(false);
  };

  const handleAddNewCourse = () => {
    const newCourse = window.prompt("Enter the new course ID (e.g., 'python', 'cybersecurity'):");
    if (newCourse && newCourse.trim() !== '') {
      const formatted = newCourse.trim().toLowerCase();
      if (!allCourses.includes(formatted)) {
        setAllCourses([...allCourses, formatted]);
      }
      setActiveCourse(formatted);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    
    try {
      const result = await saveQuestion(editingQuestion);
      setEditingQuestion(null);
      // Reload the specific course to update the UI
      const updatedQ = await getQuestions(editingQuestion.courseId as string);
      setQuestions(prev => [
        ...prev.filter(q => q.courseId !== editingQuestion.courseId),
        ...updatedQ
      ]);
    } catch (err) {
      alert("Failed to save question.");
    }
  };

  const handleDelete = async (id: string, courseId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(id);
        setQuestions(prev => prev.filter(q => q.id !== id));
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const currentQuestions = questions.filter(q => q.courseId === activeCourse);

  return (
    <div className="space-y-6">
      
      {/* Header & Seeding */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900">Question Bank Manager</h2>
          <p className="text-sm text-slate-500 mt-1">Manage exam questions for all courses.</p>
        </div>
        <button 
          onClick={handleSeed}
          disabled={isSeeding}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Database size={16} />
          {isSeeding ? "Seeding..." : "Seed Initial Questions"}
        </button>
      </div>

      {/* Course Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {allCourses.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCourse(c)}
            className={`px-4 py-2 font-medium capitalize text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeCourse === c
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {c.replace('-', ' ')}
          </button>
        ))}
        <button 
          onClick={handleAddNewCourse}
          className="px-4 py-2 rounded-t-lg text-sm font-bold text-brand-orange hover:bg-brand-orange/5 transition-colors flex items-center gap-1"
        >
          <Plus size={16} />
          New Course
        </button>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-lg text-slate-900 capitalize flex items-center gap-2">
            <BookOpen size={20} className="text-brand-orange" />
            {activeCourse} Questions
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{currentQuestions.length}</span>
          </h3>
          <button
            onClick={() => setEditingQuestion({
              courseId: activeCourse,
              question: '',
              options: { A: '', B: '', C: '', D: '' },
              correctAnswer: 'A'
            })}
            className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading questions...</div>
        ) : currentQuestions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center">
            <Database size={32} className="mb-2 opacity-50" />
            <p>No questions found for this course.</p>
            <p className="text-sm mt-1">Click "Add Question" or "Seed Initial Questions" to begin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentQuestions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:border-brand-orange/30 transition-colors relative group">
                <div className="pr-16">
                  <p className="font-semibold text-slate-900 mb-3"><span className="text-brand-orange mr-2">{idx + 1}.</span>{q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <div className={`p-2 rounded ${q.correctAnswer === 'A' ? 'bg-emerald-100/50 font-semibold text-emerald-900' : 'bg-white border border-slate-100'}`}>A. {q.options.A}</div>
                    <div className={`p-2 rounded ${q.correctAnswer === 'B' ? 'bg-emerald-100/50 font-semibold text-emerald-900' : 'bg-white border border-slate-100'}`}>B. {q.options.B}</div>
                    <div className={`p-2 rounded ${q.correctAnswer === 'C' ? 'bg-emerald-100/50 font-semibold text-emerald-900' : 'bg-white border border-slate-100'}`}>C. {q.options.C}</div>
                    <div className={`p-2 rounded ${q.correctAnswer === 'D' ? 'bg-emerald-100/50 font-semibold text-emerald-900' : 'bg-white border border-slate-100'}`}>D. {q.options.D}</div>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingQuestion(q)} className="p-2 text-slate-400 hover:text-brand-orange bg-white rounded-lg shadow-sm border border-slate-200">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(q.id, q.courseId)} className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-lg shadow-sm border border-slate-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-display font-bold text-lg">{editingQuestion.id ? 'Edit Question' : 'Add New Question'}</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveQuestion} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course ID</label>
                <input 
                  type="text" 
                  value={editingQuestion.courseId} 
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Question Text</label>
                <textarea 
                  required
                  value={editingQuestion.question}
                  onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['A', 'B', 'C', 'D'] as const).map(opt => (
                  <div key={opt}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Option {opt}</label>
                    <input 
                      required
                      type="text"
                      value={editingQuestion.options?.[opt] || ''}
                      onChange={e => setEditingQuestion({
                        ...editingQuestion, 
                        options: { ...editingQuestion.options, [opt]: e.target.value } as any
                      })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Answer</label>
                <select 
                  value={editingQuestion.correctAnswer}
                  onChange={e => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value as any})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingQuestion(null)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold text-white bg-brand-orange hover:bg-brand-orange-dark rounded-lg flex items-center gap-2 transition-colors">
                  <Save size={16} /> Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
