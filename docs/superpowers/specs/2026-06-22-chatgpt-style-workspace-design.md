# ChatGPT-Style Compliance Workspace Design

## Objective
Redesign the web demo so it feels like a calm ChatGPT-style product workspace for reviewing synthetic media compliance requests. The redesign should make the project feel more like a usable compliance tool than a marketing page, while keeping the existing fictional AI actor platform scenario, scoring logic, and report artifacts.

This is an interaction and presentation redesign. It should not copy ChatGPT branding, logos, names, or proprietary interface details.

## Design Direction
Use a three-zone app layout:

- Left sidebar: project navigation, artifact links, scenario presets, and repository link.
- Center workspace: conversational intake flow, with assistant-style prompts, user-selected answers, step status, and a compact bottom composer/action bar.
- Right assessment panel: live readiness, selected scenario summary, risk status, missing requirements, region duties, and report generation state.

The first screen should feel like an app, not a landing page. A small project identity header can remain, but the main value should be the workspace.

## Interaction Model
The current multi-step form remains the source of truth, but it should be presented as a guided review conversation:

- The assistant introduces the review task and asks for request context.
- Each intake stage appears as a focused message/card instead of a generic form block.
- Preset scenarios become quick-start chips in the sidebar or welcome message.
- The "Generate compliance report" action appears only when the required intake fields are ready.
- After report generation, the output appears as an assistant-generated report artifact with clear modules.

The user should understand the workflow without reading instructions.

## Report Presentation
The generated report should feel like a structured assistant output:

- Executive snapshot
- Scenario classification
- Key risk drivers
- Control recommendations
- Jurisdiction requirements
- Evidence package and next actions
- Framework mapping

The report can use the existing data and scoring functions. The redesign should improve hierarchy, scannability, and perceived realism, not invent new legal analysis in this pass.

## Visual System
The visual language should be:

- Light, calm, product-like, and text-forward.
- Rounded but restrained.
- Soft neutral surfaces with a single blue accent.
- Subtle motion for message entry, panel transitions, active steps, and report reveal.
- No heavy gradients, decorative blobs, or overly cinematic effects.

The interface should feel familiar to users of AI assistant apps while still clearly belonging to this compliance portfolio project.

## Technical Scope
Implementation should stay inside:

- `web/index.html`
- `web/styles.css`
- `web/app.js`

The existing Markdown artifacts, framework mappings, and Python demo should remain unchanged.

## Responsive Behavior
Desktop:

- Left sidebar, center intake/report workspace, and right assessment panel can appear in one app shell.

Tablet:

- Sidebar can collapse into a top rail or compact navigation strip.
- Right assessment panel can move below the center workspace.

Mobile:

- Use a single-column chat flow.
- Sidebar links become compact horizontal chips.
- The report remains readable without horizontal scrolling.

## Acceptance Criteria
- The initial page opens into a ChatGPT-style compliance workspace.
- All intake fields still start blank.
- Existing preset scenarios still populate the intake correctly.
- The generated report still reflects selected regions and scenario risk.
- The report is more modular and assistant-output-like than the current page.
- No horizontal overflow on a 390px-wide mobile viewport.
- `web/app.js` passes syntax check.
- GitHub `main` receives the completed redesign after verification.

