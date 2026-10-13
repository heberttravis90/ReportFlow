# ReportFlow Pro — Permit-to-Document Builder
**Status:** Product design approved 2026-10-13  
**Release:** Planned; not yet implemented  
**Scope:** Environmental Compliance / Stack Testing (extendable to other industries)

## Goal
A single client/job record should support the full lifecycle:
**Permit + client requirements → reviewed compliance matrix → proposal → accepted scope → site-specific test plan → field data → final emissions report.**

Users must be able to choose between (a) polished built-in ReportFlow templates and (b) their organization's own company-approved templates. Never silently invent testing requirements or compliance determinations.

## Document types
1. **Testing proposal** — client/facility/source, requested scope, unit/pollutant/method matrix, runs/estimated duration, mobilization/logistics, assumptions, deliverables, price lines, exclusions, approval.
2. **Site-specific test plan** — objective and applicable requirements, facility/unit descriptions, pollutant/method/run schedule, port and traverse details, operating conditions, process-data needs, QA/QC/acceptance checks, schedule, deviations and contacts.
3. **Final emissions test report** — cover and certifications/signatures, source and operating summary, methods, sampling layout, results vs applicable limits, calculations and QA, deviations, appendices, chain-of-custody where applicable, supporting field data.

The templates must show conditional sections and never assume all methods, reporting obligations, regulatory citations, or limit units apply to every source.

## Two template modes
### A. Built-in professional
- Ship at least one versioned ReportFlow default for each document type, including cover, TOC (where appropriate), tables, headings, revision history, branding, and approval fields.
- Populate from normalized job data and accepted compliance items only.
- Support optional modules (instrumental, isokinetic, RATA, FTIR, metals, etc.) selected only when relevant.
- Logo, colors, preparer, client identity, and footer are configurable.

### B. Company template
- Admin/Owner uploads an existing **DOCX** template and maps placeholders; DOCX is the primary editable round-trip format.
- For PDF templates, offer a **layout reference/manual recreation** workflow instead of claiming arbitrary PDFs are safely editable.
- Supported tokens: `{{client.name}}`, `{{facility.name}}`, `{{source.id}}`, `{{job.number}}`, `{{proposal.total}}`, etc., plus repeatable tables and conditional sections.
- Preview before enabling; report unmapped tokens, required-field gaps, unsupported formatting, font fallback, and broken tables.
- Approve, version, activate, archive, and roll back company templates. Existing finalized documents retain their original template version.
- Company templates belong to that company; no cross-tenant visibility.

## User experience
- Navigation: Environmental Compliance → **Document Builder**; an Admin-only **Template Library** is available in Company Settings.
- New Document: choose job/client/source → document type → built-in/company template → inspect reviewed requirements → generate **Draft** → edit/annotate → send for review → approve/finalize → export Word/PDF.
- No repeated entry of accepted job data. Each document maintains a snapshot of values and sources used at generation.
- Generated prose remains editable. Edits do not silently change the underlying approved permit requirements.
- Allow a PM to copy a proposal's approved scope into its test plan; carry final test data and approved deviations into the final report.

## Permit and requirement extraction (future AI pipeline)
Input: uploaded permit PDF, permit amendments, client scope/PO, prior test plan/report, relevant job data. OCR only when source text cannot be extracted reliably.

### Extract into a **review matrix**, not directly into finalized documents
Minimum fields:
- file ID, filename, version/hash, uploaded by, source page/section/condition number, quoted evidence range
- facility, unit/emission point, pollutant/parameter
- source condition (permit, client request, regulatory rule, approved deviation)
- cited testing method (if explicit); method alternative flag
- testing frequency, required runs/duration, operating condition, limits and **units/basis**
- reporting/submittal requirements/deadlines **if stated**
- extraction confidence and status: Proposed / Needs Review / Accepted / Rejected
- reviewer ID, timestamp, notes, superseded-by references.

**Rules:**
- AI may propose interpretations, but cannot fabricate a method, numeric limit, test frequency, compliance status or permit clause.
- If the permit is ambiguous, missing, superseded, or conflicts with client directions, flag for professional review.
- Cite exact source pages/conditions next to extracted requirements.
- Distinguish enforceable permit conditions from informational citations and client preferences.
- Confirm governing regulation and reporting pathway per job: Part 60, Part 63, Part 75, ERT/CEDRI requirements, state-specific conditions, etc., only where actually applicable.
- For final reports, separate measured results and verified calculations from AI-written narrative. Never let narrative generation modify measured data.
- Requirement sign-off is mandatory before use in a document marked Final.

## Roles and permissions (must be enforced on the server)
| Role | Select approved template | Edit document draft | Approve document | Manage company templates |
| --- | --- | --- | --- | --- |
| Owner/Admin | Yes | Yes | Yes | Yes |
| Manager / Project Manager | Yes | Yes | Yes, if company policy allows | No |
| Analyst / Team Lead | Yes | Yes, within assignment | No by default | No |
| Viewer | Read released documents | No | No | No |

