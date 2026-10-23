# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bangladeshi individual residential landlords and homeowners managing 1–15 rental units (flats, sublets, or small commercial shops) in Dhaka and urban hubs across Bangladesh. They currently rely on paper khata (খাতা), physical cash receipts, and manual notes, needing frictionless mobile logging, clear tenant accountability, and instant WhatsApp receipts without enterprise complexity.

## Product Purpose

Eliminate manual paper ledger chaos, delayed rent collection, and contentious utility disputes by providing an automated, culturally grounded property and rental management platform with native BDT currency (৳), bKash/Nagad reconciliation, 1-click WhatsApp receipts, and legal tenancy notice generation.

## Positioning

The only property-tech SaaS built specifically for Bangladeshi tenancy realities—supporting authentic dual-language operations (Bangla & English), BDT currency formatting (৳), local payment methods (bKash, Nagad, Rocket, Bank transfer), printable A4 rent notices conforming to local tenancy norms, and localized utility cost apportioning (water, gas, electricity, service charge).

## Operating Context

- Monthly billing cycles aligned with local salary cycles (typically 1st to 10th of each calendar month).
- Daily landlord communications conducted via WhatsApp, SMS, and printed receipts.
- Payment collections through mobile financial services (MFS: bKash, Nagad, Rocket) and direct bank deposits.
- Tenancy documentation: A4 tenant verification notices, police verification forms, and stamped rent receipts.

## Capabilities and Constraints

- **Capabilities**: Multi-property & unit hierarchy, tenant profiles with NID verification tracking, automated monthly rent & utility bill generation, partial payment tracking with outstanding balance calculation, one-click WhatsApp receipt dispatch, PDF/print-ready A4 receipts, and financial analytics with ledger CSV exports.
- **Technical Constraints**: Next.js App Router (TypeScript, Tailwind CSS, TanStack Query, Zustand) paired with NestJS REST API and PostgreSQL. Bilingual i18n (Bangla first-class + English). Strict data privacy and encrypted tenant records.

## Brand Commitments

- **Brand Name**: BariVara (বাড়িভাড়া)
- **Voice**: Respectful, professional, highly transparent, trustworthy, and culturally authentic.
- **Visual Anchors**: Primary Emerald (`#12664F`), Deep Teal (`#307473`), Electric Cyan (`#2DC2BD`), Ice Blue (`#C6D4FF`), Neutral Paper (`#FAFAF9`), and Dark Navy (`#0A1118`).
- **Strict Brand Policy**: Zero tolerance for generic purple gradients or foreign SaaS tropes.

## Evidence on Hand

- Fully implemented NestJS REST API with PostgreSQL schema ([barivara-api](file:///Users/ashrafulasif/My%20projects/Barivara/barivara-api)).
- Live Next.js web application with authenticated dashboards, tenant registers, billing pipelines, and receipt printers ([barivara-web](file:///Users/ashrafulasif/My%20projects/Barivara/barivara-web)).
- Canonical design tokens and architectural rationale documented in [DESIGN.md](file:///Users/ashrafulasif/My%20projects/Barivara/DESIGN.md).

## Product Principles

1. **Trust Over Flash**: Financial clarity, accurate math, and privacy outrank superficial embellishments.
2. **Culturally Grounded**: Native Bangla typography and local tenancy workflows feel instantly familiar to local landlords.
3. **One-Tap Accountability**: Every transaction generates a clear, shareable, verifiable trail for both landlord and tenant.
4. **Resilient Simplicity**: Complex tenancy logic (service charges, meter splits, advance rent deductions) resolved in intuitive 2-step interfaces.

## Accessibility & Inclusion

- Bilingual interface with seamless 1-click switcher between বাংলা and English.
- High-contrast typography designed for diverse screen qualities and daylight readability.
- Full mobile responsiveness ensuring landlords can log payments and send receipts directly from their smartphones.
