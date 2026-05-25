# Product Requirement Document (PRD) — Manuscript Workspace

## 1. Product Vision & Overview
**Manuscript** is a distraction-free, offline-first Markdown editor designed for professional authors, researchers, and technical writers who appreciate sophisticated book-like typography, negative space, and premium aesthetics. Moving away from generic developer-styled dark themes, it adapts a high-contrast literary visual style utilizing elegant display typography, warm serif document layouts, and standard-compliant markdown shortcuts.

## 2. Core Themes & Target Personas
- **Sophisticated Dark Theme**: A high-contrast charcoal canvas designed to reduce eye fatigue during long late-night writing sweeps.
- **Sophisticated Light Theme (Parchment)**: A warm cream background reminiscent of high-end raw-cooked paper and classic physical books, maximizing cognitive reading focus.
- **Target Audience**: Novelists, screenwriters, technical documentation writers, and academic researchers seeking single-screen focus.

## 3. Scope of Features & Technical Boundaries
- **Single-Screen Workspace**: Single-view layout focusing entirely on the manuscript text pane and real-time structured previews.
- **Offline-First & Local Persistence**: Writes and synchronizes workspace revisions with local client state triggers (`localStorage`).
- **Cloud Database Support**: Optional database storage synchronizing with Firebase Firestore and Google Authentication.
- **Shortcut Formatting Toolbar**: Standard action triggers for simple tags (headers, quotes, lists, code, and text style markers).
- **Dynamic File Tree & Category Tag Sorting**: Built-in library list with instant search terms and keyword-specific tag filters.
- **Export & Production Pipeline**: Raw Markdown downloads and standalone, layout-perfect CSS-embedded static HTML files for publishing.
- **Read Manuscript Aloud**: Browser-native SpeechSynthesis player that parses active document text, strips raw markdown tags (to preserve pristine prose audio), provides local voice-profile selectors, custom pacing control, and real-time sentence-by-sentence captioned visual telemetry.
- **Template Manager**: Integrated workspace skeleton system providing built-in literary templates (Book Chapter, Research Paper, Technical Blog, Character Worksheet) with seamless workflows to save current active drafts as custom blueprint skeletons, and multi-mode injection triggers (overwrite, prepend, append) or single-click new document creation.
- **External Git Syncer**: Fine-grained GitHub push/pull operations to save revisions natively to remote source trees.

## 4. Design & Usability Mandates
- **Zero Generic AI Slop**: Strict rejection of generic purple/pink gradients, rounded futuristic pill elements, or neon lines.
- **Responsive Layout**: Fluid desktop structures paired with readable touch boundaries and clear margin systems.
- **Theme-Switching Resilience**: Immediate, layout-wide adaptation to theme preferences via CSS custom property layers (light and dark).
