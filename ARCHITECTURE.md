# System Architecture & Technical Specifications — Manuscript

## 1. Structural Overview
Manuscript is structured as a client-side modern React SPA built on Vite, compiling to static resources (`dist/`). The backend persistence relies optionally on a client-integrated Firebase layer for multi-device sync, and a granular integration with the GitHub Content APIs for external backups.

```
                  +-----------------------------------+
                  |            React App              |
                  |            (App.tsx)              |
                  +---+------------+--------------+---+
                      |            |              |
         +------------v---+   +----v--------+   +-v------------+
         |   Local State  |   |   Firebase  |   |   GitHub     |
         | & localStorage |   | (Firestore) |   | Backup Panel |
         +----------------+   +-------------+   +--------------+
```

## 2. Component Hierarchy
- **App.tsx**: Host manager coordinating system settings, active document selections, tag badging, and modal triggers.
  - **Sidebar.tsx**: Navigtion drawer presenting document catalogs, live indexing search inputs, category badges, active synchronization indicators, and main theme controls.
  - **Toolbar.tsx**: Action buttons translating mouse clicks into Markdown inline tag modifiers in the cursor position.
  - **Editor.tsx**: Textarea with standard line numbers gutter tracking keydowns (Tab indentions, shortcuts) and drag-and-drop base64 image embeds.
  - **Preview.tsx**: HTML compiler utilizing `marked` to build custom structural layouts for headers, tables, code listings, and blockquotes with print constraints.
  - **BackupPanel.tsx**: GitHub sync credential form coordinating fine-grained push and pull commits.
  - **SpeechPlayer.tsx**: Built-in audio controller that segments manuscripts into readable sentences, strips syntax tokens, and directs verbal reading.

## 3. Persistent Storage Engine
- **Local Engine**: Direct serialization of document arrays (`markdown_workspace_docs`) and preferences (`markdown_workspace_settings`) inside local storage.
- **Firebase Sync**: Background listeners triggering on-snapshots; newest timestamp wins on document reconciliation, ensuring no offline workflows are overwritten on network recovery.
- **Vocal Settings Cache**: Keeps client-selected TTS voice profiles cached inside local storage (`manuscript_tts_voice`) for persistence across application reloads.

## 4. Theme Integration & Styling Cascade
- **Remapping Strategy**: The system implements an absolute-value override layer inside `index.css`.
- Since static Tailwind class declarations in JS/TSX are compiled to absolute compiled targets, custom CSS overrides intercept specific class matches (e.g. `.bg-[#0a0a0a]` or `.text-[#d1d1d1]`) and route them to theme variables (`--bg-primary`, `--text-primary`).
- This binds static markup templates directly to the `.dark` class state toggle on the document root, making both **Sophisticated Light** and **Sophisticated Dark** themes operate synchronously without mutating visual modules.

## 5. Text-To-Speech Synthesis Engine Design
To address standard browser engine issues (e.g., SpeechSynthesis capping/timeout bugs on Chromium setups during lengthy speech spans), the `SpeechPlayer` divides documents dynamically into individual sentences using lookbehind punctuation boundaries (`(?<=[.!?])\s+`).
1. **Markdown Cleaner**: Replaces heading tokens, hyperlink brackets, code frames, and blockquotes with clean readable text prior to speaking.
2. **Step Tracker**: Iterates sequentially through sentence index lists, playing each segment as a fresh utterance. Pauses cancel the audio feed immediately but maintain index state, allowing resume actions to retrigger speech from the exact interruption index without locking the browser's audio channel.

