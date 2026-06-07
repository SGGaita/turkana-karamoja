# DRC Climate Change Knowledge & Information Hub — System Analysis
**Based on:** Terms of Reference (TOR) — CT Consultancy 01  
**Client:** Danish Refugee Council (DRC) Kenya  
**TOR Date:** 21 June 2022 | **Revised Deadline:** 27 February 2026  
**Consultancy Period:** March – May 2026

---

## 1. Project Overview

The DRC requires a **digital climate change information and knowledge-sharing platform** for the Karamoja cross-border cluster between Kenya and Uganda. The platform is intended to:

- Cascade climate information and early warning system (EWS) alerts to vulnerable communities
- Support pastoral communities in Turkana and Pokot counties (Kenya) and Moroto district (Uganda)
- Bridge humanitarian assistance with long-term climate resilience and conflict prevention
- Serve government agencies, county directorates, and communities with relevant, accessible climate data

---

## 2. Target Geographies

The system must support **three distinct regional deployments**, each with cloned and customised instances:

| Region | Country |
|---|---|
| Turkana County | Kenya |
| Pokot County | Kenya |
| Moroto District | Uganda |

> **Note:** The TOR inconsistently references Garissa and Mandera counties in some sections. The confirmed scope covers Turkana, Pokot, and Moroto.

---

## 3. Core System Requirements

### 3.1 Web Platform

| Requirement | Detail |
|---|---|
| Design approach | Mobile-first, responsive, dynamic |
| Performance | Must score well on all Core Web Vitals |
| Visual identity | Must reflect DRC branding + respective county branding (logos, fonts, colours to be provided) |
| Progressive Web App (PWA) | Required — push notifications + offline browsing support |
| Social media integration | Facebook, LinkedIn, Twitter |

### 3.2 Content Management System (CMS)

| Requirement | Detail |
|---|---|
| Type | **Headless WordPress** (CMS/backend) + **Next.js** (frontend framework) |
| Editorial workflow | Simple CRUD (Create, Read, Update, Delete) interface |
| User roles | Administrators, government content editors, DRC staff |
| Content types | Climate alerts, EWS information, documents (downloadable), county-specific updates |

### 3.3 Multi-Instance Architecture

- The source code must be **cloned and customised** to serve each of the 3 county/district deployments independently
- Each instance must handle its own branding, content, and climate data feed

### 3.4 Analytics & Measurement

The platform must integrate with **Google (Looker) Studio** and report on:

- Website usage (sessions, users, page views)
- Content engagement (documents downloaded, time on site)
- Most popular pages and downloads (via server log monitoring)
- Regular web ranking reports

### 3.5 Security

| Requirement | Detail |
|---|---|
| Plugin & API security | All integrations must be secured |
| Penetration testing | Must be completed before go-live hosting |
| Backup | Automated full backups maintained throughout the contract |
| Uptime monitoring | Automated checks; rollback to backup when necessary |
| Broken link detection | Automated hyperlink testing system |

### 3.6 SEO

- Keyword research and analysis
- Competitive analysis
- Site content and HTML code optimisation
- Search engine submission (free search engines)
- Link exchange
- Web ranking reports

---

## 4. Key Platform Features (Functional)

### 4.1 Climate Information Hub
- Repository for climate change knowledge resources
- Downloadable documents (reports, advisories, guidelines)
- Integration with national government climate directorates and ministries

### 4.2 Early Warning System (EWS) Alerts
- Mechanism for generating and cascading climate change alerts
- Push notification capability (via PWA)
- Targeted by county/district

### 4.3 Offline Access
- Full or partial offline browsing via PWA caching strategies
- Designed for low-connectivity environments (pastoralist communities in arid regions)

### 4.4 Interactive Maps
- The TOR references interactive maps as a desired feature for visualising climate and geographic data

### 4.5 Government Content Portal
- Dedicated access for government representatives from relevant climate ministries in Kenya and Uganda to upload and manage content

---

## 5. System Architecture Summary (Inferred)

```
┌─────────────────────────────────────────────────────────┐
│                    DRC Climate Hub                      │
│        (Headless WordPress + Next.js Frontend)          │
├──────────────┬──────────────────┬───────────────────────┤
│  Turkana     │   Pokot County   │   Moroto District     │
│  County (KE) │   (KE)           │   (UG)                │
├──────────────┴──────────────────┴───────────────────────┤
│  Features: EWS Alerts | Climate Docs | Interactive Maps │
│  PWA (Offline) | Push Notifications | Social Media      │
├─────────────────────────────────────────────────────────┤
│  CMS: Headless WordPress (REST API / WPGraphQL)         │
│  Frontend: Next.js (SSR + SSG)                          │
│  Analytics: Google Looker Studio                        │
│  Security: Pen-tested | Automated Backups               │
└─────────────────────────────────────────────────────────┘
```

---

*Document prepared from TOR analysis — DRC Climate Change Knowledge Hub, Karamoja Strong Project.*