import React, { useState } from 'react';
import { 
  Plus, Search, Star, Trash2, Folder, Tag, Sparkles, 
  Settings, Cloud, Moon, Sun, Monitor, ChevronRight, LayoutTemplate
} from 'lucide-react';
import { Document } from '../types';

interface SidebarProps {
  documents: Document[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string, name: string) => void;
  onToggleFavorite: (id: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenTemplateManager: () => void;
  backupConfigured: boolean;
  onOpenBackup: () => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  isCloudSyncing: boolean;
}

export default function Sidebar({
  documents,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onToggleFavorite,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenTemplateManager,
  backupConfigured,
  onOpenBackup,
  user,
  onLogin,
  onLogout,
  isCloudSyncing
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Dynamic unique tags extractor
  const allTags = Array.from(
    new Set(documents.flatMap((doc) => doc.tags || []))
  ).filter(Boolean);

  // Search filter and tag filter rules
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || doc.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Sort: Favorites first, then newest updated first
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d] text-[#b1b1b1] border-r border-[#222] select-none font-sans">
      {/* Brand title and New document creator tab */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#0f0f0f]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#a89f8d] rounded-full"></div>
          <span className="font-serif italic text-lg tracking-tight text-[#f0f0f0]">Manuscript.</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenTemplateManager}
            className="p-1.5 bg-[#141414] hover:bg-[#1a1a1a] text-[#a89f8d]/80 hover:text-[#a89f8d] border border-[#222] hover:border-[#333] rounded transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-[1.03]"
            title="Open Template Manager Skeletons"
            id="btn-open-template-manager"
          >
            <LayoutTemplate className="w-4 h-4" />
          </button>

          <button
            onClick={onAdd}
            className="p-1.5 bg-[#a89f8d] hover:bg-[#b0a898] text-[#0a0a0a] rounded transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-[1.03]"
            title="Create New File"
            id="btn-new-document"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modern Search bar input inside container */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#555]" />
          <input
            type="text"
            placeholder="Search library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#141414] text-xs text-[#d1d1d1] placeholder-[#555] rounded border border-[#222] focus:border-[#a89f8d] focus:bg-[#1a1a1a] transition focus:outline-none"
          />
        </div>
      </div>

      {/* Category filters tags container */}
      {allTags.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1 border-b border-[#222]">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-1 rounded text-[9px] font-semibold tracking-widest uppercase transition cursor-pointer ${
              selectedTag === null
                ? 'bg-[#1a1a1a] text-[#a89f8d] border border-[#333]'
                : 'bg-transparent text-[#666] hover:text-[#999]'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold tracking-widest uppercase transition cursor-pointer ${
                tag === selectedTag
                  ? 'bg-[#1a1a1a] text-[#a89f8d] border border-[#a89f8d]/35'
                  : 'bg-[#141414] text-[#666] border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#999]'
              }`}
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Styled File Tree document indexes list */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {sortedDocs.length === 0 ? (
          <div className="text-center py-8 px-4 text-[#555]">
            <Folder className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-serif italic">No documents found</p>
          </div>
        ) : (
          sortedDocs.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-center justify-between p-2.5 rounded transition-all ${
                doc.id === selectedId
                  ? 'bg-[#141414] text-[#f0f0f0] border-l border-[#a89f8d] pl-3'
                  : 'text-[#666] hover:bg-[#141414]/30 hover:text-[#999] pl-3'
              }`}
            >
              <div
                onClick={() => onSelect(doc.id)}
                className="flex-1 min-w-0 pr-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-medium block">
                    {doc.title || 'Untitled Document'}
                  </span>
                  {doc.isFavorite && (
                    <Star className="w-3 h-3 text-[#a89f8d] fill-[#a89f8d] flex-shrink-0" />
                  )}
                </div>
                {/* Meta details footer */}
                <span className="text-[10px] text-[#555] block truncate mt-1">
                  {doc.tags.length > 0 && (
                    <span className="mr-2 text-[#a89f8d]/80 font-mono font-medium">
                      #{doc.tags[0]}
                    </span>
                  )}
                  {new Date(doc.updatedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Action buttons (Fav, Destruct) visible on hover or if active */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleFavorite(doc.id)}
                  className={`p-1 hover:bg-[#1f1f1f] rounded transition cursor-pointer ${
                    doc.isFavorite ? 'text-[#a89f8d]' : 'text-[#555] hover:text-[#a89f8d]'
                  }`}
                  title={doc.isFavorite ? 'Unfavorite' : 'Favorite'}
                >
                  <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'fill-[#a89f8d]' : ''}`} />
                </button>
                <button
                  onClick={() => onDelete(doc.id, doc.title)}
                  className="p-1 hover:bg-rose-950/20 rounded text-[#555] hover:text-rose-400 transition cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Styled Sidebar Footer controls */}
      <div className="p-3 border-t border-[#222] bg-[#0c0c0c] space-y-2">
        {/* Firebase Cloud Sync Control Panel */}
        <div className="bg-[#0f0f0f] p-2.5 rounded border border-[#222] flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#555] uppercase tracking-widest font-sans">
            <div className="flex items-center gap-1.5">
              <Cloud className="w-3 h-3 text-[#a89f8d]" />
              <span>Cloud Storage</span>
            </div>
            {user ? (
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCloudSyncing ? 'bg-[#a89f8d]' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isCloudSyncing ? 'bg-[#a89f8d]' : 'bg-emerald-500'}`}></span>
              </span>
            ) : (
              <span className="text-[9px] text-[#555] font-normal lowercase italic">Offline</span>
            )}
          </div>

          {!user ? (
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-2 py-1.5 bg-[#a89f8d] hover:bg-[#b0a898] text-[#0a0a0a] rounded text-xs font-semibold cursor-pointer shadow-sm transition-all"
            >
              Sign In with Google
            </button>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover grayscale opacity-80" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center font-bold text-[10px] text-[#a89f8d]">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs text-[#999] font-medium truncate" title={user.email}>
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-[10px] text-[#555] hover:text-rose-455 transition cursor-pointer font-semibold underline"
                >
                  Sign Out
                </button>
              </div>
              <p className="text-[10px] text-[#666] leading-normal font-mono">
                {isCloudSyncing ? "⚡ Syncing cloud database..." : "✓ Cloud database synchronized"}
              </p>
            </div>
          )}
        </div>

        {/* Sync panel button */}
        <button
          onClick={onOpenBackup}
          className={`w-full flex items-center justify-between p-2 rounded text-xs font-medium border transition cursor-pointer ${
            backupConfigured
              ? 'bg-[#101c15] text-[#4ade80] border-[#1d3d2a] hover:bg-[#14291f]'
              : 'bg-[#141414] hover:bg-[#1a1a1a] text-[#999] border-[#222]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5" />
            <span>GitHub Sync</span>
          </div>
          <span className={`w-1.5 h-1.5 rounded-full ${backupConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-[#333]'}`} />
        </button>

        {/* Global theme controls */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {/* Theme button */}
          <button
            onClick={onToggleDarkMode}
            className="flex-1 flex items-center justify-center gap-1.5 p-1.5 bg-[#141414] hover:bg-[#1a1a1a] hover:text-white rounded text-xs text-[#999] transition cursor-pointer border border-[#222]"
            title="Toggle theme mode"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#a89f8d]" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#a89f8d]" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Settings button trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-[#141414] hover:bg-[#1a1a1a] hover:text-white rounded text-[#999] transition cursor-pointer flex items-center justify-center border border-[#222]"
            title="Editor Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
