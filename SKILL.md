---
name: gcp-antigravity-deck
version: 2.0.0
description: |
  Autonomously compiles, modifies, designs, and secures the Google Cloud Executive Slide Deck (Reveal.js).
  Enables agents to perform code-level modifications, call local/remote server APIs, and verify pixel-perfect designs.
---

# 🪄 GCP Antigravity Deck: Slide Engineering Custom Skill

This skill equips any AI Agent (including Antigravity and external peer agents) with the precise operational rules, APIs, and design guidelines for autonomously managing the **Google Cloud & Antigravity 2.0 Executive Slide Deck**.

---

## 🏛️ 1. Project Directory Structure
Agents must locate and modify files in these exact directories:
*   **Slide Fragments**: Lowercase kebab-case files `slide-X.html` under `slides/` (e.g., `slides/slide-1.html`).
*   **Static Asset Server**: Handles static assets from the parent workspace.
*   **Stylesheets**: Custom styles belong in `css/variables.css` (Layer 2 tokens) and `css/components.css` (Layer 4 widgets).
*   **Offline Compiled Target**: Single-file offline presentation compiled to `index_offline.html`.

---

## 🚀 2. Core Compilation & Verification Commands

Whenever you make any changes to a slide fragment file under `slides/`, you **MUST** run the corresponding compilation script to generate the portable presentation deck and verify its visual fidelity:

### 1. Compile the Deck (Fragment Aggregator)
Integrate all individual HTML fragments into `index_offline.html` for offline standalone playback:
```bash
python3 compile_deck.py
```

### 2. Run Visual Screenshot Auditing
Start a background Playwright browser, capture a full-resolution render of all 8 slides, and save them as `slide-X-check.png` to verify that there are no overlaps with watermarks or layout breaks:
```bash
python3 take_gcp_screenshots.py
```

---

## 🔒 3. API Gateway & Authentication Handling

Our backend server (`server.py`) exposes custom endpoints for live editing and third-party agent collaboration:

1.  **AI Slide Generation (`POST /api/generate-slide`)**:
    - Takes JSON payload `{"slideNum": X, "prompt": "..."}`.
    - Generates and writes raw `<section>` code, then recompiles the presentation.
2.  **Autonomous A2A Message Gateway (`POST /api/message` or `POST /v1/chat`)**:
    - Standard JSON-RPC 2.0 interface.
    - Allows other agents to send natural language modifications. The server reads the existing slide deck, uses Gemini to surgically edit the target slide, writes it back, compiles the deck, and returns standard handshake responses.
3.  **Authentication Control**:
    - Secured by the `SLIDES_API_KEY` environment variable.
    - When `SLIDES_API_KEY` is active, callers **must** present the token in the `Authorization: Bearer <key>` header or the `X-API-Key: <key>` header.

---

## 🎨 4. Branding & Layout Standards

All modifications and code generation must strictly comply with these rules to protect design aesthetics:
1.  **Watermark Safe Zone Rule**: Avoid putting content in the bottom 15% (vertical 95px height) of the slide, which is reserved for co-branding watermarks. Always apply bottom padding:
    ```css
    padding-bottom: 95px !important;
    ```
2.  **Google Palette Alignment**: Headings/titles use font family `Outfit` with brand colors (`var(--google-blue)`, `var(--google-red)`, `var(--google-yellow)`, `var(--google-green)`). Body copies use `Inter`.
3.  **Keep Elements Editable**: All editable heading, paragraph, list, and span elements must include `contenteditable="true"` to support live user tweaking.
4.  **Bubbling Prevention**: Prevent keystrokes in editable fields from advancing slides by stopping keyboard propagation:
    ```javascript
    element.addEventListener('keydown', (e) => e.stopPropagation());
    ```
