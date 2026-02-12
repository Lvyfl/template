'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { postsAPI } from '@/lib/api';
import CalendarSection from './CalendarSection';
import UploadPdfSection from './UploadPdfSection';

// Relative time helper
function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getAvatarColor(name: string) {
  const colors = [
    'from-orange-500 to-red-500',
    'from-amber-500 to-orange-600',
    'from-yellow-500 to-amber-600',
    'from-orange-600 to-rose-500',
    'from-red-500 to-orange-500',
    'from-amber-600 to-yellow-500',
  ];
  let hash = 0;
  for (let i = 0; i < (name?.length || 0); i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// Theme color map
function useColors() {
  const { theme } = useTheme();
  const d = theme === 'dark';
  return {
    // Surfaces
    sidebar: d ? 'bg-black/60 backdrop-blur-xl border-r border-orange-500/20' : 'bg-white/70 backdrop-blur-xl border-r border-orange-200/60 shadow-sm',
    header: d ? 'bg-black/40 backdrop-blur-xl border-b border-orange-500/10' : 'bg-white/60 backdrop-blur-xl border-b border-orange-200/50 shadow-sm',
    card: d ? 'bg-black/30 border border-orange-500/10 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-900/10' : 'bg-white/70 border border-orange-200/40 hover:border-orange-300/70 shadow-sm hover:shadow-md',
    panel: d ? 'backdrop-blur-xl bg-black/30 border border-orange-500/15' : 'backdrop-blur-xl bg-white/70 border border-orange-200/50 shadow-sm',
    statCard: d ? 'bg-orange-500/5 border border-orange-500/10' : 'bg-white/70 border border-orange-200/60',
    emptyIcon: d ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-white/70 border border-orange-200/60',
    searchInput: d
      ? 'bg-white/5 border border-orange-500/15 text-white placeholder-gray-500 focus:border-orange-500/40 focus:ring-orange-500/20'
      : 'bg-white/70 border border-orange-200/60 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-200',
    viewToggle: d ? 'bg-white/5 border border-orange-500/15' : 'bg-white/60 border border-orange-200/60',
    viewActive: d ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500/15 text-orange-700',
    viewInactive: d ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700',

    // Text
    heading: d ? 'text-white' : 'text-slate-900',
    text: d ? 'text-gray-200' : 'text-slate-700',
    textSecondary: d ? 'text-gray-400' : 'text-slate-600',
    textMuted: d ? 'text-gray-500' : 'text-slate-500',
    sectionLabel: d ? 'text-orange-500/40' : 'text-orange-600/60',
    emailText: d ? 'text-orange-300/50' : 'text-slate-500',
    subtitle: d ? 'text-orange-400/50' : 'text-orange-600/50',

    // Borders
    border: d ? 'border-orange-500/10' : 'border-orange-200/60',
    borderLight: d ? 'border-orange-500/5' : 'border-orange-100/60',

    // Badges
    deptBadge: d ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'bg-orange-500/10 text-orange-700 border border-orange-200/70',
    pdfBadge: d ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-500/10 border border-blue-200/60',
    countBadge: d ? 'bg-orange-500/10 text-orange-400/70' : 'bg-orange-500/10 text-orange-700',
    navInactive: d ? 'text-gray-400 hover:bg-orange-500/10 hover:text-orange-300' : 'text-slate-600 hover:bg-orange-500/10 hover:text-orange-700',

    // Buttons
    logoutBtn: d
      ? 'bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white'
      : 'bg-white/70 hover:bg-red-600 border border-red-200/70 hover:border-red-500 text-red-600 hover:text-white',
    clearSearch: d ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600',
    actionBtn: d ? 'text-gray-500 hover:text-orange-400 hover:bg-orange-500/10' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50',

    // Stats
    statTotal: 'text-orange-400',
    statToday: 'text-emerald-400',
    statWeek: 'text-amber-400',
    statPdf: 'text-blue-400',
    statLabel: d ? 'text-gray-500' : 'text-gray-500',

    // PDF card
    pdfCard: d ? 'bg-gradient-to-br from-blue-600/10 to-orange-600/10 border border-orange-500/20' : 'bg-gradient-to-br from-blue-500/10 to-orange-500/10 border border-orange-200/60',
    pdfIcon: d ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-500/10 border border-blue-200/60',
    pdfLabel: d ? 'text-orange-300' : 'text-orange-600',

    // Iframe border
    iframeBorder: d ? 'border border-white/10' : 'border border-gray-200',

    // Theme toggle
    toggleBg: d ? 'bg-white/5 border border-orange-500/15' : 'bg-white/60 border border-orange-200/60',
  };
}

type PostItem = {
  id: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
  adminName?: string;
  departmentName?: string;
  departmentId?: string;
  hasMedia?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizePosts(data: unknown): PostItem[] {
  if (!Array.isArray(data)) return [];
  const out: PostItem[] = [];
  for (const item of data) {
    if (!isRecord(item)) continue;
    const id = typeof item.id === 'string' ? item.id : '';
    if (!id) continue;
    out.push({
      id,
      caption: typeof item.caption === 'string' ? item.caption : String(item.caption ?? ''),
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      adminName: typeof item.adminName === 'string' ? item.adminName : undefined,
      departmentName: typeof item.departmentName === 'string' ? item.departmentName : undefined,
      departmentId: typeof item.departmentId === 'string' ? item.departmentId : undefined,
      hasMedia: typeof item.hasMedia === 'boolean' ? item.hasMedia : undefined,
    });
  }
  return out;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const c = useColors();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [mediaPreview, setMediaPreview] = useState<{ type: 'image' | 'pdf'; src: string } | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState<string>('');
  const [posting, setPosting] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchPosts();
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      if (newImagePreviewUrl) URL.revokeObjectURL(newImagePreviewUrl);
    };
  }, [newImagePreviewUrl]);

  const fetchPosts = async () => {
    try {
      let response;
      try {
        response = await postsAPI.getPosts({ limit: 20, offset: 0 });
      } catch {
        response = await postsAPI.getDepartmentPosts({ limit: 20, offset: 0 });
      }

      const basePosts = normalizePosts(response.data);
      setPosts(basePosts);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const onPickImage = (file: File | null) => {
    setNewImageFile(file);
    if (newImagePreviewUrl) URL.revokeObjectURL(newImagePreviewUrl);
    setNewImagePreviewUrl(file ? URL.createObjectURL(file) : '');
    setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
    setCompletedCrop(null);
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });

  const getCroppedBlobFromImg = async (image: HTMLImageElement, area: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.max(1, Math.round(area.width * scaleX));
    canvas.height = Math.max(1, Math.round(area.height * scaleY));

    ctx.drawImage(
      image,
      area.x * scaleX,
      area.y * scaleY,
      area.width * scaleX,
      area.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to crop image'))), 'image/jpeg', 0.92);
    });
    return blob;
  };

  const submitPost = async () => {
    if (posting) return;
    const caption = newCaption.trim();
    if (!caption) return;
    try {
      setPosting(true);

      let imageUrl: string | undefined;
      if (newImageFile) {
        if (!newImageFile.type.startsWith('image/')) {
          alert('Please choose a valid image file.');
          return;
        }
        if (newImageFile.size > 5 * 1024 * 1024) {
          alert('Image must be 5MB or smaller.');
          return;
        }
        const img = imgRef.current;
        if (img && completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
          const croppedBlob = await getCroppedBlobFromImg(img, completedCrop);
          if (croppedBlob.size > 5 * 1024 * 1024) {
            alert('Cropped image is still larger than 5MB. Please crop tighter or use a smaller image.');
            return;
          }
          imageUrl = await blobToDataUrl(croppedBlob);
        } else {
          imageUrl = await fileToDataUrl(newImageFile);
        }
      }

      await postsAPI.createPost({ caption, imageUrl });
      setNewCaption('');
      onPickImage(null);
      await fetchPosts();
    } catch (err) {
      console.error('Failed to create post', err);
      alert('Failed to create post.');
    } finally {
      setPosting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openPdfPreview = async (postId: string, pdfSrc?: string) => {
    try {
      if (!pdfSrc) return;
      let resolved = pdfSrc;
      if (pdfSrc === 'PDF_PLACEHOLDER') {
        const full = await postsAPI.getPostById(postId);
        const fullUrl: string = full.data?.imageUrl || '';
        if (fullUrl.includes('|')) {
          resolved = fullUrl.split('|')[0];
        } else {
          resolved = fullUrl;
        }
      }
      if (!resolved) return;
      setMediaPreview({ type: 'pdf', src: resolved });
    } catch (err) {
      console.error('Failed to open PDF preview', err);
    }
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p =>
      p.caption?.toLowerCase().includes(q) ||
      p.adminName?.toLowerCase().includes(q) ||
      p.departmentName?.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    return {
      total: posts.length,
      today: posts.filter(p => new Date(p.createdAt) >= today).length,
      thisWeek: posts.filter(p => new Date(p.createdAt) >= thisWeek).length,
      pdfs: posts.filter(p => p.imageUrl?.includes('|') || p.imageUrl?.startsWith('data:application/pdf')).length,
    };
  }, [posts]);

  const departments = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach(p => {
      if (p.departmentName) map.set(p.departmentName, (map.get(p.departmentName) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-orange-500/20 border-t-orange-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 animate-pulse"></div>
            </div>
          </div>
          <p className={`text-sm font-medium animate-pulse ${theme === 'dark' ? 'text-orange-300/70' : 'text-orange-600/70'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`w-72 ${c.sidebar} flex flex-col fixed top-0 left-0 h-screen overflow-y-auto z-20 transition-colors duration-300`}>
        {/* Logo */}
        <div className={`p-6 pb-4 border-b ${c.border}`}>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent tracking-tight">CEIT Portal</h1>
          <p className={`${c.subtitle} text-xs mt-0.5 tracking-widest uppercase`}>Admin Dashboard</p>
        </div>

        {/* User Profile Card */}
        <div className={`px-5 py-5 border-b ${c.border}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarColor(user?.name || '')} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {getInitials(user?.name || '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`${c.heading} font-semibold text-sm truncate`}>{user?.name}</p>
              <p className={`${c.emailText} text-xs truncate`}>{user?.email}</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 flex-shrink-0" title="Online"></div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className={`px-5 py-4 border-b ${c.border}`}>
          <p className={`text-[10px] uppercase tracking-widest ${c.sectionLabel} font-semibold mb-3`}>Accessibility</p>
          <div className={`flex items-center rounded-xl p-1 ${c.toggleBg}`}>
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md'
                  : `${c.textMuted}`
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              Dark
            </button>
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : `${c.textMuted}`
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Light
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`px-5 py-4 border-b ${c.border}`}>
          <p className={`text-[10px] uppercase tracking-widest ${c.sectionLabel} font-semibold mb-3`}>Overview</p>
          <div className="grid grid-cols-2 gap-2">
            <div className={`${c.statCard} rounded-lg px-3 py-2 text-center transition-colors duration-300`}>
              <p className={`text-lg font-bold ${c.statTotal}`}>{stats.total}</p>
              <p className={`text-[10px] ${c.statLabel} uppercase tracking-wide`}>Total</p>
            </div>
            <div className={`${c.statCard} rounded-lg px-3 py-2 text-center transition-colors duration-300`}>
              <p className={`text-lg font-bold ${c.statToday}`}>{stats.today}</p>
              <p className={`text-[10px] ${c.statLabel} uppercase tracking-wide`}>Today</p>
            </div>
            <div className={`${c.statCard} rounded-lg px-3 py-2 text-center transition-colors duration-300`}>
              <p className={`text-lg font-bold ${c.statWeek}`}>{stats.thisWeek}</p>
              <p className={`text-[10px] ${c.statLabel} uppercase tracking-wide`}>This Week</p>
            </div>
            <div className={`${c.statCard} rounded-lg px-3 py-2 text-center transition-colors duration-300`}>
              <p className={`text-lg font-bold ${c.statPdf}`}>{stats.pdfs}</p>
              <p className={`text-[10px] ${c.statLabel} uppercase tracking-wide`}>PDFs</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 space-y-1.5 flex-1">
          <p className={`text-[10px] uppercase tracking-widest ${c.sectionLabel} font-semibold mb-3 px-1`}>Navigation</p>
          {[
            { key: 'posts', icon: '📄', label: 'Posts', badge: stats.total },
            { key: 'announcements', icon: '📢', label: 'Announcements' },
            { key: 'uploadPdf', icon: '📤', label: 'Upload PDF' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.key
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-900/40'
                  : c.navInactive
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                  activeTab === item.key
                    ? 'bg-white/20 text-white'
                    : c.countBadge
                }`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Departments */}
        {departments.length > 0 && (
          <div className={`px-5 py-4 border-t ${c.border}`}>
            <p className={`text-[10px] uppercase tracking-widest ${c.sectionLabel} font-semibold mb-3`}>Departments</p>
            <div className="space-y-2">
              {departments.slice(0, 4).map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className={`text-xs ${c.textSecondary} truncate`}>{name}</span>
                  <span className={`text-xs font-mono ${theme === 'dark' ? 'text-orange-400/60' : 'text-orange-500'}`}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className={`p-4 border-t ${c.border}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${c.logoutBtn} rounded-xl transition-all duration-200`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen ml-72">
        {/* Top Bar */}
        <header className={`sticky top-0 z-10 ${c.header} px-8 py-4 transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${c.heading}`}>
                {activeTab === 'posts' && 'Posts'}
                {activeTab === 'announcements' && 'Announcements'}
                {activeTab === 'uploadPdf' && 'Upload PDF'}
              </h2>
              <p className={`${c.textMuted} text-sm mt-0.5`}>
                {activeTab === 'posts' && `${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''} ${searchQuery ? 'found' : 'total'}`}
                {activeTab === 'announcements' && 'Manage events and calendar'}
                {activeTab === 'uploadPdf' && 'Upload and manage PDF documents'}
              </p>
            </div>
            {activeTab === 'posts' && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${c.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 w-64 transition-all ${c.searchInput}`}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${c.clearSearch}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <div className={`flex ${c.viewToggle} rounded-xl p-1`}>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? c.viewActive : c.viewInactive}`}
                    title="List view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? c.viewActive : c.viewInactive}`}
                    title="Grid view"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'posts' && (
            <>
              <div className="mb-6">
                <div className={`${c.panel} rounded-2xl p-6`}> 
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <span className="text-lg">🖼️</span>
                    </div>
                    <div>
                      <h3 className={`${c.heading} font-semibold text-lg`}>Create Post</h3>
                      <p className={`${c.textMuted} text-sm`}>Share an image with a caption</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`${c.textSecondary} text-sm font-medium`}>Caption *</label>
                      <textarea
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        rows={4}
                        placeholder="What's on your mind?"
                        className={`mt-2 w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all ${c.searchInput}`}
                      />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-500/20 bg-orange-500/5 text-orange-300 text-sm font-medium cursor-pointer hover:bg-orange-500/10 transition-colors">
                        <span>Choose Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => onPickImage(null)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
                        disabled={!newImageFile && !newCaption}
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={submitPost}
                        disabled={posting || !newCaption.trim()}
                        className={`ml-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${posting || !newCaption.trim() ? 'opacity-50 cursor-not-allowed bg-orange-600/40 text-white' : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-500 hover:to-orange-600'}`}
                      >
                        {posting ? 'Posting...' : 'Post'}
                      </button>
                    </div>

                    {newImagePreviewUrl && (
                      <div className={`rounded-xl overflow-hidden border ${c.borderLight}`}>
                        <div className={`w-full ${theme === 'dark' ? 'bg-black/40' : 'bg-gray-100'} flex items-center justify-center p-3`}>
                          <div className="inline-block leading-none max-w-full">
                            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)}>
                              <img
                                ref={imgRef}
                                src={newImagePreviewUrl}
                                alt="Crop"
                                className="block max-h-[22rem] w-auto max-w-full"
                              />
                            </ReactCrop>
                          </div>
                        </div>
                        <div className={`px-4 py-3 ${theme === 'dark' ? 'bg-black/20' : 'bg-white'}`}>
                          <p className={`${c.textMuted} text-[11px]`}>Resize the crop box using the corner handles, or drag to reposition.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className={`w-20 h-20 rounded-2xl ${c.emptyIcon} flex items-center justify-center mb-5`}>
                    <svg className="w-10 h-10 text-orange-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h3 className={`text-xl font-semibold ${c.heading} mb-2`}>
                    {searchQuery ? 'No matching posts' : 'No posts yet'}
                  </h3>
                  <p className={`${c.textMuted} text-sm max-w-sm`}>
                    {searchQuery
                      ? `No posts found matching "${searchQuery}". Try a different search term.`
                      : 'Posts shared by administrators will appear here. Create your first post to get started!'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-4 py-2 bg-orange-500/10 text-orange-400 rounded-lg text-sm hover:bg-orange-500/20 transition-all"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-5' : 'space-y-5 max-w-3xl mx-auto'}>
                  {filteredPosts.map((post, idx) => {
                    const isPDF = post.imageUrl?.includes('|') || post.imageUrl?.startsWith('data:application/pdf');
                    const [pdfUrl, thumbnailUrl] = post.imageUrl?.includes('|')
                      ? post.imageUrl.split('|')
                      : [post.imageUrl, null];
                    const isExpanded = expandedPosts.has(post.id);
                    const isLongCaption = (post.caption?.length || 0) > 200;

                    return (
                      <article
                        key={post.id}
                        className={`group ${c.card} rounded-2xl overflow-hidden transition-all duration-300`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        {/* Card Header */}
                        <div className="flex items-center gap-3 px-5 py-4">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(post.adminName || 'Admin')} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md`}>
                            {getInitials(post.adminName || 'Admin')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`${c.heading} font-semibold text-sm truncate`}>{post.adminName || 'Admin'}</p>
                              {post.departmentName && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${c.deptBadge} whitespace-nowrap`}>
                                  {post.departmentName}
                                </span>
                              )}
                            </div>
                            <p className={`${c.textMuted} text-xs`}>{timeAgo(post.createdAt)}</p>
                          </div>
                          {isPDF && (
                            <div className={`flex items-center gap-1 px-2 py-1 ${c.pdfBadge} rounded-lg`}>
                              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                              <span className="text-[10px] font-semibold text-blue-400">PDF</span>
                            </div>
                          )}
                        </div>

                        {/* Caption */}
                        <div className="px-5 pb-3">
                          <p className={`${c.text} text-sm leading-relaxed`}>
                            {isLongCaption && !isExpanded
                              ? post.caption.slice(0, 200) + '...'
                              : post.caption}
                          </p>
                          {isLongCaption && (
                            <button
                              onClick={() => toggleExpand(post.id)}
                              className="text-orange-400 text-xs font-medium hover:text-orange-300 mt-1 transition-colors"
                            >
                              {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                          )}
                        </div>

                        {/* Media */}
                        {post.imageUrl && (
                          <div className="px-5 pb-5">
                            {isPDF && thumbnailUrl ? (
                              <div className={`relative rounded-xl overflow-hidden border ${c.borderLight} group/media`}>
                                <img src={thumbnailUrl} alt="PDF Thumbnail" className="w-full h-auto max-h-96 object-cover group-hover/media:scale-[1.02] transition-transform duration-500 cursor-zoom-in" loading="lazy" onClick={() => openPdfPreview(post.id, pdfUrl)} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/20">View PDF</span>
                                </div>
                              </div>
                            ) : isPDF ? (
                              <div className={`${c.pdfCard} rounded-xl p-8 text-center cursor-pointer`} onClick={() => openPdfPreview(post.id, pdfUrl)}>
                                <div className={`w-14 h-14 mx-auto rounded-xl ${c.pdfIcon} flex items-center justify-center mb-3`}>
                                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                </div>
                                <p className={`${c.pdfLabel} font-medium text-sm`}>PDF Document</p>
                                <p className={`${c.textMuted} text-xs mt-1`}>Click to view</p>
                              </div>
                            ) : (
                              <div className={`relative rounded-xl overflow-hidden border ${c.borderLight} group/media`}>
                                <img src={post.imageUrl} alt="Post image" className="w-full h-auto max-h-96 object-cover group-hover/media:scale-[1.02] transition-transform duration-500 cursor-zoom-in" loading="lazy" onClick={() => setMediaPreview({ type: 'image', src: post.imageUrl })} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'announcements' && (
            <CalendarSection />
          )}

          {activeTab === 'uploadPdf' && (
            <UploadPdfSection />
          )}
        </div>

        {mediaPreview && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setMediaPreview(null)}>
            <div className={`relative w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-black/50 border border-orange-500/20' : 'bg-white border border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-orange-600 transition-colors" onClick={() => setMediaPreview(null)}>
                ✕
              </button>
              {mediaPreview.type === 'image' ? (
                <img src={mediaPreview.src} alt="Preview" className="w-full h-auto max-h-[90vh] object-contain" />
              ) : (
                <iframe src={mediaPreview.src} className="w-full h-[85vh]" title="PDF Preview" />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
