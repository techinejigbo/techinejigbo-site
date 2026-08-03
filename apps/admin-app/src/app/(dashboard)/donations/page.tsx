"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  subscribeToDonations, 
  DonationRecord, 
  updateDonationStatus 
} from '@techinejigbo/firebase/src/firestore';
import { 
  Heart, Mail, Phone, Clock, CheckCircle2, 
  XCircle, AlertCircle, Search, Download, 
  Copy, Check, TrendingUp, Users, DollarSign,
  MessageSquare, Filter, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDonations((data) => {
      setDonations(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSyncPaystack = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/donations/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Successfully synced ${data.syncedCount || 0} donations from Paystack!`);
      } else {
        toast.error(data.error || 'Failed to sync with Paystack');
      }
    } catch (error: any) {
      console.error('Error syncing with Paystack:', error);
      toast.error('Network error while connecting to Paystack sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(id);
    toast.success('Copied reference to clipboard');
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleStatusChange = async (id: string, newStatus: 'success' | 'pending' | 'failed') => {
    try {
      await updateDonationStatus(id, newStatus);
      toast.success(`Donation marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatCurrency = (amount: number, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Metrics
  const metrics = useMemo(() => {
    const successful = donations.filter(d => d.status === 'success');
    const totalAmount = successful.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const avgAmount = successful.length > 0 ? Math.round(totalAmount / successful.length) : 0;
    const uniqueDonors = new Set(successful.map(d => d.donorEmail)).size;

    return {
      totalAmount,
      count: successful.length,
      avgAmount,
      uniqueDonors
    };
  }, [donations]);

  // Filtered List
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchesSearch = 
        (d.donorName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (d.donorEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (d.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (d.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [donations, searchQuery, statusFilter]);

  // CSV Export
  const handleExportCSV = () => {
    if (donations.length === 0) {
      toast.error('No donation records to export');
      return;
    }

    const headers = ['Reference', 'Donor Name', 'Email', 'Phone', 'Amount (NGN)', 'Purpose', 'Status', 'Paid At', 'Created At', 'Message'];
    const rows = filteredDonations.map(d => [
      `"${d.reference}"`,
      `"${d.donorName}"`,
      `"${d.donorEmail}"`,
      `"${d.donorPhone || ''}"`,
      d.amount,
      `"${d.purpose || ''}"`,
      d.status,
      `"${d.paidAt || ''}"`,
      `"${d.createdAt || ''}"`,
      `"${(d.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `techinejigbo-donations-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Donations report exported to CSV');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
            <Heart className="text-brand-orange fill-brand-orange/20" size={26} />
            Donations & Sponsorships
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track Paystack payments, manage student sponsors, and review public contributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncPaystack}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-70 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
            title="Import and sync all historical & recent transactions from Paystack"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? 'Syncing...' : 'Sync from Paystack'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Raised</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            {formatCurrency(metrics.totalAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-1">From verified donations</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Transactions</span>
            <div className="p-2 bg-orange-50 text-brand-orange rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            {metrics.count}
          </div>
          <div className="text-xs text-slate-400 mt-1">Successful contributions</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Gift</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Heart size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            {formatCurrency(metrics.avgAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Per transaction</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Unique Donors</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            {metrics.uniqueDonors}
          </div>
          <div className="text-xs text-slate-400 mt-1">Individual supporters</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search donor, email, reference, cause..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-orange outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 uppercase shrink-0">Status:</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {(['all', 'success', 'pending', 'failed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading donation records...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Heart size={40} className="mx-auto text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-700">No donations found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search query or status filter.' 
                : 'Donation transactions will appear here in real-time as users donate.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Reference & Date</th>
                  <th className="px-6 py-4">Donor</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonations.map((d) => {
                  const dateStr = d.paidAt || d.createdAt;
                  const formattedDate = dateStr 
                    ? new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Reference & Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-xs text-slate-900">{d.reference}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(d.reference, d.id || d.reference)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded"
                            title="Copy reference"
                          >
                            {copiedRef === (d.id || d.reference) ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Clock size={12} />
                          {formattedDate}
                        </div>
                      </td>

                      {/* Donor Details */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {d.donorName}
                          {d.isAnonymous && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                              Anonymous
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <a href={`mailto:${d.donorEmail}`} className="hover:text-brand-orange flex items-center gap-1">
                            <Mail size={12} /> {d.donorEmail}
                          </a>
                          {d.donorPhone && (
                            <span className="flex items-center gap-1">
                              • <Phone size={12} /> {d.donorPhone}
                            </span>
                          )}
                        </div>
                        {d.message && (
                          <div className="text-xs text-slate-500 italic mt-1.5 bg-orange-50/70 text-orange-950 p-2 rounded-lg border border-orange-100 flex items-start gap-1 max-w-sm">
                            <MessageSquare size={13} className="shrink-0 mt-0.5 text-brand-orange" />
                            <span>"{d.message}"</span>
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="font-display font-bold text-slate-900 text-base">
                          {formatCurrency(d.amount, d.currency)}
                        </span>
                        {d.channel && (
                          <div className="text-[11px] uppercase text-slate-400 font-semibold tracking-wider mt-0.5">
                            via {d.channel}
                          </div>
                        )}
                      </td>

                      {/* Purpose */}
                      <td className="px-6 py-4">
                        <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          {d.purpose || 'General Fund'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {d.status === 'success' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={13} /> Paid
                          </span>
                        )}
                        {d.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                            <AlertCircle size={13} /> Pending
                          </span>
                        )}
                        {d.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                            <XCircle size={13} /> Failed
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`mailto:${d.donorEmail}?subject=Receipt & Thank You - TechinEjigbo Donation (${d.reference})&body=Dear ${encodeURIComponent(d.donorName)},%0D%0A%0D%0AThank you immensely for your generous contribution of ${encodeURIComponent(formatCurrency(d.amount))} to TechinEjigbo.%0D%0A%0D%0ATransaction Reference: ${encodeURIComponent(d.reference)}%0D%0APurpose: ${encodeURIComponent(d.purpose || 'General Fund')}%0D%0A%0D%0AYour support directly empowers underprivileged young leaders in Ejigbo with digital and technical skills.%0D%0A%0D%0AWarm regards,%0D%0ATechinEjigbo Initiative`}
                            className="p-2 text-slate-600 hover:text-brand-orange hover:bg-slate-100 rounded-lg transition-colors"
                            title="Send Thank You / Receipt Email"
                          >
                            <Mail size={16} />
                          </a>

                          {d.id && d.status !== 'success' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(d.id!, 'success')}
                              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
