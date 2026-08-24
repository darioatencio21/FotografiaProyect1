# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: couples (novios/novias), families, and graduation clients seeking a luxury photography experience. They arrive emotionally invested — engaged, expecting a child, celebrating a milestone — and are choosing the photographer who will preserve a once-in-a-lifetime moment.

Secondary audience: the studio administrator who manages bookings, galleries, client accounts, invoices, and site content through the admin CMS.

## Product Purpose

Miriam Tellez Photography is a fine-art photography studio that offers editorial-quality portraiture, wedding coverage, fashion/editorial sessions, and family/graduation documentation. The website serves as both a portfolio and a booking platform: it must convince prospective clients of the studio's artistic caliber, allow them to browse galleries, learn about services, book sessions, and manage their client portal — all while embodying the warmth, craft, and elegance of the brand.

## Positioning

Not a template photography site. Every element — from the typography and pacing to the lightbox and booking flow — communicates that the work behind the lens is museum-grade, and the experience of working with Miriam is as considered as the final print.

## Operating Context

- Prospective clients browse on mobile (Instagram referrals) and desktop.
- Booking flow spans service selection → calendar → contract → deposit.
- Admin CMS is used daily on desktop for managing bookings, content, and client communication.
- Edge functions handle email reminders and automation.
- Supabase provides auth, database, and storage.

## Capabilities and Constraints

Confirmed:
- Public portfolio with category filtering and lightbox
- Service browsing with package selection
- Booking calendar with time-slot selection
- Client portal for proofing galleries and contract signing
- Blog with markdown content
- Admin CMS for CRUD on all content types
- Multilingual: English (default), Spanish, Portuguese
- Stripe payment integration for deposits
- Contract generation (wedding and session types)
- Invoice management
- Testimonial submission with moderation
- Instagram feed integration
- SEO metadata management

Technical constraints:
- React 19 + Vite 6 + Tailwind CSS v4
- Supabase for backend (auth, DB, storage)
- Motion library for animations
- Supabase Edge Functions + Resend for contact/auto-reply emails
- No SSR — fully client-side rendered SPA

## Brand Commitments

- Studio name: **Miriam Tellez Photography** (always rendered in its established visual form)
- Logo: the existing SVG logo with its rose-gold-maroon gradient is a durable asset and must be preserved, not redesigned
- Voice: warm, elegant, understated — never hype, never generic "photography template"
- Editorial positioning: fine-art, museum-grade craft, emotional storytelling
- Current navigation structure (fixed header with clear section links) works for the audience and must be preserved

## Evidence on Hand

- Three mock bookings with realistic client data in INITIAL_BOOKINGS
- Several mock messages with editorial inquiry content
- Full set of mock services, packages, testimonials, blog posts, FAQs
- Photograph collection with EXIF metadata and color palettes
- Contract templates for wedding and session types
- Invoice templates with Stripe payment integration

## Product Principles

1. **The work leads.** Every design decision must first serve the photography. The interface recedes so the images speak.
2. **Feelings before features.** Clients book because of how the site makes them feel — confident, moved, excited. Booking utility must never compromise that emotional arc.
3. **Warmth is the differentiator.** In a category full of cold templates, the site must feel warm, personal, and crafted — even in a dark color scheme.
4. **Multilingual by default.** Every surface works in English, Spanish, and Portuguese without feeling like a translation afterthought.
5. **Admin is a tool, not a showcase.** The CMS prioritizes efficiency and clarity over expression.

## Accessibility & Inclusion

- Multilingual by design (EN/ES/PT)
- Reduced motion support via prefers-reduced-motion
- Keyboard-navigable booking and gallery flows
- High-contrast text on all surfaces (minimum 4.5:1)
