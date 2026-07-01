# GCP Antigravity Deck: AI Slide Engineering Custom Skill

This repository contains the official **GCP Antigravity Deck Custom Skill** for the Gemini CLI and Google Antigravity 2.0 Agentic Platform.

---

## 🪄 About This Skill

The `gcp-antigravity-deck` skill equips AI Agents (including Antigravity and external peer agents) with precise operational rules, compilation scripts, and design/layout standards for managing, compiling, and visually validating the **Google Cloud & Antigravity 2.0 Executive Slide Deck**.

---

## 🚀 How to Install and Use

To load this custom skill into your Antigravity or Gemini CLI environment:

### Option 1: Global Installation
Clone this repository directly into your Global Customizations Root:
```bash
cd ~/.gemini/config/skills/
git clone https://github.com/coolsocket/gcp-antigravity-deck.git
```

### Option 2: Workspace-Specific Installation
Clone this repository into your Workspace Customizations Root:
```bash
cd /your/workspace/path/.agents/skills/
git clone https://github.com/coolsocket/gcp-antigravity-deck.git gcp-antigravity-deck
```

---

## 🏛️ Directory & Features Supported

* **Slide Fragments**: Lowercase kebab-case files `slide-X.html` under `slides/`.
* **Static Asset Server**: Handles static assets from the parent workspace.
* **Stylesheets**: Custom styles belong in `css/variables.css` (Layer 2 tokens) and `css/components.css` (Layer 4 widgets).
* **Offline Compiled Target**: Single-file offline presentation compiled to `index_offline.html`.
