"use client";

import React, { useEffect, useState } from 'react';
import { subscribeToContactMessages, ContactMessage } from '@techinejigbo/firebase/src/firestore';
import { MessageSquare, Mail, User } from 'lucide-react';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToContactMessages((data) => {
      setMessages(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <MessageSquare className="text-brand-orange" size={24} />
            Contact Messages
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Read messages submitted through the public site contact form.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-10 text-center text-slate-500">
          No messages have been received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{m.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <User size={14} /> {m.name}
                    </span>
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-brand-orange transition-colors">
                      <Mail size={14} /> {m.email}
                    </a>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg text-slate-700 whitespace-pre-wrap">
                {m.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
