# RentConnect

**One place for renters and landlords to connect, apply, and move forward.**

> **Project status:** Planning / requirements definition  
> **Product name:** RentConnect (working name; subject to change)  
> **Developed by:** QuantumQore  
> **Release scope:** Release 1, delivered through internal milestones

## Overview

RentProfile is a two-sided rental application and collaboration platform for **rental applicants, landlords, and property managers**. It helps applicants build a reusable rental profile, organize properties found elsewhere, manage documents, and follow applications. Landlords receive and review applications, communicate with applicants, and coordinate next steps from a single workspace.

**RentConnect is not a public property-listing marketplace.** It complements existing listing websites by improving the process that follows finding a property.

## The problem

Rental applicants repeatedly enter the same information, send sensitive documents through disconnected channels, and struggle to track applications. Landlords receive fragmented enquiries, incomplete applications, and messages across email and other tools. Both sides lose time and visibility.

## The solution

RentConnect brings the rental application journey into one organized, privacy-conscious workspace:

- **Applicants** create a reusable housing identity, save listings, prepare and track applications, and share documents intentionally.
- **Landlords and property managers** collect applications using property-specific links, review submissions, request information, and manage communication and viewings.
- **Both sides** get clearer status updates, relevant notifications, and a shared record of actions.

## Who uses it?

| Role | Primary goals |
| --- | --- |
| Rental applicant | Build a profile, save properties, apply, share documents, track progress |
| Landlord / property manager | Manage properties, receive applications, review applicants, communicate and schedule |
| Platform administrator | Manage platform operations, content, moderation, and reporting |

Authorization and any additional role distinctions are defined in the Master SRS.

## Release 1 capabilities

The Master SRS organizes the product into the following functional areas:

1. **Identity and onboarding** — registration, authentication, user roles, and account setup.
2. **Rental profile / housing identity** — reusable applicant information.
3. **Saved apartments** — organize and annotate properties discovered on external sites.
4. **Rental fit score** — compare a property with an applicant's stated preferences; **not** a prediction of landlord approval.
5. **Applications** — prepare, submit where supported, and track applications.
6. **Application states and history** — consistent status and event tracking.
7. **Document vault** — secure storage and selective sharing of sensitive documents.
8. **Browser extension and imports** — assist in saving details from external listings.
9. **Landlord workspace** — properties, intake links, and application review.
10. **Application collaboration** — requests, messages, and coordinated next steps.
11. **Applicant discovery and invitations** — opt-in discovery and invitations to specific properties.
12. **Rental network, verification, and references** — trust-oriented interactions with defined safeguards.
13. **Notifications, calendar, and dashboard** — reminders, updates, and scheduling.
14. **Administration and CMS** — operational controls and content management.
15. **Analytics and reporting** — visibility into platform activity and usage.

These are product requirements, **not a claim that the features are already implemented**.

## Key user journeys

### A. Applicant finds a property on another website

1. Finds an interesting property on an external listing site.
2. Saves it to RentConnect, manually or through the browser extension.
3. Reviews its fit against personal preferences.
4. Prepares an application and selects information or documents to share.
5. Submits through a supported channel or records an external application.
6. Tracks progress and follow-up actions.

**Saving a property does not submit an application.** The system must not imply that an external landlord received or reviewed an application without evidence.

### B. Landlord shares an application link

1. Creates or selects a property in the landlord workspace.
2. Shares a property-specific intake link or QR code.
3. Receives applications from interested applicants.
4. Reviews information, requests missing items, and coordinates next steps.

### C. Landlord invites an applicant

1. An applicant explicitly opts in to discovery.
2. An authorized landlord finds a potentially relevant applicant.
3. The landlord sends an invitation tied to a specific property.
4. The applicant decides whether to respond and apply.

**An invitation never automatically submits an application or grants access to private documents.**

## Product principles

- **Privacy by default:** Personal profiles and sensitive documents are not publicly exposed.
- **Explicit consent:** Users control discovery and sharing within the defined product rules.
- **Transparent status:** Distinguish saved, prepared, submitted, invited, and externally tracked activity.
- **Fair representation:** A preference-based fit score is not an eligibility, credit, or acceptance score.
- **International foundation:** Support localization, beginning with German and English, and account for relevant privacy obligations including GDPR.
- **Consistent experience:** Design for responsive web and dedicated mobile app experiences as specified.
- **Accessibility and reliability:** Treat usability, error handling, security, and observability as release requirements.

## Scope boundaries

RentConnect is **not** intended to replace property portals or promise an applicant will secure a home. A public listings marketplace, payments, and speculative AI-driven decisions should not be assumed part of Release 1 unless approved through a documented scope change.

## Documentation and source of truth

The project is governed by two companion documents:

- **Project Overview (non-technical):** Product purpose, problem, solution, target users, and example journeys.
- **Master Software Requirements Specification (SRS):** Detailed functional requirements, business rules, edge cases, acceptance criteria, illustrative data/API contracts, security requirements, end-to-end scenarios, and open decisions.

The **Master SRS is the authoritative requirements reference**. If this README and the SRS differ, raise the discrepancy with the product owner rather than silently choosing an interpretation.

Suggested repository documentation layout (create when adopted):

```text
README.md
 docs/
   product-overview.pdf
   master-srs.pdf
   architecture/
   decisions/
   api/
   testing/
```

## Delivery approach

Release 1 is one planned public release, with internal development milestones. The project manager should turn approved requirements into prioritized work items with clear dependencies, owners, estimates, and acceptance criteria.

For each feature:

1. Confirm the requirement and any open decisions.
2. Document UX flows and relevant API/data contracts.
3. Create tracked implementation and test tasks.
4. Implement with authorization, privacy, validation, and error states.
5. Verify against acceptance criteria and end-to-end scenarios.
6. Obtain review and approval before marking complete.

Do not start implementation on unresolved assumptions that materially affect behavior or security.

## Technical setup

**Technology stack, repository layout, commands, environments, and deployment processes are not confirmed in this README.** The engineering team must document approved choices before publishing setup instructions.

When available, add:

- Prerequisites and supported versions
- Local installation and development commands
- Environment variable names (never secrets)
- Database setup and migration instructions
- Test, lint, and build commands
- Application and extension build instructions
- CI/CD and deployment procedures
- Architecture decisions and service dependencies

> Never commit passwords, API keys, production datasets, or real applicant documents to source control.

## Security and privacy

The engineering implementation must address authentication, role-based access, secure document handling, consent and sharing controls, retention/deletion policies, auditability, and data protection requirements. See the Master SRS for detailed requirements; conduct legal and security review before public launch.

## Team workflow

- All work must be linked to a tracked task with acceptance criteria.
- Record decisions and scope changes in the project documentation.
- Use code review and automated checks before merging.
- Report blockers, security issues, and unclear requirements promptly.
- Keep product, design, backend, frontend, mobile, and QA teams aligned on shared user journeys.

## Open decisions

The Master SRS includes decisions requiring product-owner confirmation. Treat these as pending until explicitly resolved; do not interpret this README as approving any unresolved choice.

## Ownership

**QuantumQore** — product planning and engineering delivery.  
**Product:** RentConnect (working title).  
**Internal use:** This README describes planned functionality and is not a public availability or feature-completion statement.
