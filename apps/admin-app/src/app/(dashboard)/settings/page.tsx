"use client";

import React, { useEffect, useState } from 'react';
import { getAllowedAdmins, addInvitedStaff, deleteInvitedStaff } from '@techinejigbo/firebase/src/firestore';
import { Shield, Mail, Trash2, UserPlus, Link as LinkIcon, Check } from 'lucide-react';

export default function SettingsPage() {
  const [invites, setInvites] = useState<{email: string, invitedAt: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadInvites();
  }, []);

  async function loadInvites() {
    setLoading(true);
    const data = await getAllowedAdmins();
    setInvites(data.sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()));
    setLoading(false);
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) return;
    
    setIsAdding(true);
    try {
      await addInvitedStaff(newEmail.toLowerCase().trim());
      setNewEmail('');
      loadInvites();
    } catch (err) {
      alert("Failed to send invite.");
    }
    setIsAdding(false);
  };

  const handleRevoke = async (email: string) => {
    if (window.confirm(`Are you sure you want to revoke the invite for ${email}?`)) {
      try {
        await deleteInvitedStaff(email);
        setInvites(prev => prev.filter(i => i.email !== email));
      } catch (err) {
        alert("Failed to revoke invite.");
      }
    }
  };

  const copySignupLink = () => {
    const url = `${window.location.origin}/signup`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">Platform Settings</h2>
        <p className="text-slate-500">Manage administrator access and platform-wide configurations.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">Administrator Access</h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Invite staff members to manage the platform. Invited users will be able to sign up using the admin signup link.
          </p>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                placeholder="staff@example.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              />
            </div>
            <button 
              type="submit" 
              disabled={isAdding}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <UserPlus size={18} />
              {isAdding ? 'Inviting...' : 'Send Invite'}
            </button>
          </form>
        </div>

        <div className="p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Pending & Active Invites</h4>
          
          <div className="space-y-3">
            {loading ? (
              <p className="text-slate-400 text-sm py-4 text-center">Loading invites...</p>
            ) : invites.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center border border-dashed border-slate-200 rounded-lg">No staff invited yet.</p>
            ) : (
              invites.map(invite => (
                <div key={invite.email} className="flex items-center justify-between p-4 border border-slate-100 bg-white rounded-lg hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Mail size={14} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{invite.email}</p>
                      <p className="text-xs text-slate-500">Invited {new Date(invite.invitedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const url = `${window.location.origin}/signup?email=${encodeURIComponent(invite.email)}`;
                        navigator.clipboard.writeText(url);
                        alert(`Invite link copied for ${invite.email}`);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 border border-indigo-100"
                      title="Copy Unique Invite Link"
                    >
                      <LinkIcon size={14} /> Copy Link
                    </button>
                    <button 
                      onClick={() => handleRevoke(invite.email)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Revoke Invite"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
