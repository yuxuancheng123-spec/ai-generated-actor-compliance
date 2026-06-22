# ChatGPT-Style Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the web demo into a ChatGPT-style compliance review workspace while preserving existing scoring logic and keeping work isolated on `chatgpt-style-workspace-redesign`.

**Architecture:** Keep the static HTML/CSS/JS app. Replace the marketing-first page structure with an app shell: left sidebar, center guided intake conversation/report stream, and right live assessment panel. Reuse the existing form names, preset data, assessment functions, and report rendering targets so behavior remains stable.

**Tech Stack:** Static HTML, native CSS, vanilla JavaScript, local Python HTTP server for verification, in-app browser for visual QA.

## Global Constraints

- Work only on branch `chatgpt-style-workspace-redesign`.
- Do not merge into `main`.
- Implementation stays inside `web/index.html`, `web/styles.css`, and `web/app.js`.
- Existing Markdown artifacts, framework mappings, and Python demo remain unchanged.
- All intake fields must start blank.
- Existing preset scenarios must still populate intake correctly.
- Generated report must still reflect selected regions and scenario risk.
- No horizontal overflow on a 390px-wide mobile viewport.
- `web/app.js` must pass syntax check.

---

### Task 1: App Shell Markup

**Files:**
- Modify: `web/index.html`

**Interfaces:**
- Consumes: existing IDs and names used by `web/app.js`, including `risk-form`, `intake-view`, `report-view`, `workflow-mode`, `completion-score`, `missing-list`, all form element names, and all report section IDs.
- Produces: app-shell classes for CSS: `chatgpt-shell`, `workspace-sidebar`, `conversation-panel`, `assessment-sidebar`, `assistant-message`, `user-message`, `composer-bar`.

- [ ] **Step 1: Replace marketing-first layout with workspace layout**

Update `web/index.html` so the first viewport contains:

```html
<main id="top" class="chatgpt-shell">
  <aside class="workspace-sidebar" aria-label="Project navigation">...</aside>
  <section class="conversation-panel" aria-label="Compliance review conversation">...</section>
  <aside class="assessment-sidebar" aria-label="Live assessment">...</aside>
</main>
```

Keep all existing form fields and report IDs inside the center and right zones.

- [ ] **Step 2: Preserve form and report contracts**

Confirm these selectors still exist exactly once:

```text
#risk-form
#intake-view
#report-view
#workflow-mode
#generate-report
#edit-intake
#scenario-profile
#risk-driver-list
#jurisdiction-matrix
```

- [ ] **Step 3: Add assistant-style copy**

Use concise copy:

```text
Welcome. I can turn a synthetic media request into a consent, labeling, and release review.
Complete the intake below, then generate a structured compliance report.
```

### Task 2: ChatGPT-Style Visual System

**Files:**
- Modify: `web/styles.css`

**Interfaces:**
- Consumes: class names from Task 1.
- Produces: desktop three-column shell, tablet two-column fallback, mobile single-column flow, message cards, sticky sidebars, composer bar, report output styling.

- [ ] **Step 1: Define app tokens**

Use neutral light product tokens:

```css
:root {
  --ink: #0f0f0f;
  --muted: #6b6f76;
  --surface: #ffffff;
  --canvas: #f7f7f5;
  --rail: #f0f0ee;
  --line: rgba(15, 15, 15, 0.1);
  --accent: #006fed;
  --radius: 14px;
}
```

- [ ] **Step 2: Build shell layout**

Desktop:

```css
.chatgpt-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 340px;
  min-height: 100dvh;
}
```

Mobile:

```css
@media (max-width: 760px) {
  .chatgpt-shell {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Style conversation and report**

Make intake fieldsets look like assistant cards, and report modules like generated assistant output. Keep labels above inputs and avoid placeholder-as-label.

### Task 3: Interaction Polish

**Files:**
- Modify: `web/app.js`

**Interfaces:**
- Consumes: existing state functions `getScenario`, `assessScenario`, `render`, `showReport`, `showIntake`, `applyPreset`.
- Produces: improved workspace state classes and updated status text, without changing scoring logic.

- [ ] **Step 1: Add app state class toggles**

In `showReport`, add a body or shell state class:

```js
document.body.classList.add("report-generated");
```

In `showIntake`, remove it:

```js
document.body.classList.remove("report-generated");
```

- [ ] **Step 2: Improve preset feedback**

When `applyPreset` runs, keep current behavior and update the workflow mode text to:

```text
Preset loaded
```

Then `render()` continues to update readiness.

- [ ] **Step 3: Keep report scroll stable**

Retain `reportView.scrollIntoView({ block: "start", behavior: "smooth" })`, with CSS `scroll-margin-top` so the report is not hidden behind sticky UI.

### Task 4: Verification And Branch Commit

**Files:**
- Verify: `web/index.html`, `web/styles.css`, `web/app.js`

**Interfaces:**
- Consumes: completed Tasks 1-3.
- Produces: committed and pushed branch `chatgpt-style-workspace-redesign`.

- [ ] **Step 1: Run syntax and diff checks**

Run:

```bash
/Users/miine/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check web/app.js
git diff --check
```

Expected: both commands exit `0`.

- [ ] **Step 2: Verify browser behavior**

Start local server:

```bash
python3 -m http.server 8006
```

Open:

```text
http://127.0.0.1:8006/web/index.html
```

Check:

```text
Initial intake values are blank.
Preset "Stolen celebrity ad" generates reject/prohibited.
Preset "Licensed performer" generates approve or medium/allowed review state.
Region requirements appear in the generated report.
390px viewport has no horizontal overflow.
```

- [ ] **Step 3: Commit and push branch**

Run:

```bash
git add web/index.html web/styles.css web/app.js docs/superpowers/plans/2026-06-22-chatgpt-style-workspace.md
git commit -m "Redesign web demo as ChatGPT-style workspace"
git push -u origin chatgpt-style-workspace-redesign
```

Expected: branch is pushed without touching `main`.

