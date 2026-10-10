# Flow Audit — Voice-to-Diff & Tone Harmonizer Review Companion

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Engine](https://img.shields.io/badge/Engine-Voice--to--Diff-00F2FE?style=flat)](#)
[![Tone](https://img.shields.io/badge/Tone-Harmonizer-10B981?style=flat)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#)

> **Flow Audit** is a real code review and refactor desktop companion designed for engineering velocity. While your eyes and cursor follow the code, you speak naturally — Flow converts rushed spoken thoughts into respectful, annotated, and syntactically verified GitHub Pull Request suggestions with an interactive Placement Board.

---

## 💡 The Problem

Performing rigorous GitHub PR reviews or untangling algorithmic bottlenecks requires constant context switching:
- Jumping between inspecting complex AST lines, typing Markdown paragraphs, and crafting exact diff blocks.
- Writing precise code suggestions takes so much friction that most developers leave vague, rushed comments like *"slow loop"* or *"this is awful, fix it"*.
- Rushed or blunt spoken critique can inadvertently sound harsh and strain peer relationships.

## 🚀 The Solution & The "Wow Moment"

1. **Highlight a messy 20-line function** in your editor (e.g. an $O(n^2)$ nested dictionary scan with missing null guards).
2. **Speak naturally for 8 seconds**:
   > *"By the way this loop has an O(n^2) bottleneck. Suggest swapping this dictionary lookup to a hash set and adding early returns for null checks like this."*
3. **Instant Transformation**:
   - **Tone Harmonizer**: Normalizes blunt, rushed thoughts into constructive, clean peer review prose (+63% politeness).
   - **Voice-to-Diff Engine**: Generates an exact, syntax-checked GitHub ```` ```suggestion ```` block with linear $O(n)$ complexity and guard clauses.
   - **Placement Board**: Anchors the suggestion to the PR hunk (`@@ -11,18 +11,18 @@`) for one-click posting or local VS Code buffer patching!

---

## 🎛️ Key Features

### 1. 🎙️ Voice-to-Diff Engine
- Native Web Speech API recognition + Web Audio oscilloscope visualizer.
- Generates valid, GitHub-compatible ```` ```suggestion ```` markdown diff blocks.
- Real-time line hunk coordinate anchoring (`L11–L28`).

### 2. 🕊️ Tone Harmonizer
- **Diplomatic & Mentoring**: Encouraging, educational, explains algorithmic impact before suggesting the fix.
- **Direct & Concise**: High-signal, zero-fluff review for fast production cycles.
- **Senior Staff Architect**: Focuses on system throughput, operational SLAs, and defensive invariants.
- **Socratic Inquiry**: Asks guiding architectural questions while offering the full solution.
- **Toxicity Filter**: Eliminates aggressive verbal idioms and translates them into constructive engineering rationale.

### 3. 📋 Review Placement Board
- Staging ledger for multiple suggestions across files.
- Visual side-by-side diff viewer (red deletions, green additions).
- Dual destination:
  - **Post to GitHub PR**: Attaches to the PR review thread for 1-click commit by the author.
  - **Direct Apply to VS Code**: Instantly patches your local editor file with celebratory feedback.

### 4. 💻 VS Code Desktop Companion Dock
- Floating desktop HUD pill that tracks active file and cursor anchor.
- Push-to-talk shortcut support.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation & Run

```bash
# Clone repository
git clone https://github.com/Swa-Mi/flowaudit.git
cd flowaudit

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8
- **Styling**: Vanilla CSS (Custom tokens, glassmorphism, glowing audio visualizer, GitHub dark theme)
- **Audio & Speech**: Web Audio API Synthesizer & Web Speech API
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

---

## 📄 License

MIT © [Swa-Mi](https://github.com/Swa-Mi)
