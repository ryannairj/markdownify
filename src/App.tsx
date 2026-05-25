import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Settings, Sliders, RefreshCw, 
  Trash2, Tag, Star, LayoutTemplate, MonitorDot
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import ToolBar from './components/Toolbar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import BackupPanel from './components/BackupPanel';
import SpeechPlayer from './components/SpeechPlayer';
import TemplateManager from './components/TemplateManager';
import { Document, EditorSettings } from './types';
import { 
  auth, db, loginWithGoogle, logoutUser, doc, setDoc, deleteDoc, 
  collection, onSnapshot, query, where, serverTimestamp, Timestamp, FirebaseUser,
  handleFirestoreError, OperationType, saveUserMetadata
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ONBOARDING_DOCUMENTS: Document[] = [
  {
    id: 'onboard-1',
    title: 'Welcome to Markdown Workspace 🚀',
    content: '# Welcome to Markdown Workspace 🚀\n\nA highly responsive, **offline-first** writing canvas configured for professional markdown authors.\n\n## Key Features\n- **Real-Time Styled Rendering**: See custom themes, checkbox status, and styled headers instantly.\n- **Drag & Drop Media Support**: Drag any image over the editor canvas to embed it instantly as an offline Base64 string!\n- **Formatting Shortcuts**: Bold, italic, headers, tables, blockquotes, and checkboxes are available on the shortcut toolbar.\n- **Advanced Export Engines**: Clean printable print layouts optimized for PDF, and standalone styled HTML page downloads.\n- **GitHub Backup Sync**: Connect repositories securely via personal access tokens to sync files up or down.\n\n---\nCreated with 🤍 by AI Studio.',
    tags: ['guide', 'onboarding'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: true
  },
  {
    id: 'onboard-2',
    title: 'Advanced Syntax & Blocks Code 💻',
    content: '# Code Snippets & Syntax Highlights\n\nThis workspace highlights code blocks dynamically inside the preview.\n\n### 1. JavaScript block\n\n```js\nconst computeWordcount = (text) => {\n  if (!text.trim()) return 0;\n  return text.trim().split(/\\s+/).length;\n};\n\nconsole.log(computeWordcount("Hello world!"));\n```\n\n### 2. Python block\n\n```python\ndef calculate_reading_time(words):\n    reading_pace = 200\n    return max(1, round(words / reading_pace))\n```\n\n### 3. Tables and Quotes\n\n| Component | Technology | Target Scope |\n| :--- | :--- | :--- |\n| Core Parser | marked.js | Real-time Compilation |\n| Styling | Tailwind CSS | Swiss Design Aesthetic |\n\n> "Typography is the craft of endowing a human language with a durable visual form."\n> — Robert Bringhurst',
    tags: ['code', 'reference'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false
  }
];

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [settings, setSettings] = useState<EditorSettings>({
    theme: 'dark',
    distractionFree: false,
    layout: 'split',
    fontSize: 15,
    lineNumbers: true,
    cloudSyncEnabled: true
  });
  
  // Firebase configuration elements
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isLocalSaving, setIsLocalSaving] = useState(false);
  const saveTimeoutRef = useRef<any>(null);

  const triggerLocalSaving = () => {
    setIsLocalSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      setIsLocalSaving(false);
    }, 750);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Authenticate user status check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Upload/Save a document to firestore securely in-background
  const saveToCloud = async (docToSave: Document) => {
    if (!auth.currentUser) return;
    setIsCloudSyncing(true);
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/documents/${docToSave.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'documents', docToSave.id);
      await setDoc(docRef, {
        title: docToSave.title || 'Untitled Document',
        content: docToSave.content || '',
        tags: docToSave.tags || [],
        createdAt: Timestamp.fromDate(new Date(docToSave.createdAt)),
        updatedAt: serverTimestamp(),
        ownerId: userId,
        isFavorite: !!docToSave.isFavorite
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Real-time Firestore sync listener
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/documents`;
    setIsCloudSyncing(true);

    const unsub = onSnapshot(collection(db, 'users', user.uid, 'documents'), (snapshot) => {
      const fsDocs: Document[] = [];
      snapshot.forEach(snapDoc => {
        const data = snapDoc.data();
        fsDocs.push({
          id: snapDoc.id,
          title: data.title || '',
          content: data.content || '',
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          isFavorite: !!data.isFavorite
        });
      });

      // Pairwise merge cloud and local documents offline-first
      const savedDocsStr = localStorage.getItem('markdown_workspace_docs');
      let currentLocalDocs: Document[] = [];
      if (savedDocsStr) {
        try {
          currentLocalDocs = JSON.parse(savedDocsStr);
        } catch {}
      }

      const mergedDocsMap = new Map<string, Document>();

      // Prefill with all documents hosted on cloud
      fsDocs.forEach(cDoc => {
        mergedDocsMap.set(cDoc.id, cDoc);
      });

      // Overlay with local documents
      currentLocalDocs.forEach(lDoc => {
        if (!mergedDocsMap.has(lDoc.id)) {
          // Document only exists locally (created offline/onboarding) - upload in-bg
          uploadDocInBg(user.uid, lDoc);
          mergedDocsMap.set(lDoc.id, lDoc);
        } else {
          // If in both, assert the newest revision wins
          const cloudDoc = mergedDocsMap.get(lDoc.id)!;
          const lTime = new Date(lDoc.updatedAt).getTime();
          const cTime = new Date(cloudDoc.updatedAt).getTime();
          if (lTime > cTime) {
            uploadDocInBg(user.uid, lDoc);
            mergedDocsMap.set(lDoc.id, lDoc);
          }
        }
      });

      const finalMerged = Array.from(mergedDocsMap.values());
      setDocuments(finalMerged);
      localStorage.setItem('markdown_workspace_docs', JSON.stringify(finalMerged));

      setSelectedId(prevId => {
        const initialActiveId = prevId && finalMerged.some(d => d.id === prevId)
          ? prevId
          : finalMerged[0]?.id || '';
        localStorage.setItem('markdown_workspace_active_id', initialActiveId);
        return initialActiveId;
      });

      setIsCloudSyncing(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setIsCloudSyncing(false);
    });

    return () => unsub();
  }, [user]);

  const uploadDocInBg = async (uid: string, item: Document) => {
    const docRef = doc(db, 'users', uid, 'documents', item.id);
    try {
      await setDoc(docRef, {
        title: item.title || 'Untitled Document',
        content: item.content || '',
        tags: item.tags || [],
        createdAt: Timestamp.fromDate(new Date(item.createdAt)),
        updatedAt: serverTimestamp(),
        ownerId: uid,
        isFavorite: !!item.isFavorite
      });
    } catch (e) {
      console.error("Cloud background sync failed for " + item.id, e);
    }
  };

  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        await saveUserMetadata(loggedUser.uid, loggedUser.email || '');
      }
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedDocs = localStorage.getItem('markdown_workspace_docs');
    const savedSettings = localStorage.getItem('markdown_workspace_settings');
    const savedActiveId = localStorage.getItem('markdown_workspace_active_id');

    let loadedDocs: Document[] = [];
    if (savedDocs) {
      try {
        loadedDocs = JSON.parse(savedDocs);
      } catch (e) {
        console.error("Failed parsing documents cache", e);
      }
    }

    if (loadedDocs.length === 0) {
      loadedDocs = ONBOARDING_DOCUMENTS;
      localStorage.setItem('markdown_workspace_docs', JSON.stringify(loadedDocs));
    }

    setDocuments(loadedDocs);

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed parsing settings cache", e);
      }
    }

    const initialActiveId = savedActiveId && loadedDocs.some(d => d.id === savedActiveId)
      ? savedActiveId
      : loadedDocs[0]?.id || '';
    setSelectedId(initialActiveId);
  }, []);

  const handleSaveDocuments = (updatedDocs: Document[]) => {
    setDocuments(updatedDocs);
    localStorage.setItem('markdown_workspace_docs', JSON.stringify(updatedDocs));
    triggerLocalSaving();
  };

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const activeDoc = documents.find(doc => doc.id === selectedId);

  const handleSelectDoc = (id: string) => {
    setSelectedId(id);
    localStorage.setItem('markdown_workspace_active_id', id);
  };

  const handleContentChange = (newVal: string) => {
    if (!selectedId) return;
    let updatedDoc: Document | null = null;
    const updated = documents.map(doc => {
      if (doc.id === selectedId) {
        updatedDoc = {
          ...doc,
          content: newVal,
          updatedAt: new Date().toISOString()
        };
        return updatedDoc;
      }
      return doc;
    });
    handleSaveDocuments(updated);
    if (updatedDoc) saveToCloud(updatedDoc);
  };

  const handleTitleChange = (newTitle: string) => {
    if (!selectedId) return;
    let updatedDoc: Document | null = null;
    const updated = documents.map(doc => {
      if (doc.id === selectedId) {
        updatedDoc = {
          ...doc,
          title: newTitle || 'Untitled Document',
          updatedAt: new Date().toISOString()
        };
        return updatedDoc;
      }
      return doc;
    });
    handleSaveDocuments(updated);
    if (updatedDoc) saveToCloud(updatedDoc);
  };

  const handleToggleFavorite = (id: string) => {
    let updatedDoc: Document | null = null;
    const updated = documents.map(doc => {
      if (doc.id === id) {
        updatedDoc = { ...doc, isFavorite: !doc.isFavorite, updatedAt: new Date().toISOString() };
        return updatedDoc;
      }
      return doc;
    });
    handleSaveDocuments(updated);
    if (updatedDoc) saveToCloud(updatedDoc);
  };

  const handleAddDocument = () => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: 'Untitled Document',
      content: '# Untitled Document\n\nWrite your thoughts here...',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false
    };

    const updated = [newDoc, ...documents];
    handleSaveDocuments(updated);
    handleSelectDoc(newDoc.id);
    saveToCloud(newDoc);
  };

  const handleCreateDocFromTemplate = (title: string, content: string, tags: string[]) => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: title ? `New ${title}` : 'New Manuscript Blueprint',
      content: content || '',
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false
    };

    const updated = [newDoc, ...documents];
    handleSaveDocuments(updated);
    handleSelectDoc(newDoc.id);
    saveToCloud(newDoc);
  };

  const handleInjectContentIntoActiveDoc = (content: string, mode: 'overwrite' | 'append' | 'prepend') => {
    if (!activeDoc) return;
    let finalContent = '';
    if (mode === 'overwrite') {
      finalContent = content;
    } else if (mode === 'prepend') {
      finalContent = content + '\n\n' + activeDoc.content;
    } else { // 'append' or fallback
      finalContent = activeDoc.content + '\n\n' + content;
    }
    handleContentChange(finalContent);
  };

  const handleDeleteDocument = async (id: string, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name || 'Untitled Document'}"? This cannot be undone.`);
    if (!confirmed) return;

    const filtered = documents.filter(doc => doc.id !== id);
    let finalFiltered = filtered;
    
    if (filtered.length === 0) {
      finalFiltered = ONBOARDING_DOCUMENTS;
    }

    handleSaveDocuments(finalFiltered);

    if (selectedId === id) {
      handleSelectDoc(finalFiltered[0].id);
    }

    // Direct cloud delete
    if (user) {
      const path = `users/${user.uid}/documents/${id}`;
      try {
        const docRef = doc(db, 'users', user.uid, 'documents', id);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !newTagInput.trim()) return;
    const tag = newTagInput.trim().toLowerCase();
    
    let updatedDoc: Document | null = null;
    const updated = documents.map(doc => {
      if (doc.id === selectedId) {
        const tags = doc.tags || [];
        if (tags.includes(tag)) return doc;
        updatedDoc = {
          ...doc,
          tags: [...tags, tag],
          updatedAt: new Date().toISOString()
        };
        return updatedDoc;
      }
      return doc;
    });
    handleSaveDocuments(updated);
    setNewTagInput('');
    if (updatedDoc) saveToCloud(updatedDoc);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedId) return;
    let updatedDoc: Document | null = null;
    const updated = documents.map(doc => {
      if (doc.id === selectedId) {
        updatedDoc = {
          ...doc,
          tags: (doc.tags || []).filter(t => t !== tagToRemove),
          updatedAt: new Date().toISOString()
        };
        return updatedDoc;
      }
      return doc;
    });
    handleSaveDocuments(updated);
    if (updatedDoc) saveToCloud(updatedDoc);
  };

  const handleInsertMarkdownSyntax = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea || !activeDoc) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const selection = currentVal.substring(start, end);
    const replacement = prefix + (selection || defaultText) + suffix;

    const updatedContent = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    handleContentChange(updatedContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + (selection || defaultText).length;
    }, 50);
  };

  const getWordCount = () => {
    if (!activeDoc) return 0;
    const text = activeDoc.content.trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  };

  const getCharCount = () => {
    if (!activeDoc) return 0;
    return activeDoc.content.length;
  };

  const getReadTimeEstimate = () => {
    const words = getWordCount();
    return Math.max(1, Math.round(words / 200));
  };

  const handleFactoryReset = () => {
    const confirm = window.confirm("Reset all documents inside active workspace local caches back to onboarding factory seeds?");
    if (confirm) {
      localStorage.removeItem('markdown_workspace_docs');
      localStorage.removeItem('markdown_workspace_active_id');
      window.location.reload();
    }
  };

  const handleExportHtml = () => {
    if (!activeDoc) return;
    
    const htmlBody = document.getElementById('preview-panel-element')
      ?.querySelector('.styled-preview-body')?.innerHTML || '';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeDoc.title || 'Untitled Document'}</title>
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8fafc;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #0f172a;
        color: #f8fafc;
      }
    }
    pre code {
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body class="min-h-screen py-10 px-4 sm:px-8 md:px-16 transition-colors duration-200">
  <main class="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl p-6 sm:p-12 mb-10">
    <header class="border-b border-slate-100 dark:border-slate-800 pb-5 mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">${activeDoc.title || 'Untitled Document'}</h1>
      <p class="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1.5">Exported via Markdown Workspace</p>
    </header>
    <article class="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
      ${htmlBody}
    </article>
  </main>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.title.toLowerCase().replace(/[^a-z0-0]/g, '-') || 'document'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMd = () => {
    if (!activeDoc) return;
    const blob = new Blob([activeDoc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'document'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportDocuments = (imported: Document[]) => {
    const existingIds = new Set(documents.map(d => d.id));
    const cleanImported = imported.filter(item => !existingIds.has(item.id));
    
    if (cleanImported.length > 0) {
      const updated = [...cleanImported, ...documents];
      handleSaveDocuments(updated);
      handleSelectDoc(cleanImported[0].id);
    }
  };

  const isBackupConfigured = () => {
    const detail = localStorage.getItem('markdown_github_sync_config');
    if (!detail) return false;
    try {
      const parsed = JSON.parse(detail);
      return !!parsed.githubToken && !!parsed.githubRepo;
    } catch {
      return false;
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme };
    setSettings(updated);
    localStorage.setItem('markdown_workspace_settings', JSON.stringify(updated));
  };

  const handleUpdateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('markdown_workspace_settings', JSON.stringify(updated));
  };

  return (
    <div className={`h-screen flex text-[#d1d1d1] bg-[#0a0a0a] font-sans transition-colors duration-200 overflow-hidden ${settings.distractionFree ? 'DF-mode' : ''}`}>
      
      {/* 1. Document Sidebar Panel Container */}
      {!settings.distractionFree && isSidebarOpen && (
        <aside className="no-print w-72 h-full flex-shrink-0">
          <Sidebar
            documents={documents}
            selectedId={selectedId}
            onSelect={handleSelectDoc}
            onAdd={handleAddDocument}
            onDelete={handleDeleteDocument}
            onToggleFavorite={handleToggleFavorite}
            darkMode={settings.theme === 'dark'}
            onToggleDarkMode={handleToggleTheme}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
            backupConfigured={isBackupConfigured()}
            onOpenBackup={() => setIsBackupOpen(true)}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isCloudSyncing={isCloudSyncing}
          />
        </aside>
      )}

      {/* 2. Primary Editor Canvas coordinate structure */}
      <main className="flex-1 h-full flex flex-col min-w-0">
        {/* Toggle navigation panel triggers only in simple view */}
        <header className="no-print flex items-center justify-between px-6 py-3 border-b border-[#222] bg-[#0f0f0f] select-none">
          <div className="flex items-center gap-3 animate-fade-in">
            {!settings.distractionFree && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 hover:bg-[#1a1a1a] rounded text-[#666] hover:text-[#999] cursor-pointer"
                title={`${isSidebarOpen ? 'Minimize sidebar' : 'Expand sidebar docs'}`}
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            
            {/* Direct dynamic editing of document title */}
            {activeDoc ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeDoc.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="font-serif italic font-semibold text-base text-[#f0f0f0] bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-[#444] min-w-[200px]"
                  placeholder="Untitled Document"
                />
              </div>
            ) : (
              <span className="text-xs uppercase tracking-widest text-[#555] font-sans font-semibold">Select or Create a Document</span>
            )}
          </div>

          {/* Quick distraction toggle status badge */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleUpdateSetting('distractionFree', !settings.distractionFree)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase tracking-widest font-semibold cursor-pointer border transition-all ${
                settings.distractionFree 
                  ? 'bg-[#1a1a1a] text-[#a89f8d] border-[#a89f8d]/30 hover:bg-[#222]' 
                  : 'bg-transparent text-[#666] hover:text-[#999] border-[#222] hover:bg-[#1a1a1a]'
              }`}
              title="Toggle distraction-free focus mode"
            >
              <MonitorDot className="w-3.5 h-3.5" />
              <span>{settings.distractionFree ? 'Focused: On' : 'Focused: Off'}</span>
            </button>
          </div>
        </header>

        {/* Tags metadata editing line block */}
        {activeDoc && !settings.distractionFree && (
          <div className="no-print px-6 py-2 bg-[#0c0c0c] border-b border-[#222] flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-[9px] font-semibold text-[#555] uppercase tracking-widest font-sans select-none">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags</span>
            </div>
            
            {/* Custom Tag badges */}
            {activeDoc.tags && activeDoc.tags.map(tag => (
              <span 
                key={tag}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-[#141414] border border-[#222] rounded-full text-xs font-medium text-[#888] select-none group"
              >
                <span>#{tag}</span>
                <button 
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 rounded-full hover:bg-[#1a1a1a] text-[#555] hover:text-rose-450 ml-0.5 pointer"
                  title="Remove badge"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            {/* Inline dynamic tag adder form */}
            <form onSubmit={handleAddTag} className="inline-block">
              <input
                type="text"
                placeholder="+ Add Tag"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="bg-transparent border-dashed border border-[#222] hover:border-[#333] px-2.5 py-0.5 rounded-full text-xs text-[#555] placeholder-[#444] focus:outline-none focus:border-[#a89f8d] focus:ring-0 w-24 tracking-tight transition"
              />
            </form>
          </div>
        )}

        {/* 3. Helper Shortcut Toolbar */}
        {activeDoc && (
          <>
            <ToolBar
              onInsert={handleInsertMarkdownSyntax}
              wordCount={getWordCount()}
              charCount={getCharCount()}
              readTime={getReadTimeEstimate()}
              onExportHtml={handleExportHtml}
              onExportMd={handleExportMd}
            />
            <SpeechPlayer activeDoc={activeDoc} />
          </>
        )}

        {/* 4. Combined Split / Workspace edit-canvas structure */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {activeDoc ? (
            <div className="w-full h-full flex">
              {/* Left Side editor panel */}
              {settings.layout !== 'preview' && (
                <div className={`h-full ${settings.layout === 'split' ? 'w-1/2' : 'w-full'} overflow-hidden`}>
                  <Editor
                    value={activeDoc.content}
                    onChange={handleContentChange}
                    fontSize={settings.fontSize}
                    lineNumbers={settings.lineNumbers}
                    textareaRef={textareaRef}
                    layoutMode={settings.layout}
                    onToggleLayout={() => handleUpdateSetting('layout', settings.layout === 'split' ? 'editor' : 'split')}
                    isSaving={isLocalSaving || isCloudSyncing}
                  />
                </div>
              )}

              {/* Right Side preview panel */}
              {settings.layout !== 'editor' && (
                <div className={`h-full ${settings.layout === 'split' ? 'w-1/2' : 'w-full'} overflow-hidden`}>
                  <Preview
                    content={activeDoc.content}
                    title={activeDoc.title}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#555]">
              <LayoutTemplate className="w-12 h-12 mb-3.5 opacity-30 text-[#a89f8d]" />
              <h2 className="text-md font-serif italic text-[#999]">
                Workspace is inactive
              </h2>
              <p className="text-xs text-[#555] max-w-xs mt-1.5 font-sans">
                Select an existing document from the library list or create a fresh manuscript.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 5. Custom Settings Modal overlay screen */}
      {isSettingsOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none animate-fade-in col">
          <div className="w-full max-w-sm bg-[#0d0d0d] border border-[#222] rounded shadow-2xl p-6 relative">
            
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute right-4 top-4 p-1 px-2.5 hover:bg-[#1a1a1a] transition rounded text-[#555] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2 font-sans">
              <Sliders className="w-4 h-4 text-[#a89f8d]" />
              <span>Workspace Preferences</span>
            </h2>

            <div className="space-y-5 text-xs">
              {/* Font Sizer */}
              <div>
                <div className="flex justify-between items-center mb-1.5 font-semibold text-[#888] font-sans uppercase tracking-wider text-[10px]">
                  <span>Font Size</span>
                  <span className="font-mono text-[10px] bg-[#141414] border border-[#222] px-1.5 py-0.5 rounded text-[#a89f8d]">
                    {settings.fontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="24"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => handleUpdateSetting('fontSize', parseInt(e.target.value))}
                  className="w-full accent-[#a89f8d] cursor-pointer h-1 bg-[#222] rounded-lg appearance-none"
                />
              </div>

              {/* Line Gutter toggle */}
              <div className="flex items-center justify-between py-2 border-b border-[#222]">
                <div>
                  <h3 className="font-semibold text-[#999] font-sans uppercase tracking-wider text-[10px]">Gutter Line Numbers</h3>
                  <p className="text-[10px] text-[#555] font-serif italic mt-0.5">Display vertical lines on the far left of the editor.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.lineNumbers}
                  onChange={(e) => handleUpdateSetting('lineNumbers', e.target.checked)}
                  className="h-4 w-4 rounded border-[#333] text-[#a89f8d] bg-transparent focus:ring-0 cursor-pointer"
                />
              </div>

              {/* View Layout Selector */}
              <div>
                <h3 className="font-semibold text-[#999] font-sans uppercase tracking-wider text-[10px] mb-2">Display Mode Layout</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'split', label: 'Split View' },
                    { id: 'editor', label: 'Editor Only' },
                    { id: 'preview', label: 'Preview Only' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => handleUpdateSetting('layout', mode.id as any)}
                      className={`py-1.5 text-[9px] font-semibold tracking-widest uppercase border rounded transition-all cursor-pointer ${
                        settings.layout === mode.id
                          ? 'bg-[#a89f8d] text-[#0a0a0a] border-transparent font-bold'
                          : 'bg-[#141414] hover:bg-[#1a1a1a] text-[#888] border-[#222]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Factory reset option */}
              <div className="pt-3 border-t border-[#222]">
                <button
                  onClick={handleFactoryReset}
                  className="w-full py-2 flex items-center justify-center gap-1.5 hover:bg-rose-950/20 text-[#555] hover:text-rose-400 rounded transition text-xs font-semibold cursor-pointer border border-[#222]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Workspace Seeds</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. GitHub Syncer Setup dialog overlay */}
      <BackupPanel
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        documents={documents}
        onImportDocuments={handleImportDocuments}
      />

      {/* 7. Template Manager popover overlay */}
      <TemplateManager
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        activeDoc={activeDoc || null}
        onAddDocumentFromTemplate={handleCreateDocFromTemplate}
        onInjectContentIntoActiveDoc={handleInjectContentIntoActiveDoc}
      />
    </div>
  );
}
