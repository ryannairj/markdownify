import React, { useState, useEffect } from 'react';
import { 
  Cloud, Github, Key, Check, AlertTriangle, RefreshCw, 
  ArrowUpRight, ArrowDownLeft, X, ShieldAlert 
} from 'lucide-react';
import { Document, BackupConfig, BackupStatus } from '../types';

interface BackupPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onImportDocuments: (docs: Document[]) => void;
}

export default function BackupPanel({ 
  isOpen, 
  onClose, 
  documents,
  onImportDocuments
}: BackupPanelProps) {
  const [config, setConfig] = useState<BackupConfig>({
    githubToken: '',
    githubRepo: '',
    githubBranch: 'main',
    githubPath: 'markdown-notes'
  });

  const [status, setStatus] = useState<BackupStatus>({
    status: 'idle',
    message: ''
  });

  // Load saved credentials from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('markdown_github_sync_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed loading configuration", e);
      }
    }
  }, []);

  const handleSaveConfig = () => {
    if (!config.githubToken || !config.githubRepo) {
      setStatus({ 
        status: 'error', 
        message: 'Personal access token and repository location are required.' 
      });
      return;
    }
    
    localStorage.setItem('markdown_github_sync_config', JSON.stringify(config));
    setStatus({ 
      status: 'success', 
      message: 'Configuration saved. Ready to synchronize!' 
    });
  };

  // Safe encoding for utf-8 emojis
  const encodeBase64 = (str: string) => {
    return btoa(unescape(encodeURIComponent(str)));
  };

  const decodeBase64 = (str: string) => {
    return decodeURIComponent(escape(atob(str)));
  };

  // Perform a full real-time git overwrite sync up to GitHub
  const handlePushToGithub = async () => {
    if (!config.githubToken || !config.githubRepo) {
      setStatus({ 
        status: 'error', 
        message: 'Please fill in and save your credentials first.' 
      });
      return;
    }

    setStatus({ status: 'syncing', message: 'Starting backup pushes to GitHub...' });
    const repoPath = config.githubRepo.trim();
    const branchName = config.githubBranch.trim() || 'main';
    const folderPath = config.githubPath.trim() ? `${config.githubPath.trim()}/` : '';

    let successCount = 0;
    let failCount = 0;

    for (const doc of documents) {
      const fileName = `${doc.title.replace(/[^a-zA-Z0-9_\-]/g, '_') || doc.id}.md`;
      const docPath = `${folderPath}${fileName}`;
      const url = `https://api.github.com/repos/${repoPath}/contents/${docPath}`;

      try {
        // Fetch current file SHA if document already exists
        let currentSha = '';
        const getRes = await fetch(url, {
          headers: {
            'Authorization': `token ${config.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (getRes.status === 200) {
          const body = await getRes.json();
          currentSha = body.sha;
        }

        // Push / Commit content up
        const commitPayload = {
          message: `Backup: Synchronize ${doc.title || 'Untitled'}`,
          content: encodeBase64(doc.content),
          branch: branchName,
          ...(currentSha ? { sha: currentSha } : {})
        };

        const putRes = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${config.githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify(commitPayload)
        });

        if (putRes.ok) {
          successCount++;
        } else {
          failCount++;
          console.error("PUT failure body", await putRes.text());
        }
      } catch (err) {
        failCount++;
        console.error(`Failed pushing ${doc.title}`, err);
      }
    }

    setStatus({
      status: failCount === 0 ? 'success' : 'error',
      message: `Sync complete. Powered committing: ${successCount} files uploaded successfully. ${failCount > 0 ? `${failCount} errors encountered.` : ''}`
    });
  };

  // Retrieve existing markdown files from GitHub
  const handlePullFromGithub = async () => {
    if (!config.githubToken || !config.githubRepo) {
      setStatus({ 
        status: 'error', 
        message: 'Please fill in and save your credentials first.' 
      });
      return;
    }

    setStatus({ status: 'syncing', message: 'Scanning target folder on GitHub...' });
    const repoPath = config.githubRepo.trim();
    const folderPath = config.githubPath.trim();
    const url = `https://api.github.com/repos/${repoPath}/contents/${folderPath}`;

    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `token ${config.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Cannot access specified directory folder Path.');
      }

      const contents = await res.json();
      if (!Array.isArray(contents)) {
        throw new Error('Specified target path is not a folder directory.');
      }

      // Filter for markdown files
      const mdFiles = contents.filter(item => item.name.endsWith('.md') && item.type === 'file');
      const importedDocs: Document[] = [];

      for (const file of mdFiles) {
        const fileRes = await fetch(file.url, {
          headers: {
            'Authorization': `token ${config.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (fileRes.ok) {
          const body = await fileRes.json();
          const decodedContent = decodeBase64(body.content);
          const cleanTitle = file.name.replace(/\.md$/, '').replace(/_/g, ' ');

          importedDocs.push({
            id: `git-${file.sha}`,
            title: cleanTitle,
            content: decodedContent,
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      if (importedDocs.length > 0) {
        onImportDocuments(importedDocs);
        setStatus({
          status: 'success',
          message: `Successfully retrieved ${importedDocs.length} markdown documents from your GitHub repo!`
        });
      } else {
        setStatus({
          status: 'success',
          message: 'Workspace folder connection was verified, but no markdown (.md) documents were found in the scope.'
        });
      }

    } catch (err) {
      setStatus({
        status: 'error',
        message: `Pull failure: ${(err as Error).message}`
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-[#0d0d0d] border border-[#222] rounded flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0c0c0c]">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-[#a89f8d]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#f0f0f0] font-sans">
              GitHub Backup Options
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 hover:bg-[#1a1a1a] transition rounded text-[#555] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content scrolling element */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Diagnostic status banner */}
          {status.status !== 'idle' && (
            <div className={`p-3 rounded border text-xs flex gap-2.5 ${
              status.status === 'success' 
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                : status.status === 'error'
                ? 'bg-rose-955/20 border-rose-900/30 text-rose-450'
                : 'bg-[#141414] border-[#222] text-[#a89f8d] animate-pulse'
            }`}>
              {status.status === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
              ) : status.status === 'success' ? (
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          {/* Form settings details */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#888] font-sans uppercase tracking-wider mb-1.5">
                Personal Access Token (PAT)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#444]" />
                <input
                  type="password"
                  placeholder="github_pat_..."
                  value={config.githubToken}
                  onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 bg-[#090909] text-xs border border-[#222] rounded text-[#d1d1d1] placeholder-[#444] focus:outline-none focus:border-[#a89f8d] focus:ring-0"
                />
              </div>
              <span className="text-[10px] text-[#555] font-serif italic mt-1 block">
                Needs active fine-grained access with write and read permissions for standard content files on selected repos.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#888] font-sans uppercase tracking-wider mb-1.5">
                  Repository Path
                </label>
                <input
                  type="text"
                  placeholder="username/notes-repo"
                  value={config.githubRepo}
                  onChange={(e) => setConfig({ ...config, githubRepo: e.target.value })}
                  className="w-full px-4 py-2 bg-[#090909] text-xs border border-[#222] rounded text-[#d1d1d1] placeholder-[#444] focus:outline-none focus:border-[#a89f8d] focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#888] font-sans uppercase tracking-wider mb-1.5">
                   Target Branch
                </label>
                <input
                  type="text"
                  placeholder="main"
                  value={config.githubBranch}
                  onChange={(e) => setConfig({ ...config, githubBranch: e.target.value })}
                  className="w-full px-4 py-2 bg-[#090909] text-xs border border-[#222] rounded text-[#d1d1d1] placeholder-[#444] focus:outline-none focus:border-[#a89f8d] focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#888] font-sans uppercase tracking-wider mb-1.5">
                Sub-Folder Path
              </label>
              <input
                type="text"
                placeholder="markdown-documents"
                value={config.githubPath}
                onChange={(e) => setConfig({ ...config, githubPath: e.target.value })}
                className="w-full px-4 py-2 bg-[#090909] text-xs border border-[#222] rounded text-[#d1d1d1] placeholder-[#444] focus:outline-none focus:border-[#a89f8d] focus:ring-0"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveConfig}
                className="flex-1 py-2 px-4 bg-transparent hover:bg-[#1a1a1a] text-white rounded text-[10px] font-bold font-sans uppercase tracking-widest border border-[#222] hover:border-[#333] cursor-pointer transition"
              >
                Save Syncer Details
              </button>
            </div>
          </div>

          {/* Sync operations Actions panels */}
          <div className="pt-4 border-t border-[#222] flex flex-col gap-2">
            <h3 className="text-[10px] font-bold text-[#888] font-sans uppercase tracking-wider mb-1">
              Active Commits Actions
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handlePushToGithub}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#a89f8d] hover:bg-[#b0a797] text-[#0a0a0a] font-semibold rounded text-[10px] uppercase font-sans tracking-widest cursor-pointer transition"
                title="Commit all docs from localStorage up to GitHub"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Upload to Github</span>
              </button>

              <button
                onClick={handlePullFromGithub}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#141414] hover:bg-[#1a1a1a] text-[#888] hover:text-white border border-[#222] font-semibold rounded text-[10px] uppercase font-sans tracking-widest cursor-pointer transition"
                title="Pull markdown files down into active collection"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Import from Github</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer instructions */}
        <div className="p-4 bg-[#0a0a0a] text-[10px] text-[#555] border-t border-[#222] rounded-b font-serif">
          <span className="flex items-center gap-1 font-semibold text-[#888] mb-1 font-sans uppercase tracking-widest text-[9px]">
            <ShieldAlert className="w-3 h-3 text-[#a89f8d]" /> Security Notice
          </span>
          All sync credentials remain 100% Client-Side. Your Personal Access Tokens interact directly with the GitHub API from your browser context securely.
        </div>
      </div>
    </div>
  );
}
