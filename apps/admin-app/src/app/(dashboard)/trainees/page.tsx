"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  subscribeToTrainees, 
  subscribeToExams, 
  updateTraineeStatus, 
  deleteTrainee, 
  TraineeData, 
  ExamRecord 
} from '@techinejigbo/firebase/src/firestore';
import { 
  Search, 
  MoreVertical, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X, 
  Download, 
  Users, 
  Clock, 
  AlertTriangle, 
  GraduationCap, 
  SlidersHorizontal,
  RotateCcw,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export default function TraineesPage() {
  const [trainees, setTrainees] = useState<TraineeData[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [examFilter, setExamFilter] = useState<'all' | 'completed' | 'not-taken' | 'passed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'score-high' | 'score-low'>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // UI state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    setLoading(true);
    let traineesLoaded = false;
    let examsLoaded = false;
    
    const unsubscribeTrainees = subscribeToTrainees((data) => {
      setTrainees(data);
      traineesLoaded = true;
      if (examsLoaded) setLoading(false);
    });

    const unsubscribeExams = subscribeToExams((data) => {
      setExams(data);
      examsLoaded = true;
      if (traineesLoaded) setLoading(false);
    });

    return () => {
      unsubscribeTrainees();
      unsubscribeExams();
    };
  }, []);

  // Compute unique lists for filter dropdowns
  const availablePrograms = useMemo(() => {
    const set = new Set<string>();
    trainees.forEach(t => {
      const prog = t.program || t.course;
      if (prog) set.add(prog);
    });
    return Array.from(set).sort();
  }, [trainees]);

  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    trainees.forEach(t => {
      if (t.school && t.school.trim()) set.add(t.school.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [trainees]);

  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    trainees.forEach(t => {
      if (t.traineeClass && t.traineeClass.trim()) set.add(t.traineeClass.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [trainees]);

  // Key stats
  const stats = useMemo(() => {
    const total = trainees.length;
    const active = trainees.filter(t => t.status === 'active').length;
    const pending = trainees.filter(t => t.status === 'pending' || !t.status).length;
    const suspended = trainees.filter(t => t.status === 'suspended').length;
    const completedExamCount = new Set(exams.map(e => e.traineeId)).size;

    return { total, active, pending, suspended, completedExamCount };
  }, [trainees, exams]);

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setProgramFilter('all');
    setSchoolFilter('all');
    setClassFilter('all');
    setExamFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (programFilter !== 'all') count++;
    if (schoolFilter !== 'all') count++;
    if (classFilter !== 'all') count++;
    if (examFilter !== 'all') count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [search, statusFilter, programFilter, schoolFilter, classFilter, examFilter, sortBy]);

  // Actions
  const handleApproveAccount = async (trainee: TraineeData) => {
    setActiveDropdown(null);
    if (window.confirm(`Are you sure you want to approve ${trainee.firstName}'s registration?`)) {
      try {
        await updateTraineeStatus(trainee.uid, 'active');
        setTrainees(prev => prev.map(t => t.uid === trainee.uid ? { ...t, status: 'active' } : t));
        toast.success("Account approved successfully.");
      } catch (err) {
        toast.error("Failed to approve account.");
      }
    }
  };

  const handleStatusToggle = async (trainee: TraineeData) => {
    setActiveDropdown(null);
    const newStatus = trainee.status === 'suspended' ? 'active' : 'suspended';
    const confirmMessage = newStatus === 'suspended' 
      ? `Are you sure you want to suspend ${trainee.firstName}? They will be completely locked out of the Student Portal.`
      : `Are you sure you want to reactivate ${trainee.firstName}'s account?`;
      
    if (window.confirm(confirmMessage)) {
      try {
        await updateTraineeStatus(trainee.uid, newStatus);
        setTrainees(prev => prev.map(t => t.uid === trainee.uid ? { ...t, status: newStatus } : t));
        toast.success(`Account ${newStatus === 'suspended' ? 'suspended' : 'reactivated'} successfully.`);
      } catch (err) {
        toast.error("Failed to update status.");
      }
    }
  };

  const handleDelete = async (trainee: TraineeData) => {
    setActiveDropdown(null);
    if (window.confirm(`CRITICAL WARNING: Are you absolutely sure you want to permanently delete ${trainee.firstName} ${trainee.lastName}? This action cannot be undone.`)) {
      try {
        await deleteTrainee(trainee.uid);
        setTrainees(prev => prev.filter(t => t.uid !== trainee.uid));
        toast.success("Trainee deleted permanently.");
      } catch (err) {
        toast.error("Failed to delete trainee.");
      }
    }
  };

  // Filter and Sort Trainees
  const filteredTrainees = useMemo(() => {
    const q = search.toLowerCase().trim();

    return trainees.filter(t => {
      // 1. Text Search across multiple fields: name, email, phone, school, class, program
      if (q) {
        const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
        const email = (t.email || '').toLowerCase();
        const phone = (t.phone || '').toLowerCase();
        const school = (t.school || '').toLowerCase();
        const traineeClass = (t.traineeClass || '').toLowerCase();
        const program = (t.program || t.course || '').toLowerCase().replace(/-/g, ' ');

        const matchesQuery = 
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          school.includes(q) ||
          traineeClass.includes(q) ||
          program.includes(q);

        if (!matchesQuery) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'all') {
        const currentStatus = t.status || 'pending';
        if (statusFilter === 'pending' && currentStatus !== 'pending') return false;
        if (statusFilter === 'active' && currentStatus !== 'active') return false;
        if (statusFilter === 'suspended' && currentStatus !== 'suspended') return false;
      }

      // 3. Program Filter
      if (programFilter !== 'all') {
        const prog = t.program || t.course;
        if (prog !== programFilter) return false;
      }

      // 4. School Filter
      if (schoolFilter !== 'all') {
        if ((t.school || '').trim().toLowerCase() !== schoolFilter.toLowerCase()) return false;
      }

      // 5. Class Filter
      if (classFilter !== 'all') {
        if ((t.traineeClass || '').trim().toLowerCase() !== classFilter.toLowerCase()) return false;
      }

      // 6. Exam Performance Filter
      if (examFilter !== 'all') {
        const traineeExams = exams.filter(e => e.traineeId === t.uid);
        const bestExam = traineeExams.length > 0 ? traineeExams.sort((a, b) => b.score - a.score)[0] : null;

        if (examFilter === 'completed' && !bestExam) return false;
        if (examFilter === 'not-taken' && bestExam) return false;
        if (examFilter === 'passed' && (!bestExam || bestExam.score < 70)) return false;
        if (examFilter === 'failed' && (!bestExam || bestExam.score >= 70)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'name-asc') {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'name-desc') {
        const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
        const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
        return nameB.localeCompare(nameA);
      }
      if (sortBy === 'score-high' || sortBy === 'score-low') {
        const scoreA = exams.filter(e => e.traineeId === a.uid).sort((x, y) => y.score - x.score)[0]?.score ?? -1;
        const scoreB = exams.filter(e => e.traineeId === b.uid).sort((x, y) => y.score - x.score)[0]?.score ?? -1;
        return sortBy === 'score-high' ? scoreB - scoreA : scoreA - scoreB;
      }
      return 0;
    });
  }, [trainees, exams, search, statusFilter, programFilter, schoolFilter, classFilter, examFilter, sortBy]);

  // Export filtered trainees to CSV
  const handleExportCSV = () => {
    if (filteredTrainees.length === 0) {
      toast.error("No trainees to export.");
      return;
    }

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "School",
      "Class",
      "Program",
      "Status",
      "Best Exam Score (%)",
      "Registration Date"
    ];

    const rows = filteredTrainees.map(t => {
      const traineeExams = exams.filter(e => e.traineeId === t.uid);
      const bestScore = traineeExams.length > 0 ? Math.max(...traineeExams.map(e => e.score)) : "N/A";
      const regDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "N/A";

      return [
        `"${(t.firstName || '').replace(/"/g, '""')}"`,
        `"${(t.lastName || '').replace(/"/g, '""')}"`,
        `"${(t.email || '').replace(/"/g, '""')}"`,
        `"${(t.phone || '').replace(/"/g, '""')}"`,
        `"${(t.school || '').replace(/"/g, '""')}"`,
        `"${(t.traineeClass || '').replace(/"/g, '""')}"`,
        `"${(t.program || t.course || 'N/A').replace(/"/g, '""')}"`,
        `"${(t.status || 'pending').replace(/"/g, '""')}"`,
        `"${bestScore}"`,
        `"${regDate}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `techinejigbo_trainees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredTrainees.length} trainees to CSV!`);
  };

  const totalPages = Math.ceil(filteredTrainees.length / itemsPerPage);
  const paginatedTrainees = filteredTrainees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatProgramName = (prog?: string) => {
    if (!prog) return 'N/A';
    return prog.replace(/-/g, ' ');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Trainee Directory</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage registrations, track exam scores, and filter by school, class, program, or status.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={loading || filteredTrainees.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            title="Export filtered trainees to CSV"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Quick Stats Badges / Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <button
          onClick={() => { resetFilters(); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'all' && !search && programFilter === 'all' && schoolFilter === 'all' && classFilter === 'all' && examFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Total</span>
            <Users size={16} className="opacity-70" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1">{stats.total}</p>
        </button>

        <button
          onClick={() => { setStatusFilter(statusFilter === 'active' ? 'all' : 'active'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 group-hover:text-emerald-700">
              Active
            </span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1">{stats.active}</p>
        </button>

        <button
          onClick={() => { setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-200 hover:bg-amber-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Pending
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1">{stats.pending}</p>
        </button>

        <button
          onClick={() => { setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'suspended'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-rose-200 hover:bg-rose-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Suspended
            </span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1">{stats.suspended}</p>
        </button>

        <button
          onClick={() => { setExamFilter(examFilter === 'completed' ? 'all' : 'completed'); setCurrentPage(1); }}
          className={`p-4 rounded-xl border text-left col-span-2 sm:col-span-1 transition-all ${
            examFilter === 'completed'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-200 hover:bg-blue-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Exams Done
            </span>
            <GraduationCap size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1">{stats.completedExamCount}</p>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[550px] flex flex-col">
        
        {/* Search & Filter Controls Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Expanded Search Input */}
            <div className="relative flex-1 max-w-lg">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Search size={17} />
              </span>
              <input
                type="text"
                placeholder="Search by name, email, phone, school, class, or program..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 w-full transition-all"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setCurrentPage(1); }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Action Toggle for Mobile & Sort */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFiltersPanel || activeFiltersCount > 0
                    ? 'bg-brand-orange/10 border-brand-orange/40 text-brand-orange-dark font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <SlidersHorizontal size={15} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-brand-orange text-white text-xs font-bold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <span className="text-xs font-medium text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
                  aria-label="Sort trainees"
                  className="py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                >
                  <option value="newest">Registration (Newest)</option>
                  <option value="oldest">Registration (Oldest)</option>
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                  <option value="score-high">Highest Exam Score</option>
                  <option value="score-low">Lowest Exam Score</option>
                </select>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdown Bar (Always visible or toggleable on smaller screens) */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100 ${showFiltersPanel ? 'block' : 'hidden md:grid'}`}>
            
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Account Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              >
                <option value="all">All Statuses ({trainees.length})</option>
                <option value="active">Active ({stats.active})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="suspended">Suspended ({stats.suspended})</option>
              </select>
            </div>

            {/* Program / Course Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Program / Track
              </label>
              <select
                value={programFilter}
                onChange={(e) => { setProgramFilter(e.target.value); setCurrentPage(1); }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange capitalize"
              >
                <option value="all">All Programs</option>
                {availablePrograms.map(prog => (
                  <option key={prog} value={prog}>
                    {formatProgramName(prog)}
                  </option>
                ))}
              </select>
            </div>

            {/* School Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                School
              </label>
              <select
                value={schoolFilter}
                onChange={(e) => { setSchoolFilter(e.target.value); setCurrentPage(1); }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange truncate"
              >
                <option value="all">All Schools ({availableSchools.length})</option>
                {availableSchools.map(school => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Class / Level
              </label>
              <select
                value={classFilter}
                onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              >
                <option value="all">All Classes ({availableClasses.length})</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Score / Status Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Exam Performance
              </label>
              <select
                value={examFilter}
                onChange={(e) => { setExamFilter(e.target.value as any); setCurrentPage(1); }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              >
                <option value="all">All Exam Records</option>
                <option value="completed">Exam Completed</option>
                <option value="not-taken">Exam Not Taken</option>
                <option value="passed">Passed (Score ≥ 70%)</option>
                <option value="failed">Failed (Score &lt; 70%)</option>
              </select>
            </div>

          </div>

          {/* Active Filter Chips / Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Filters:</span>
              
              {search.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-full border border-slate-200">
                  Search: <strong className="font-medium">"{search}"</strong>
                  <button onClick={() => setSearch('')} className="hover:text-rose-600"><X size={13} /></button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs rounded-full border border-amber-200">
                  Status: <strong className="font-medium capitalize">{statusFilter}</strong>
                  <button onClick={() => setStatusFilter('all')} className="hover:text-rose-600"><X size={13} /></button>
                </span>
              )}

              {programFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-orange/10 text-brand-orange-dark text-xs rounded-full border border-brand-orange/20">
                  Program: <strong className="font-medium capitalize">{formatProgramName(programFilter)}</strong>
                  <button onClick={() => setProgramFilter('all')} className="hover:text-rose-600"><X size={13} /></button>
                </span>
              )}

              {schoolFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-800 text-xs rounded-full border border-indigo-200">
                  School: <strong className="font-medium">{schoolFilter}</strong>
                  <button onClick={() => setSchoolFilter('all')} className="hover:text-rose-600"><X size={13} /></button>
                </span>
              )}

              {classFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-800 text-xs rounded-full border border-purple-200">
                  Class: <strong className="font-medium">{classFilter}</strong>
                  <button onClick={() => setClassFilter('all')} className="hover:text-rose-600"><X size={13} /></button>
                </span>
              )}

              {examFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 text-xs rounded-full border border-blue-200">
                  Exam: <strong className="font-medium capitalize">{examFilter.replace('-', ' ')}</strong>
                  <button onClick={() => setExamFilter('all')} className="hover:text-rose-600"><X size={13} /></button>
                </span>
              )}

              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Trainees Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-mono font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Trainee</th>
                <th className="px-6 py-4">School / Class</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Exam Score</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 relative">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                      <span>Loading trainee records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTrainees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Users size={24} />
                      </div>
                      <h3 className="font-display font-bold text-base text-slate-800">No trainees found</h3>
                      <p className="text-xs text-slate-500 text-center">
                        {activeFiltersCount > 0
                          ? "No trainees match your currently applied search query and filters. Try adjusting or clearing your filters."
                          : "There are currently no registered trainees in the system."}
                      </p>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={resetFilters}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-brand-orange-dark transition-colors"
                        >
                          <RotateCcw size={13} />
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTrainees.map(trainee => {
                  const traineeExams = exams.filter(e => e.traineeId === trainee.uid);
                  const bestExam = traineeExams.length > 0 ? traineeExams.sort((a, b) => b.score - a.score)[0] : null;
                  const isSuspended = trainee.status === 'suspended';
                  const formattedDate = trainee.createdAt 
                    ? new Date(trainee.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={trainee.uid} className={`transition-colors ${isSuspended ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                            {trainee.passportPhotoBase64 ? (
                              <img src={trainee.passportPhotoBase64} alt={trainee.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 uppercase font-bold text-xs">
                                {trainee.firstName?.[0] || ''}{trainee.lastName?.[0] || ''}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className={`font-semibold ${isSuspended ? 'text-rose-900' : 'text-slate-900'}`}>
                              {trainee.firstName} {trainee.lastName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span className="inline-flex items-center gap-1">
                                <Mail size={12} className="text-slate-400" />
                                {trainee.email}
                              </span>
                              {trainee.phone && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Phone size={12} className="text-slate-400" />
                                    {trainee.phone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{trainee.school || '—'}</p>
                        <p className="text-xs text-slate-500">{trainee.traineeClass || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md capitalize">
                          {formatProgramName(trainee.program || trainee.course)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {trainee.status === 'pending' || !trainee.status ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">
                        {bestExam ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                            bestExam.score >= 70 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {bestExam.score}%
                            <span className="text-[10px] font-normal opacity-80">
                              ({bestExam.score >= 70 ? 'Passed' : 'Failed'})
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-xs">Not taken</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {formattedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === trainee.uid ? null : trainee.uid)}
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Actions"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === trainee.uid && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                            <div className="absolute right-6 top-10 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden text-left">
                              <div className="p-1">
                                {(trainee.status === 'pending' || !trainee.status) && (
                                  <button
                                    onClick={() => handleApproveAccount(trainee)}
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 rounded-md transition-colors text-emerald-700 hover:bg-emerald-50 font-medium"
                                  >
                                    <CheckCircle2 size={15} />
                                    Approve Account
                                  </button>
                                )}
                                {trainee.status !== 'pending' && (
                                  <button
                                    onClick={async () => {
                                      setActiveDropdown(null);
                                      if (window.confirm(`Are you sure you want to mark ${trainee.firstName}'s account as pending?`)) {
                                        try {
                                          await updateTraineeStatus(trainee.uid, 'pending');
                                          setTrainees(prev => prev.map(t => t.uid === trainee.uid ? { ...t, status: 'pending' } : t));
                                          toast.success("Account marked as pending.");
                                        } catch (err) {
                                          toast.error("Failed to update status.");
                                        }
                                      }
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 rounded-md transition-colors text-amber-700 hover:bg-amber-50 font-medium"
                                  >
                                    <ShieldAlert size={15} />
                                    Mark as Pending
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleStatusToggle(trainee)}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 rounded-md transition-colors font-medium ${
                                    isSuspended 
                                      ? 'text-emerald-700 hover:bg-emerald-50' 
                                      : 'text-amber-700 hover:bg-amber-50'
                                  }`}
                                >
                                  {isSuspended ? <CheckCircle2 size={15} /> : <ShieldAlert size={15} />}
                                  {isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                                </button>
                                
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={() => handleDelete(trainee)}
                                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 rounded-md transition-colors font-semibold"
                                >
                                  <Trash2 size={15} />
                                  Delete Permanently
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination & Summary Footer */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Showing {filteredTrainees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTrainees.length)} of {filteredTrainees.length} trainees
              {filteredTrainees.length !== trainees.length && ` (filtered from ${trainees.length} total)`}
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                aria-label="Items per page"
                className="py-1 px-2 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-brand-orange"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 transition-colors shadow-xs"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold px-2 text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 transition-colors shadow-xs"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
