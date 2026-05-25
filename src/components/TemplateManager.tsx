import React, { useState, useEffect } from 'react';
import { 
  X, Search, BookOpen, FileText, Blocks, UserCircle, 
  Plus, Check, Trash2, ArrowUpRight, Copy, CheckSquare, Sparkles
} from 'lucide-react';
import { Document, DocumentTemplate } from '../types';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoc: Document | null;
  onAddDocumentFromTemplate: (title: string, content: string, tags: string[]) => void;
  onInjectContentIntoActiveDoc: (content: string, mode: 'overwrite' | 'append' | 'prepend') => void;
}

const DEFAULT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl-book-chapter',
    title: 'Book Chapter Screenplay',
    description: 'A structural scaffolding with prologues, dividers, character entrances, and pacing indicators geared towards novelists and dramaturges.',
    tags: ['fiction', 'creative', 'novel'],
    content: `# Chapter I: The Threshold of Dawn\n\n*“A single step, and the road rises to meet the traveler.” — Old Proverb*\n\n## Prologue & Scene Setter\nSet the scene for your new chapter here. Describe the immediate environment, sensory details (lighting, ambient noises, tactile textures), and the atmospheric tension.\n\n## Character Introductions & Motivations\n- **Protagonist**: [Character Name] — Focus, current emotional posture, active objective for the scene.\n- **Supporting**: [Character Name] — Relationship to the protagonist, conflicting motive or unspoken subtext.\n\n## Narrative Scene Development\nThis is the dynamic core of your chapter. Keep dialogues crisp, specify descriptive gestures, and outline the actions.\n\n> "Use elegant layout blockquotes like this to highlight character memories, historical extracts, or direct internal monologues."\n\n---\n\n## Historical Revelations & Pacing Turn\n1. **The Conflict**: What is the primary friction or resistance introduced in this chapter?\n2. **The Pivot**: How do the characters' choices alter the directory of the plot?\n3. **The Hook**: What unresolved question urges your readers to start the next chapter immediately?`,
  },
  {
    id: 'tpl-research-paper',
    title: 'Academic Research Paper',
    description: 'An elegant APA/IEEE style outline with abstracts, methodology matrices, results tables, and bibliography catalogs.',
    tags: ['academic', 'non-fiction', 'formal'],
    content: `# Empirical Analysis of Distraction-Free Literary Workspaces\n\n### Abstract\n*A concise summary describing the purpose of the research, the main empirical methods deployed, core experimental findings, and their broad implications on workflow density. Recommended length: 155 words or fewer.*\n\n**Keywords**: *Distraction-free Writing, Workspace Psychology, Document Engineering, Cognitive focus.*\n\n---\n\n## 1. Introduction\nExplain the foundational background, key problem statement, and technical relevance. Review existing historical works and contextualize where this research establishes new pathways on the cognitive load of authors.\n\n## 2. Materials & Methods\nOutline experimental configurations, software layout criteria, and user tests under controlled conditions.\n\n| Observation Group | Quantitative Cohort | Average Focus Factor |\n| :--- | :--- | :--- |\n| Active Treatment Group | 45 Participants | 94.2% Focus Index |\n| Standard Control Group | 50 Participants | 88.5% Focus Index |\n\n## 3. Results & Findings\nDetail the raw facts resulting from experimentations and compile key data pointers cleanly.\n\n## 4. Discussion & Scholarly Limitations\nInterpret the findings of Section 3. Address limitations of study size, external variables, and recommendations for subsequent experimental protocols.\n\n## 5. References & Bib Bibliography\n1. Bringhurst, R. (1992). *The Elements of Typographic Style*. Hartley & Marks Publishers.\n2. Sweller, J. (1988). *Cognitive Load Theory during Problem Solving*. Cognitive Science, 12(2), 257-285.`,
  },
  {
    id: 'tpl-technical-blog',
    title: 'Technical Blog Article',
    description: 'SEO-optimized outline designed for developers, including hooks, formatted codes, tip callout guides, and summary structures.',
    tags: ['technical', 'blog', 'code'],
    content: `# Optimizing Client-Side Theme Pipelines for High-Contrast Viewports\n\n*Published on May 25, 2026 • 5 Min Read • By Technical Architect*\n\n## The State-Reconciliation Challenge\nAn engaging opening hook highlighting the engineering bottleneck, why traditional inline styles fail during theme transitions, and the chosen architecture.\n\n\`\`\`typescript\n// Our optimized style-interceptor hook for custom system theme values\ninterface ModernTheme {\n  background: string;\n  color: string;\n  accent: string;\n}\n\nexport function applyThemeHook(mode: 'light' | 'dark'): ModernTheme {\n  return {\n    background: mode === 'dark' ? "var(--bg-primary)" : "#f9f8f6",\n    color: mode === 'dark' ? "var(--text-primary)" : "#2c2a27",\n    accent: "#a89f8d"\n  };\n}\n\`\`\`\n\n## Step-by-Step Implementation Map\nLet's walk through the detailed steps required to resolve static stylesheet flickering events during render loops.\n\n### Step 1: Establish Dynamic CSS Custom Property Roots\nDeclare your root parameters clearly inside the stylesheet so variables change reactively when toggling dark mode classes.\n\n> **Pro-Tip Note:** Avoid hardcoded hex colors inside layout panels, as they ignore user preferences and break accessibility rules.\n\n### Step 2: Bind Listeners Securely with Refs\nListen to element state streams strictly to avoid rendering loops and maintain smooth 60fps animations.\n\n## Summary & Call-to-Action Highlights\nWrap up your key takeaways. What are the core lessons learned? Share this article on social handles or subscribe to our newsletter for more technical insights below!`,
  },
  {
    id: 'tpl-character-outline',
    title: 'Character Worksheet Dossier',
    description: 'A deep psychological profile analyzer for novels, tracking physical appearance, subconscious flaws, and dramatic character arcs.',
    tags: ['fiction', 'character', 'creative'],
    content: `# Characters Profile Study: [Character Name]\n\n## Primary Bio-Data Core\n- **Full Legal Name**: [Full Name]\n- **Dramatic Narrative Role**: (e.g., Protagonist, Antagonist, Foil, Catalyst, Mentor)\n- **Archetype / Temperament Profile**: (e.g., The Rebel Outcast, The Overachiever, Phlegmatic-Melancholic)\n\n---\n\n## Physical Presence & Aesthetic\n- **Physical Demeanor**: How do they hold themselves? How do they walk, stand, or convey hesitation in an aggressive crowd?\n- **Aesthetic Identifiers**: (e.g., A vintage pocketwatch, a worn leather jacket, an unusual phrase, or a nervous habit)\n- **Signature Expression**: *“Write an active spoken quote illustrating their core viewpoint on life here.”*\n\n## Psychological Architecture\n- **Core Desire**: What do they want more than anything else? (The external, tangible goal)\n- **The Blindspot / Inner Lie**: What false assumption about themselves or the world dictates their defense mechanisms?\n- **The Core Trauma**: What historical loss or pain formed this defense mechanism?\n- **Main Flaw**: What trait consistently disrupts their relationships or projects?\n\n## Character Arc & Evolutionary Milestones\n1. **Leaving Comfort**: What inciting incident disrupts their initial static balance?\n2. **The Midpoint Crisis**: Where does their old protective mask fail them completely, forcing raw confrontation?\n3. **Resolution & Change**: How does their spirit evolve, or do they descend into tragedy?`,
  }
];

