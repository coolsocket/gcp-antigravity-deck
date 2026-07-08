# 🪄 Editable Deck Custom Skill

This is a complete, self-contained **Antigravity Custom Skill** package that equips any developer or AI agent with the exact tools and guidelines to run a **live-editable, auto-persisting, and self-recompiling Reveal.js slide presentation**.

## 📦 What's Included?
*   `SKILL.md`: The core instruction file loaded by Antigravity and external peer agents to understand the editing protocols and directories.
*   `scripts/server.py`: A native, zero-dependency Python 3 HTTP server that hosts the presentation and exposes the `/api/save-slide` auto-persistence endpoint.
*   `scripts/compile_deck.py`: A slide aggregator script that merges individual HTML slide fragments into a single standalone `index_offline.html` deck.
*   `references/editable-client.js`: The frontend controller that attaches event listeners to `contenteditable="true"` elements, handles typing debounces, prevents keyboard event bubbling from disrupting Reveal.js, and animates a pulsing save indicator.
*   `references/boilerplate.html`: A beautiful, premium slide fragment template showing co-branding margin safe zones, dark-mode gradients, Outfit & Inter typography, and metric grids.

---

## 🚀 How to Share & Install

### Option A: Share via Workspace (Project-Specific Scope)
Copy the `editable-deck` directory to your project's local agent folder:
```bash
cp -r editable-deck /your/other-project/.agent/skills/editable-deck
```
*Any Antigravity Agent working in that project will immediately inherit and follow these guidelines.*

### Option B: Install Globally (Universal Scope)
To make this skill available across all your local workspaces and Antigravity chat sessions, copy it to your global skills directory:
```bash
cp -r editable-deck ~/.gemini/skills/editable-deck
```

---

## 💻 How to Run the Live Editor

1.  **Initialize slide fragments**:
    Create a `slides/` directory in your project root and drop `slide-*.html` fragments (e.g., using `references/boilerplate.html` as a template).
2.  **Start the Local Server**:
    Run the Python server:
    ```bash
    python3 scripts/server.py
    ```
3.  **Present and Edit Live**:
    *   Open your browser to **`http://localhost:8000`**.
    *   To edit any content, simply click/double-click on headings, text, or metrics, and type.
    *   The top-right **floating indicator** will transition from green (`Saved to Disk`) to yellow (`Saving changes...`).
    *   Stop typing for 1 second, and the changes are written directly to your physical `slides/slide-X.html` file on disk and recompiled to `index_offline.html` instantly!
