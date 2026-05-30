# Mode: pdf — ATS-Optimized PDF Generation

## Full pipeline

1. Read `cv.md` as the source of truth
2. Ask the user for the JD if it is not in context (text or URL)
3. Extract 15-20 keywords from the JD
4. Detect JD language → CV language (EN default)
5. Detect company location → paper format:
   - US/Canada → `letter`
   - Rest of the world → `a4`
6. Detect role archetype → adapt framing
   - Also detect **academic/research JD**: flag as `research_mode=true` if the JD mentions any of: PhD required, postdoc, research scientist, research engineer, faculty, publications required, citation record, h-index, peer-reviewed, academic lab, university, or lists venues (NeurIPS/ICML/ICLR/CVPR/etc.)
7. Rewrite Professional Summary by injecting JD keywords + exit narrative bridge ("Built and sold a business. Now applying systems thinking to [JD domain].")
8. Select top 3-4 most relevant projects for the job
9. Reorder experience bullets by JD relevance
10. Build competency grid from JD requirements (6-8 keyword phrases)
11. Inject keywords naturally into existing achievements (NEVER invent)
12. Generate full HTML from template + personalized content
13. Read `name` from `config/profile.yml` → normalize to kebab-case lowercase (e.g. "John Doe" → "john-doe") → `{candidate}`
14. Write HTML to `/tmp/cv-{candidate}-{company}.html`
15. Execute: `node generate-pdf.mjs /tmp/cv-{candidate}-{company}.html output/cv-{candidate}-{company}-{YYYY-MM-DD}.pdf --format={letter|a4}`
16. Report: PDF path, number of pages, keyword coverage %

## ATS Rules (clean parsing)

- Single-column layout (no sidebars, no parallel columns)
- Standard headers: "Professional Summary", "Work Experience", "Education", "Skills", "Certifications", "Projects"
- No text in images/SVGs
- No critical info in PDF headers/footers (ATS ignores them)
- UTF-8, selectable text (not rasterized)
- No nested tables
- Distributed JD keywords: Summary (top 5), first bullet of each role, Skills section

## PDF Design

- **Fonts**: Space Grotesk (headings, 600-700) + DM Sans (body, 400-500)
- **Fonts self-hosted**: `fonts/`
- **Header**: name in Space Grotesk 24px bold + gradient line `linear-gradient(to right, hsl(187,74%,32%), hsl(270,70%,45%))` 2px + contact row
- **Section headers**: Space Grotesk 13px, uppercase, letter-spacing 0.05em, color cyan primary
- **Body**: DM Sans 11px, line-height 1.5
- **Company names**: accent purple color `hsl(270,70%,45%)`
- **Margins**: 0.6in
- **Background**: pure white

## Section order (optimized "6-second recruiter scan")

1. Header (large name, gradient, contact, portfolio link)
2. Professional Summary (3-4 lines, keyword-dense)
3. Core Competencies (6-8 keyword phrases in flex-grid)
4. Work Experience (reverse chronological)
5. Projects (top 3-4 most relevant)
6. Education & Certifications
7. Publications (**research_mode only** — see below)
8. Skills (languages + technical)

## Publications section (research_mode=true only)

When `research_mode=true`, populate `{{PUBLICATIONS_SECTION}}` using the **fixed selection rule** below. There is no adaptive/JD-based filtering — the same papers always appear.

### Fixed selection rule

**Journals:** Always include **all** journal articles from `publications.md`, regardless of author position.

**Conference & Workshop papers:** Include every paper that meets **at least one** of these criteria:
1. **First or co-first author** — E. Ceyani is listed first, or marked with \* as co-first author.
2. **Top-tier ML main track** — published at NeurIPS, ICML, ICLR, or AAAI main conference (workshops do not qualify for this criterion alone).

**Working papers:** Include all where E. Ceyani is first author.

The current fixed set from `publications.md`:

| Paper | Type | Reason |
|-------|------|--------|
| MedIA-2024 | Journal | Always (all journals) |
| TMI-2023 | Journal | Always (all journals) |
| FALCON (NeurIPS'25) | Conference | NeurIPS main track |
| FedGrAINS (SDM'25) | Conference | First author |
| SpreadGNN (AAAI'22) | Conference | Co-first + AAAI main |
| FedGraphNN (DPML@ICLR + GNNSys@MLSys'21) | Workshop | Co-first author |
| Bayesian BO WP | Working paper | First author |
| GFlowNets WP | Working paper | First author |

**Excluded regardless of JD:** Conference/workshop papers where E. Ceyani is a middle author and the venue is not a top-tier ML main track (pFLSynth NeurIPS Workshop, ISMRM-2023, ISBI-2023, SIU-2018).

### Render HTML

Split by type: journals first, then conference/workshop, then working papers.
- Bold the candidate's name (**E. Ceyani** or **Emir Ceyani**) in every entry.
- Titles in italic. Venue in italic.
- Counter resets per `<ul>` block — journals [1][2], conferences [1][2][3][4], working papers [1][2] independently.

```html
<div class="section avoid-break">
  <div class="section-title">Selected Publications <a class="pub-fulllist" href="https://scholar.google.com/citations?user=VzqEN78AAAAJ&hl=en">(Full List)</a></div>

  <div class="pub-subhead">Published &amp; Accepted Journal Articles</div>
  <ul class="pub-list">
    <li>Authors (with <strong>E. Ceyani</strong> bolded). "<a href="URL-TO-PAPER"><em>Title.</em></a>" <em>Journal</em>, Year.</li>
  </ul>

  <div class="pub-subhead">Conference Proceedings &amp; Workshops (Peer-Reviewed)</div>
  <ul class="pub-list">
    <li>Authors (with <strong>E. Ceyani</strong> bolded). "<a href="URL-TO-PAPER"><em>Title.</em></a>" <em>Venue'YY</em> (acceptance rate if notable), Year.</li>
  </ul>
</div>
```

**Link rules:**
- The section title must always include `<a class="pub-fulllist" href="SCHOLAR_URL">(Full List)</a>` pointing to the candidate's Google Scholar profile.
- Each publication title must be wrapped in `<a href="..."><em>Title.</em></a>` linking to the paper's canonical URL (journal page, arXiv, conference proceedings). If no URL is available in cv.md, link to the Google Scholar profile instead.
- Read Google Scholar URL from cv.md (header section) or config/profile.yml.

When `research_mode=false`, set `{{PUBLICATIONS_SECTION}}` to an empty string `""` so the block disappears entirely.

## 2-page limit (all CVs)

**Target: 2 pages maximum.** 3+ pages is a hard failure for industry and research roles alike.

If content would overflow 2 pages, trim in this priority order:
1. Cut Turkcell / earliest job to 1 bullet (or remove entirely if space is critical)
2. Reduce projects to **top 3** most JD-relevant; keep descriptions to 1–2 lines max, remove the tech stack line
3. Cut honors to top 3
4. Trim experience bullets: merge related points, cut anything not directly JD-relevant
5. Summary: max 3 lines
6. Do NOT cut publications or education when `research_mode=true`

After generating the HTML, run the PDF and report page count. If > 2 pages, apply the above cuts and regenerate.

## Keyword injection strategy (ethical, truth-based)

Examples of legitimate reformulation:
- JD says "RAG pipelines" and CV says "LLM workflows with retrieval" → change to "RAG pipeline design and LLM orchestration workflows"
- JD says "MLOps" and CV says "observability, evals, error handling" → change to "MLOps and observability: evals, error handling, cost monitoring"
- JD says "stakeholder management" and CV says "collaborated with team" → change to "stakeholder management across engineering, operations, and business"

**NEVER add skills that the candidate does not have. Only reword real experience using the exact JD vocabulary.**

## Template HTML

Use the template in `cv-template.html`. Replace the `{{...}}` placeholders with personalized content:

| Placeholder | Content |
|-------------|-----------|
| `{{LANG}}` | `en` or `es` |
| `{{PAGE_WIDTH}}` | `8.5in` (letter) or `210mm` (A4) |
| `{{NAME}}` | (from profile.yml) |
| `{{PHONE}}` | (from profile.yml — include with its separator only when `profile.yml` has a non-empty `phone` value; omit both `<span>` and `<span class="separator">` otherwise) |
| `{{EMAIL}}` | (from profile.yml) |
| `{{LINKEDIN_URL}}` | [from profile.yml] |
| `{{LINKEDIN_DISPLAY}}` | [from profile.yml] |
| `{{PORTFOLIO_URL}}` | [from profile.yml] (or /es depending on language) |
| `{{PORTFOLIO_DISPLAY}}` | [from profile.yml] (or /es depending on language) |
| `{{GOOGLE_SCHOLAR_URL}}` | Google Scholar profile URL from cv.md header or config/profile.yml `google_scholar` field |
| `{{GOOGLE_SCHOLAR_DISPLAY}}` | `Google Scholar` (display text) |
| `{{LOCATION}}` | [from profile.yml] |
| `{{VISA_LINE}}` | If `visa_status` in profile.yml is non-empty: `<span class="separator">|</span><span>{visa_status}</span>` — otherwise empty string `""` |
| `{{SECTION_SUMMARY}}` | Professional Summary |
| `{{SUMMARY_TEXT}}` | Personalized summary with keywords |
| `{{SECTION_COMPETENCIES}}` | `Research Interests` when `research_mode=true`; `Core Competencies` otherwise |
| `{{COMPETENCIES}}` | `<span class="competency-tag">keyword</span>` × 6-8 |
| `{{SECTION_EXPERIENCE}}` | Work Experience |
| `{{EXPERIENCE}}` | HTML for each job with reordered bullets |
| `{{SECTION_PROJECTS}}` | Projects |
| `{{PROJECTS}}` | HTML for top 3-4 projects |
| `{{SECTION_EDUCATION}}` | Education |
| `{{EDUCATION}}` | Education HTML |
| `{{SECTION_CERTIFICATIONS}}` | Certifications |
| `{{CERTIFICATIONS}}` | Certifications HTML |
| `{{SECTION_SKILLS}}` | Skills |
| `{{SKILLS}}` | Skills HTML |
| `{{PUBLICATIONS_SECTION}}` | Full publications block HTML (academic/research JDs only — set to `""` for all other JDs) |

## Canva CV Generation (optional)

If `config/profile.yml` has `cv.canva_resume_design_id` set, offer the user a choice before generating:
- **"HTML/PDF (fast, ATS-optimized)"** — existing flow above
- **"Canva CV (visual, design-preserving)"** — new flow below

If the user has no `cv.canva_resume_design_id`, skip this prompt and use the HTML/PDF flow.

### Canva workflow

#### Step 1 — Duplicate the base design

a. `export-design` the base design (using `cv.canva_resume_design_id`) as PDF → get download URL
b. `import-design-from-url` using that download URL → creates a new editable design (the duplicate)
c. Note the new `design_id` for the duplicate

#### Step 2 — Read the design structure

a. `get-design-content` on the new design → returns all text elements (richtexts) with their content
b. Map text elements to CV sections by content matching:
   - Look for the candidate's name → header section
   - Look for "Summary" or "Professional Summary" → summary section
   - Look for company names from cv.md → experience sections
   - Look for degree/school names → education section
   - Look for skill keywords → skills section
c. If mapping fails, show the user what was found and ask for guidance

#### Step 3 — Generate tailored content

Same content generation as the HTML flow (Steps 1-11 above):
- Rewrite Professional Summary with JD keywords + exit narrative
- Reorder experience bullets by JD relevance
- Select top competencies from JD requirements
- Inject keywords naturally (NEVER invent)

**IMPORTANT — Character budget rule:** Each replacement text MUST be approximately the same length as the original text it replaces (within ±15% character count). If tailored content is longer, condense it. The Canva design has fixed-size text boxes — longer text causes overlapping with adjacent elements. Count the characters in each original element from Step 2 and enforce this budget when generating replacements.

#### Step 4 — Apply edits

a. `start-editing-transaction` on the duplicate design
b. `perform-editing-operations` with `find_and_replace_text` for each section:
   - Replace summary text with tailored summary
   - Replace each experience bullet with reordered/rewritten bullets
   - Replace competency/skills text with JD-matched terms
   - Replace project descriptions with top relevant projects
c. **Reflow layout after text replacement:**
   After applying all text replacements, the text boxes auto-resize but neighboring elements stay in place. This causes uneven spacing between work experience sections. Fix this:
   1. Read the updated element positions and dimensions from the `perform-editing-operations` response
   2. For each work experience section (top to bottom), calculate where the bullets text box ends: `end_y = top + height`
   3. The next section's header should start at `end_y + consistent_gap` (use the original gap from the template, typically ~30px)
   4. Use `position_element` to move the next section's date, company name, role title, and bullets elements to maintain even spacing
   5. Repeat for all work experience sections
d. **Verify layout before commit:**
   - `get-design-thumbnail` with the transaction_id and page_index=1
   - Visually inspect the thumbnail for: text overlapping, uneven spacing, text cut off, text too small
   - If issues remain, adjust with `position_element`, `resize_element`, or `format_text`
   - Repeat until layout is clean
e. Show the user the final preview and ask for approval
f. `commit-editing-transaction` to save (ONLY after user approval)

#### Step 5 — Export and download PDF

a. `export-design` the duplicate as PDF (format: a4 or letter based on JD location)
b. **IMMEDIATELY** download the PDF using Bash:
   ```bash
   curl -sL -o "output/cv-{candidate}-{company}-canva-{YYYY-MM-DD}.pdf" "{download_url}"
   ```
   The export URL is a pre-signed S3 link that expires in ~2 hours. Download it right away.
c. Verify the download:
   ```bash
   file output/cv-{candidate}-{company}-canva-{YYYY-MM-DD}.pdf
   ```
   Must show "PDF document". If it shows XML or HTML, the URL expired — re-export and retry.
d. Report: PDF path, file size, Canva design URL (for manual tweaking)

#### Error handling

- If `import-design-from-url` fails → fall back to HTML/PDF pipeline with message
- If text elements can't be mapped → warn user, show what was found, ask for manual mapping
- If `find_and_replace_text` finds no matches → try broader substring matching
- Always provide the Canva design URL so the user can edit manually if auto-edit fails

## Post-generation

Update tracker if the job is already registered: change PDF from ❌ to ✅.