The current static application's `rolePreview` and `localStorage` are **not security controls**. They may remain demo conveniences, but customer permit files, template storage, sharing, and role enforcement must migrate to authenticated server APIs with tenant-scoped authorization.

## Recommended backend model
- **companies** (tenant boundary), **users**, **memberships**, **roles**
- **clients**, **facilities**, **emission_units**, **jobs**, **job_scope_lines**
- **source_documents** (file metadata, hash, versions, access controls)
- **permit_requirements** (citation, status and review history)
- **templates** (document type, owner company or global default, DOCX object path, version, mapping, approval)
- **generated_documents** (job, template/version, document type, state, author, frozen inputs)
- **document_revisions**, **approvals**, **audit_events**
- **test_runs**, **method_results**, **calculation_checks**, **deviations** (connect existing report/QA imports later).

All tenant-owned objects must be keyed to and checked against authenticated `company_id` on the server. Use private object storage, short-lived signed access, safe file-type checks, antivirus/sandboxed conversion as needed, protected API secrets, encryption, backup and retention policies. No client permit text or proprietary company template in the public GitHub repository or static website bundle.

## Document generation stack
- Treat template files as **DOCX**, not HTML disguised as Word files.
- Use a server-side DOCX templating engine with placeholder/repeating-section support; generate a native editable .docx.
- Convert DOCX to PDF server-side using a tested renderer; preserve layout, page breaks, tables, images and optional signatures.
- Validate exports in automated regression tests using representative proposal, plan, and final-report templates.
- A browser print-to-PDF preview can supplement export, but is not a substitute for actual DOCX rendering.

## Release milestones
### Milestone 0 — Security foundation
- Auth, organization membership, tenant-scoped APIs/storage, audit log, document/file security.
- Replace role-preview controls for production operations; preserve preview mode for demo/test only.
- Acceptance: a user from company A cannot list, fetch, guess URL, or modify company B's files or templates.

### Milestone 1 — Template library and manual document builder
- Create versioned built-in proposal, site test plan and final report templates.
- Admin DOCX upload, placeholder mapping, preview, approval and publishing.
- PM selects default/approved company template; enters structured scope and optional vetted text.
- Draft review/edit/finalize; verified DOCX/PDF export.
- Acceptance: each document type exports properly from both template modes with no leftover placeholders; custom formatting is regression-tested.

### Milestone 2 — Permit intelligence
- Upload PDFs and client requirements, extract text, identify candidate requirements, display exact page/condition evidence.
- Approve/reject items with audit, conflict warnings and mandatory review.
- Acceptance: no unsourced requirements automatically become approved, including when OCR confidence is low.

### Milestone 3 — Proposal → plan → report connection
- Reuse approved scope and requirement matrix for the test plan.
- Bind approved test runs, calculations, QA/QC, operating data and deviations to final reports.
- Permit limits remain explicitly typed with measurement unit, wet/dry and O2 correction basis.
- Acceptance: report result tables reconcile to verified imports; changes after approval create a new revision and trigger review.

### Milestone 4 — Compliance exports and automation
- Applicable ERT/CEDRI packages/exports where required; client-specific reporting packs; enterprise workflows.
- Verify exact format and rule-version requirements before claiming compliance support.

## Non-goals for initial release
- Fully autonomous compliance advice, automatically signed submissions, unreviewed permit interpretations.
- Claiming arbitrary company PDF formats can be edited losslessly.
- Claiming secure multi-company data segregation while only using browser localStorage.
- Replacing approved field calculations or independent QA/QC.

## QA and acceptance examples
1. Proposal: client requests Method 5 and a gas method for one unit, but permit has a conflicting operating-load requirement. System flags conflict; PM approves scope before generation.
2. Site test plan: two units have different limits and methods; neither requirement may bleed into the other's sections.
3. Final report: a rejected RATA run is never labeled passing just because an AI narrative sounds positive.
4. Company DOCX uses unfamiliar typography and a table layout; preview shows missing placeholders, and exported DOCX remains editable.
5. Replacing a company template does not retroactively change already-finalized document revisions.
6. All generated documents show source-file references for cited regulatory/permit requirements.
7. Admin company B cannot read company A's permit, company templates, or files through any API or direct object URL.

## Design decisions
- **Approved:** support both ReportFlow built-in defaults and uploaded company-made templates.
- **Approved:** document types are testing proposal, site-specific test plan and final emissions report.
- **Approved:** shared job data across proposal → test plan → final report.
- **Approved:** template management for Admin/Owner; PM chooses approved templates.
- **Approved:** editable Word and PDF outputs, with a human approval step for technical decisions.
- **Open implementation question:** preferred authenticated hosting/database/file storage for secure multi-tenant delivery (not settled by this specification).