export default function TemplateManager({
  isOpen,
  onClose,
  activeDoc,
  onAddDocumentFromTemplate,
  onInjectContentIntoActiveDoc,
}: TemplateManagerProps) {
  const [customTemplates, setCustomTemplates] = useState<DocumentTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Custom template inputs
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customTagsText, setCustomTagsText] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected template for quick preview pane
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(DEFAULT_TEMPLATES[0]);

  // Load custom templates on mount
  useEffect(() => {
    const saved = localStorage.getItem('markdown_workspace_custom_templates');
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed loading custom templates cache", e);
      }
    }
  }, []);

  // Sync to localstorage
  const saveCustomTemplatesToStorage = (templates: DocumentTemplate[]) => {
    setCustomTemplates(templates);
    localStorage.setItem('markdown_workspace_custom_templates', JSON.stringify(templates));
  };

  // Extract unique tags across all templates (Default + Custom)
  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];
  const allTags = Array.from(
    new Set(allTemplates.flatMap(t => t.tags))
  ).filter(Boolean);

  // Filtering logic
  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || t.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Handle saving the current active document as a personalized template
  const handleSaveActiveAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSuccessMsg('');

    if (!activeDoc) {
      setSaveError('You must have an active workspace document to save as template.');
      return;
    }

    if (!customTitle.trim()) {
      setSaveError('Please provide a descriptive title for this template.');
      return;
    }

    const tagsArray = customTagsText
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const newTemplate: DocumentTemplate = {
      id: `tpl-custom-${Date.now()}`,
      title: customTitle.trim(),
      description: customDescription.trim() || 'A user-saved custom writing skeleton blueprint.',
      tags: tagsArray,
      content: activeDoc.content,
      isCustom: true
    };

    const updated = [newTemplate, ...customTemplates];
    saveCustomTemplatesToStorage(updated);
    
    // Clear inputs and state
    setCustomTitle('');
    setCustomDescription('');
    setCustomTagsText('');
    setIsCreatingCustom(false);
    setPreviewTemplate(newTemplate);
    setSuccessMsg('Template saved successfully in your custom library!');
    
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // Prefill the custom template form with active document title
  const handleOpenCustomForm = () => {
    if (!activeDoc) {
      alert('Open a document in the editor first to use as a skeleton draft.');
      return;
    }
    setCustomTitle(`${activeDoc.title} Skeleton`);
    setCustomDescription(`Custom template derived from your draft "${activeDoc.title}".`);
    setCustomTagsText(activeDoc.tags ? activeDoc.tags.join(', ') : 'my-draft');
    setIsCreatingCustom(true);
  };

  const handleDeleteCustomTemplate = (id: string, name: string) => {
    const confirmed = window.confirm(`Remove custom template "${name}" from your local collection?`);
    if (!confirmed) return;

    const filtered = customTemplates.filter(t => t.id !== id);
    saveCustomTemplatesToStorage(filtered);

    if (previewTemplate?.id === id) {
      setPreviewTemplate(DEFAULT_TEMPLATES[0]);
    }
  };

  const handleCreateNewDoc = (tmpl: DocumentTemplate) => {
    onAddDocumentFromTemplate(tmpl.title, tmpl.content, tmpl.tags);
    onClose();
  };

  const handleInjectContent = (tmpl: DocumentTemplate, mode: 'overwrite' | 'append' | 'prepend') => {
    onInjectContentIntoActiveDoc(tmpl.content, mode);
    onClose();
  };

  // Icon selector based on tag
  const getTemplateIcon = (title: string, tags: string[]) => {
    const str = (title + ' ' + tags.join(' ')).toLowerCase();
    if (str.includes('fiction') || str.includes('novel') || str.includes('chapter')) {
      return <BookOpen className="w-4 h-4 text-[#a89f8d]" />;
    }
    if (str.includes('academic') || str.includes('paper') || str.includes('research')) {
      return <FileText className="w-4 h-4 text-[#a89f8d]" />;
    }
    if (str.includes('blog') || str.includes('site') || str.includes('article') || str.includes('technical')) {
      return <Blocks className="w-4 h-4 text-[#a89f8d]" />;
    }
    if (str.includes('character') || str.includes('dossier') || str.includes('worksheet')) {
      return <UserCircle className="w-4 h-4 text-[#a89f8d]" />;
    }
    return <Sparkles className="w-4 h-4 text-[#a89f8d]" />;
  };

  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-5xl bg-[#0d0d0d] border border-[#222] rounded flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-fade-in text-[#b1b1b1]">
        
        {/* Header Block Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0c0c0c]">
          <div className="flex items-center gap-2">
            <Blocks className="w-4 h-4 text-[#a89f8d]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#f0f0f0] font-sans">
              Template Repository & Manager
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 hover:bg-[#1a1a1a] transition rounded text-[#555] hover:text-white cursor-pointer ring-0 outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master layout block split */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left panel: Catalog filtering and list view */}
          <div className="w-2/5 border-r border-[#222] flex flex-col bg-[#0a0a0a]">
            
            {/* Search inputs */}
            <div className="p-4 border-b border-[#222] space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#555]" />
                <input
                  type="text"
                  placeholder="Filter skeletons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-[#090909] text-xs border border-[#222] rounded text-[#d1d1d1] placeholder-[#444] focus:outline-none focus:border-[#a89f8d] focus:ring-0 transition"
                />
              </div>

              {/* Tag filters row */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-2 py-0.5 rounded text-[8px] font-sans font-semibold tracking-widest uppercase transition cursor-pointer border ${
                      selectedTag === null
                        ? 'bg-[#1a1a1a] text-[#a89f8d] border-[#333]'
                        : 'bg-transparent text-[#555] border-transparent hover:text-[#888]'
                    }`}
                  >
                    All
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`px-2 py-0.5 rounded text-[8px] font-sans font-semibold tracking-widest uppercase transition cursor-pointer border ${
                        tag === selectedTag
                          ? 'bg-[#1a1a1a] text-[#a89f8d] border-[#a89f8d]/30'
                          : 'bg-transparent text-[#555] border-transparent hover:bg-[#141414] hover:text-[#999]'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Template lists container */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-10 px-4 text-[#555]">
                  <p className="text-xs font-serif italic">No matching layouts found.</p>
                </div>
              ) : (
                filteredTemplates.map((tmpl) => {
                  const isSelected = previewTemplate?.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setPreviewTemplate(tmpl);
                        setIsCreatingCustom(false);
                      }}
                      className={`group p-3 rounded cursor-pointer transition border ${
                        isSelected 
                          ? 'bg-[#141414] border-[#a89f8d]/30 text-white' 
                          : 'bg-transparent border-transparent hover:bg-[#141414]/25 text-[#888] hover:text-[#d1d1d1]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {getTemplateIcon(tmpl.title, tmpl.tags)}
                          <span className="text-xs font-semibold truncate font-sans tracking-wide">
                            {tmpl.title}
                          </span>
                        </div>
                        {tmpl.isCustom && (
                          <span className="text-[8px] bg-[#a89f8d]/10 text-[#a89f8d] border border-[#a89f8d]/25 px-1 py-0.2 rounded uppercase font-mono tracking-wider font-semibold">
                            Custom
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[10px] text-[#555] truncate font-serif italic mb-1.5 leading-normal">
                        {tmpl.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {tmpl.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[8px] font-mono text-[#555]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        {tmpl.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomTemplate(tmpl.id, tmpl.title);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 transition rounded hover:bg-rose-950/20 text-[#555] hover:text-rose-400 cursor-pointer"
                            title="Delete custom blueprint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar quick Save dynamic block footer */}
            {activeDoc && (
              <div className="p-3 border-t border-[#222] bg-[#0c0c0c] text-center">
                <button
                  onClick={handleOpenCustomForm}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-transparent hover:bg-[#1a1a1a] text-white rounded text-[10px] font-bold font-sans uppercase tracking-widest border border-[#222] hover:border-[#333] transition cursor-pointer"
                  title="Save current file markdown state as personal template"
                >
                  <Copy className="w-3 h-3" />
                  <span>Use Active draft as template</span>
                </button>
              </div>
            )}
          </div>

          {/* Right panel: Live Preview & Action panel trigger split */}
          <div className="flex-1 flex flex-col bg-[#090909]">
            
            {successMsg && (
              <div className="m-4 p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs rounded flex gap-2 items-center font-sans tracking-wide">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Custom create wizard layout */}
            {isCreatingCustom ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="border-b border-[#222] pb-2">
                  <h3 className="text-xs font-bold text-[#f0f0f0] uppercase tracking-widest font-sans">
                    Derive Custom Template
                  </h3>
                  <p className="text-[10px] text-[#555] font-serif italic mt-0.5">
                    Save the current writing structure of "{activeDoc?.title}" as a reusable workflow skeleton.
                  </p>
                </div>

                <form onSubmit={handleSaveActiveAsTemplate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#888] font-sans uppercase tracking-wider mb-1.5">
                      Template Blueprint Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Sci-Fi Story Skeleton"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-[#0d0d0d] text-xs border border-[#222] rounded text-[#d1d1d1] placeholder-[#444] focus:outline-none focus:border-[#a89f8d] focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#888] font-sans uppercase tracking-wider mb-1.5">
                      Short Memoir / Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., A three-act character outline with conflict benchmarks"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-[#0d0d0d] text-xs border border-[#222] rounded text-[#d1d1d1] placeholder-[#444] focus:outline-none focus:border-[#a89f8d] focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#888] font-sans uppercase tracking-wider mb-1.5">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="creative, space-opera, planning"
                      value={customTagsText}
                      onChange={(e) => setCustomTagsText(e.target.value)}
                      className="w-full px-4 py-2 bg-[#0d0d0d] text-xs border border-[#222] rounded text-[#d1d1d1] placeholder-[#444] focus:outline-none focus:border-[#a89f8d] focus:ring-0"
                    />
                  </div>

                  {saveError && (
                    <p className="text-rose-400 text-[10px] font-mono">{saveError}</p>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 bg-[#a89f8d] hover:bg-[#b0a797] text-[#0a0a0a] rounded text-[10px] font-bold font-sans uppercase tracking-widest cursor-pointer transition"
                    >
                      Save to My Templates
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustom(false)}
                      className="px-4 py-2 bg-[#141414] hover:bg-[#1a1a1a] text-[#888] hover:text-white border border-[#222] rounded text-[10px] font-bold font-sans uppercase tracking-widest cursor-pointer transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : previewTemplate ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Active selection metadata info header */}
                <div className="p-4 bg-[#0c0c0c] border-b border-[#222] flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-serif italic font-semibold text-sm text-[#f0f0f0] truncate">
                        {previewTemplate.title}
                      </h3>
                      <div className="flex gap-1">
                        {previewTemplate.tags.map(tag => (
                          <span key={tag} className="text-[8px] tracking-wider uppercase font-semibold bg-[#1a1a1a] text-[#a89f8d]/80 px-1.5 py-0.5 rounded border border-[#222]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-[#666] leading-relaxed mt-1 font-sans">
                      {previewTemplate.description}
                    </p>
                  </div>

                  {/* Immediate file creators from template */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleCreateNewDoc(previewTemplate)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#a89f8d] hover:bg-[#b0a797] text-[#0a0a0a] font-semibold rounded text-[10px] uppercase font-sans tracking-widest cursor-pointer transition shadow-sm"
                      title="Instantly generate a brand-new file loaded with this structured skeletal layout"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New File</span>
                    </button>
                  </div>
                </div>

                {/* Sub-actions for injecting content inside active document */}
                {activeDoc && (
                  <div className="px-4 py-2 bg-[#0b0b0b] border-b border-[#222] flex items-center justify-between gap-4 text-[10px] text-[#666] font-sans">
                    <span className="flex items-center gap-1 italic text-[9px] font-serif">
                      <CheckSquare className="w-3 h-3 text-[#a89f8d]" />
                      Active: "{activeDoc.title}"
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] uppercase tracking-wider text-[#555]">Or Inject:</span>
                      <button
                        onClick={() => handleInjectContent(previewTemplate, 'overwrite')}
                        className="px-2 py-1 bg-[#141414] hover:bg-[#1a1a1a] hover:text-white text-[#888] rounded border border-[#222] cursor-pointer text-[9px] uppercase tracking-wider tracking-widest transition"
                        title="Fully wipe out active editor content and replace with this outline structure"
                      >
                        Overwrite
                      </button>
                      <button
                        onClick={() => handleInjectContent(previewTemplate, 'prepend')}
                        className="px-2 py-1 bg-[#141414] hover:bg-[#1a1a1a] hover:text-white text-[#888] rounded border border-[#222] cursor-pointer text-[9px] uppercase tracking-wider tracking-widest transition"
                        title="Add outline text to the absolute top of the current editor document"
                      >
                        Prepend Top
                      </button>
                      <button
                        onClick={() => handleInjectContent(previewTemplate, 'append')}
                        className="px-2 py-1 bg-[#141414] hover:bg-[#1a1a1a] hover:text-white text-[#888] rounded border border-[#222] cursor-pointer text-[9px] uppercase tracking-wider tracking-widest transition"
                        title="Append outline contents below existing editor text at the bottom"
                      >
                        Append Bottom
                      </button>
                    </div>
                  </div>
                )}

                {/* Plain raw preview of template lines */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#090909] font-mono text-[10px] leading-relaxed text-[#555] select-text">
                  <div className="border border-[#141414] p-3 rounded bg-[#090909] max-w-none text-[#999] whitespace-pre-wrap select-text selection:bg-[#a89f8d]/30">
                    {previewTemplate.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#555] font-serif italic">
                <p>Select a writing layout on the panel or create standard documents</p>
              </div>
            )}

          </div>

        </div>

        {/* Footer info banner details */}
        <div className="p-3 bg-[#0a0a0a] text-[9px] text-[#555] border-t border-[#222] font-serif flex items-center justify-between">
          <span className="flex items-center gap-1 uppercase font-sans tracking-widest text-[9px] font-semibold text-[#888]">
            <Sparkles className="w-3 h-3 text-[#a89f8d]" /> Workspace Skeleton Manager
          </span>
          <span>Templates are fully cached client-side for offline-first availability.</span>
        </div>

      </div>
    </div>
  );
}
