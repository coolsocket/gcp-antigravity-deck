---
name: editable-deck
version: 1.0.0
description: |
  Enables any presentation deck based on Reveal.js to support direct in-browser editing (via contenteditable),
  with automatic, debounced background persistence back to the local file system (HTML fragments) and automated recompilation.
---

# 🪄 Editable Deck: Live Editing & Auto-Persistence Custom Skill

This skill equips any AI Agent or developer with the precise guidelines, codebase structure, and scripts to build or manage an interactive, self-persisting, and automatically-recompiled Reveal.js slide deck.

---

## 🏛️ 1. Project Directory Structure
A project conforming to the `editable-deck` skill must follow this exact layout:
```text
project-root/
├── index_offline.html         # Compiled final standalone presentation deck
├── compile_deck.py            # Aggregator script that merges fragments into index_offline.html
├── server.py                  # Local Python server handling auto-save APIs and static file serving
├── slides/                    # Directory containing individual slide fragments
│   ├── slide-1.html           # Fragment for Slide 1
│   ├── slide-2.html           # Fragment for Slide 2
│   └── ...
├── css/                       # Stylesheets
│   ├── theme.css              # Custom Reveal.js presentation theme
│   └── components.css         # UI widgets (e.g., the visual saving status indicator)
└── js/                        # Client-side scripts
    └── editable-client.js     # Automatic event listeners, bubbling prevention, and debounced save
```

---

## 🚀 2. Core Compilation & Verification Commands

Whenever a change is made to slide fragments or manual in-browser edits are triggered:

### 1. Manual Slide Aggregation
To manually merge all slide fragments from `slides/` into the single compiled `index_offline.html`:
```bash
python3 compile_deck.py
```

### 2. Local Live Development Server
To launch the server that handles live rendering and handles auto-saving of physical slide fragments:
```bash
python3 server.py
```
*Once running, open `http://localhost:8000` to present and edit live.*

---

## 🔒 3. API Gateway Contract
The local backend server (`server.py`) must implement the following API endpoint:

### Save Slide Fragment (`POST /api/save-slide`)
*   **Request Format**: `JSON`
*   **Headers**: `Content-Type: application/json`
*   **Payload**:
    ```json
    {
      "slideNum": 1,
      "content": "<!-- Section HTML content -->\n<section>\n  <h2 contenteditable=\"true\">New Title</h2>\n</section>"
    }
    ```
*   **Actions**:
    1. Validate `slideNum` is an integer and `content` is valid HTML.
    2. Write `content` to `slides/slide-<slideNum>.html`.
    3. Trigger `compile_deck.py` internally to refresh `index_offline.html` on disk.
*   **Response**: `200 OK`
    ```json
    {
      "status": "success",
      "message": "Slide 1 updated and deck recompiled."
    }
    ```

---

## 🎨 4. Branding & Live Editing Standards

To preserve design aesthetics and ensure perfect functionality during editing:

1.  **Bubbling Prevention**: You must stop keyboard event propagation on all `contenteditable` elements. Otherwise, keystrokes (like typing Space, backspace, or arrow keys) will trigger Reveal.js slide navigation:
    ```javascript
    element.addEventListener('keydown', (e) => e.stopPropagation());
    ```
2.  **Debounced Autosave**: Auto-saves must be debounced (recommended: 800ms to 1200ms) to avoid over-submitting saving requests during typing.
3.  **Visual Feedback**: Display a subtle, elegant, and interactive floating indicator in the top-right corner to denote saving state:
    - `Idle / Saved`: Small green pulse dot.
    - `Saving...`: Pulsing yellow dot.
    - `Error`: Red static dot with error message.
