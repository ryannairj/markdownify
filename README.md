# Manuscript — Premium Literary Markdown Workspace

A distraction-free, offline-first Markdown editor optimized for professional book authors, screenplay writers, and markdown publishers. Designed with elegant display typography, strict negative-space structures, and responsive interactive previews.

## 🚀 Key Features

- **Dual-Mode Sophisticated Aesthetics**:
  - **Sophisticated Dark**: Standard deep charcoal aesthetic styled to reduce late-night eye strain.
  - **Sophisticated Light (Parchment)**: Warm, high-contrast cream-white book texture simulating analog raw-cooked luxury papers.
- **Dynamic Gutter Rulers**: Code-editor-like gutter line numbers responding dynamically to scrolling and font sizing adjustments.
- **Interactive Drag & Drop Media**: Real-time conversion of embedded files (images, diagrams) into local, offline-persistent base64 string pointers natively loaded inside the preview.
- **One-Click Local Exports**: Production download pipelines generating raw Markdown (.md) documents and standalone styled CSS-embedded static publishing HTML configurations.
- **Read Manuscript Aloud (TTS)**: Clean, system-native text-to-speech feedback player designed to read active manuscripts aloud. Includes prose tag stripping, custom pace controllers, visual sentence caption segment indicators, and standard play/pause/stop hooks.
- **Template Manager Skeletons**: Interactive blueprint browser offering structured layouts for chapters, scholarly research papers, blogs, and character dossiers, with options to instantly generate files, append/prepend structure blocks, or save current active editor draft states as custom blueprints offline.
- **Granular GitHub Repos Backup**: Streamlined settings modal designed to direct fine-grained branch pushes/pulls of your documents libraries natively using fine-grained Personal Access Tokens.
- **Firebase Dual-Reconciliation Sync**: Optional automatic backup of local states to cloud databases, utilizing newest-write-wins collision-safe merging logic on connection changes.

## 🛠️ System Architectures

The system compiles directly via Vite using standard Tailwind utility overlays:
- **`src/index.css`**: Home of the dynamic layout custom selectors. Standardizes absolute hex class matches from JSX templates into highly interactive, theme-responsive variables.
- **`src/@theme`**: Declares default display families, linking the majestic **Playfair Display** header structure with scalable **Inter** bodies and high-contrast **JetBrains Mono** data readouts.

## 💻 Tech Stack & Dependencies

- **Framework**: React 18 / TypeScript
- **Bundler / Compilers**: Vite with native ESLint / PostCSS pipelines
- **Layout Animations**: `lucide-react` icons, standard CSS keyframes
- **Core Parser**: `marked` with custom structural element renderers
- **Build commands**:
  - `npm run dev`: Boot development server on local port `3000`.
  - `npm run build`: Production compilation.
  - `npm run lint`: Verify typescript compiler and syntax trees.
